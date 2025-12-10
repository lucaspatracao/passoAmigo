import Logger from './logger';

// Verificar se expo-notifications está disponível
// Não fazer require no topo para evitar erro de bundling
let Notifications = null;
let notificationsAvailable = false;
let hasTriedLoad = false;

// Função para carregar notificações de forma segura (lazy loading)
function loadNotifications() {
  if (hasTriedLoad) {
    return notificationsAvailable; // Já tentou carregar
  }

  hasTriedLoad = true;

  // Verificar se estamos em ambiente que suporta notificações
  // No Expo Go, o módulo não está disponível, então simplesmente retornar false
  // sem tentar fazer require (que causaria erro de bundling)
  
  // Em vez de fazer require, vamos verificar se o módulo existe
  // usando uma verificação mais segura que não quebra o bundling
  try {
    // Usar uma função que tenta carregar o módulo apenas quando chamada
    // Isso evita que o bundler tente resolver o módulo no momento do bundling
    const loadModule = () => {
      try {
        // eslint-disable-next-line
        return require('expo-notifications');
      } catch (e) {
        return null;
      }
    };

    const expoNotifications = loadModule();
    
    if (expoNotifications && typeof expoNotifications === 'object') {
      Notifications = expoNotifications;
      notificationsAvailable = true;
      
      // Configurar comportamento das notificações
      try {
        if (Notifications.setNotificationHandler) {
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
            }),
          });
        }
      } catch (configError) {
        Logger.debug('Could not configure notification handler', configError);
      }
      
      return true;
    }
  } catch (error) {
    // Qualquer erro - módulo não disponível (normal no Expo Go)
    Logger.debug('Notifications not available (normal in Expo Go)', error.message);
  }
  
  Notifications = null;
  notificationsAvailable = false;
  return false;
}

/**
 * Solicita permissão para notificações
 */
export async function requestNotificationPermission() {
  // Tentar carregar se ainda não tentou
  if (Notifications === null) {
    loadNotifications();
  }

  if (!notificationsAvailable || !Notifications) {
    Logger.warn('Notifications not available - requires development build');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Logger.warn('Notification permission denied');
      return false;
    }

    Logger.info('Notification permission granted');
    return true;
  } catch (error) {
    Logger.error('Error requesting notification permission', error);
    return false;
  }
}

/**
 * Agenda uma notificação
 */
export async function scheduleNotification(title, body, trigger = null) {
  // Tentar carregar se ainda não tentou
  if (Notifications === null) {
    loadNotifications();
  }

  if (!notificationsAvailable || !Notifications) {
    // Em Expo Go, apenas logar (não mostrar erro)
    Logger.debug('Notification would be shown', { title, body });
    return false;
  }

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: trigger || null, // null = imediato
    });

    Logger.info('Notification scheduled', { title, body });
    return true;
  } catch (error) {
    Logger.error('Error scheduling notification', error);
    return false;
  }
}

/**
 * Notifica quando meta diária é atingida
 */
export async function notifyGoalReached(distance) {
  return await scheduleNotification(
    '🎉 Meta Atingida!',
    `Parabéns! Você atingiu sua meta diária de 1000m. Você caminhou ${Math.round(distance)}m hoje!`
  );
}

/**
 * Notifica quando caminhada é salva
 */
export async function notifyWalkSaved(distance, duration) {
  const minutes = Math.floor(duration / 60);
  return await scheduleNotification(
    '✅ Caminhada Salva!',
    `Sua caminhada de ${Math.round(distance)}m em ${minutes}min foi salva com sucesso!`
  );
}

/**
 * Cancela todas as notificações
 */
export async function cancelAllNotifications() {
  if (!notificationsAvailable || !Notifications) {
    return;
  }
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    Logger.info('All notifications cancelled');
  } catch (error) {
    Logger.error('Error cancelling notifications', error);
  }
}
