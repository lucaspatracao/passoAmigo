// Sistema de logs básico para o app
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLevel = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

class Logger {
  static error(message, data = null) {
    if (currentLevel >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, data || '');
      // Em produção, aqui você poderia enviar para um serviço como Sentry
    }
  }

  static warn(message, data = null) {
    if (currentLevel >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  static info(message, data = null) {
    if (currentLevel >= LOG_LEVELS.INFO) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  static debug(message, data = null) {
    if (currentLevel >= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  // Log específico para ações do usuário
  static userAction(action, data = null) {
    this.info(`User Action: ${action}`, data);
  }

  // Log específico para erros de API
  static apiError(endpoint, error, data = null) {
    this.error(`API Error [${endpoint}]: ${error.message || error}`, {
      endpoint,
      error: error.message || error,
      data
    });
  }

  // Log específico para performance
  static performance(operation, duration, data = null) {
    this.debug(`Performance [${operation}]: ${duration}ms`, data);
  }
}

export default Logger;
