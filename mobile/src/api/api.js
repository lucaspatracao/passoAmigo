import Constants from 'expo-constants';
import { loadSettings } from '../storage/settings';
import Logger from '../utils/logger';

// Helper para detectar erros de rede
function isNetworkError(error) {
  return error.message.includes('Network request failed') ||
         error.message.includes('Failed to fetch') ||
         error.message.includes('NetworkError') ||
         error.message.includes('timeout');
}

// Helper para criar erro customizado
class NetworkError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
    this.isNetworkError = true;
  }
}

async function request(path, opts={}, retries = 1){
  const startTime = Date.now();
  const config = await getRuntimeConfig();
  const timeout = 10000; // 10 segundos
  
  try {
    Logger.debug(`API Request: ${opts.method || 'GET'} ${path}`);
    
    // Criar AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    let res;
    try {
      res = await fetch(config.apiBaseUrl + path, { 
        headers:{'Content-Type':'application/json'}, 
        signal: controller.signal,
        ...opts 
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Se foi abortado por timeout
      if (fetchError.name === 'AbortError') {
        throw new NetworkError('Tempo de espera esgotado. Verifique sua conexão.', fetchError);
      }
      
      // Se for erro de rede
      if (isNetworkError(fetchError)) {
        throw new NetworkError('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.', fetchError);
      }
      
      throw fetchError;
    }
    
    const duration = Date.now() - startTime;
    Logger.performance(`API ${opts.method || 'GET'} ${path}`, duration);
    
    if(!res.ok) {
      let errorMessage = `Erro ${res.status}`;
      let errorDetails = null;
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData.errors || null;
      } catch {
        // Se não conseguir parsear JSON, usar mensagem padrão baseada no status
        switch(res.status) {
          case 400: errorMessage = 'Dados inválidos'; break;
          case 401: errorMessage = 'Não autorizado'; break;
          case 403: errorMessage = 'Acesso negado'; break;
          case 404: errorMessage = 'Recurso não encontrado'; break;
          case 409: errorMessage = 'Conflito - recurso já existe'; break;
          case 500: errorMessage = 'Erro interno do servidor'; break;
          case 503: errorMessage = 'Serviço indisponível'; break;
          default: errorMessage = `Erro ${res.status}`;
        }
      }
      
      const error = new Error(errorMessage);
      error.status = res.status;
      error.details = errorDetails;
      
      Logger.apiError(path, error, { 
        status: res.status, 
        method: opts.method || 'GET',
        duration 
      });
      
      throw error;
    }
    
    if(res.status===204) return null;
    return res.json();
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Se for erro de rede e ainda tiver tentativas, tentar novamente
    if (error.isNetworkError && retries > 0) {
      Logger.info(`Retrying request: ${path} (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
      return request(path, opts, retries - 1);
    }
    
    Logger.apiError(path, error, { 
      method: opts.method || 'GET',
      duration,
      isNetworkError: error.isNetworkError || false
    });
    
    // Melhorar mensagem de erro para o usuário
    if (error.isNetworkError) {
      throw new NetworkError(
        'Não foi possível conectar ao servidor. Verifique:\n• Sua conexão com a internet\n• Se o backend está rodando\n• A URL configurada nas Configurações',
        error
      );
    }
    
    throw error;
  }
}

export const Backend={
  async createUser(u){ return request('/api/users',{ method:'POST', body:JSON.stringify(u)}); },
  async listUsers(){ return request('/api/users'); },
  async updateUser(id,u){ return request('/api/users/'+id,{ method:'PUT', body:JSON.stringify(u)}); },
  async deleteUser(id){ return request('/api/users/'+id,{ method:'DELETE'}); },
  async createWalk(w){ return request('/api/walks',{ method:'POST', body:JSON.stringify(w)}); },
  async getWalk(id){ return request('/api/walks/'+id); },
  async listWalksByUser(userId){ return request('/api/walks/user/'+userId); },
  async updateWalk(id,w){ return request('/api/walks/'+id,{ method:'PUT', body:JSON.stringify(w)}); },
  async deleteWalk(id){ return request('/api/walks/'+id,{ method:'DELETE'}); },
};
let cachedConfig;
async function getRuntimeConfig(){
  if(!cachedConfig){
    const extra = (Constants?.expoConfig?.extra) || {};
    const stored = await loadSettings();
    cachedConfig = {
      apiBaseUrl: stored.apiBaseUrl || extra.apiBaseUrl,
      useBackend: typeof stored.useBackend==='boolean' ? stored.useBackend : extra.useBackend,
    };
  }
  return cachedConfig;
}

export function invalidateConfigCache(){
  cachedConfig = null;
}

export async function usingBackend(){
  const cfg = await getRuntimeConfig();
  return !!cfg.useBackend;
}

export async function apiBase(){
  const cfg = await getRuntimeConfig();
  return cfg.apiBaseUrl;
}


