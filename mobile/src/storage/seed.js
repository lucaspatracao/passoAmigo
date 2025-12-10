import AsyncStorage from '@react-native-async-storage/async-storage';
import { UsersRepo } from './storage';

const SEED_KEY = 'app_seeded';

/**
 * Usuários pré-definidos para facilitar o uso inicial do app
 */
const DEFAULT_USERS = [
  {
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    avatar: '🚶‍♂️',
    dailyGoalMeters: 1200
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@exemplo.com',
    avatar: '🚶‍♀️',
    dailyGoalMeters: 1000
  },
  {
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@exemplo.com',
    avatar: '🏃‍♂️',
    dailyGoalMeters: 1500
  },
  {
    name: 'Ana Costa',
    email: 'ana.costa@exemplo.com',
    avatar: '🚴‍♀️',
    dailyGoalMeters: 900
  },
  {
    name: 'Carlos Mendes',
    email: 'carlos.mendes@exemplo.com',
    avatar: '🚶‍♂️',
    dailyGoalMeters: 800
  }
];

/**
 * Inicializa o app com dados pré-definidos se ainda não foi inicializado
 */
export async function seedInitialData() {
  try {
    // Verifica se já foi inicializado
    const seeded = await AsyncStorage.getItem(SEED_KEY);
    if (seeded === 'true') {
      return; // Já foi inicializado, não faz nada
    }

    // Verifica se já existem usuários
    const existingUsers = await UsersRepo.list();
    if (existingUsers.length > 0) {
      // Já tem usuários, marca como inicializado mas não cria novos
      await AsyncStorage.setItem(SEED_KEY, 'true');
      return;
    }

    // Cria usuários pré-definidos
    for (const userData of DEFAULT_USERS) {
      await UsersRepo.add(userData);
    }

    // Marca como inicializado
    await AsyncStorage.setItem(SEED_KEY, 'true');
    
    console.log('✅ Dados iniciais criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar dados iniciais:', error);
    // Não lança erro para não quebrar o app
  }
}

/**
 * Reseta os dados de seed (útil para testes)
 */
export async function resetSeed() {
  await AsyncStorage.removeItem(SEED_KEY);
}

