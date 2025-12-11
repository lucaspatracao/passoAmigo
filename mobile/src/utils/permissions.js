import * as Location from 'expo-location';
import { Alert } from 'react-native';
import Logger from './logger';

export class PermissionManager {
  static async requestLocationPermission() {
    try {
      Logger.info('Requesting location permission');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        Logger.info('Location permission granted');
        return { granted: true, status };
      } else {
        Logger.warn('Location permission denied', { status });
        return { granted: false, status };
      }
    } catch (error) {
      Logger.error('Error requesting location permission', error);
      return { granted: false, error: error.message };
    }
  }

  static async checkLocationPermission() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      Logger.debug('Location permission status', { status });
      return { granted: status === 'granted', status };
    } catch (error) {
      Logger.error('Error checking location permission', error);
      return { granted: false, error: error.message };
    }
  }

  static showLocationPermissionAlert(onRetry = null) {
    Alert.alert(
      'Permissão de Localização Necessária',
      'Este app precisa de acesso à sua localização para:\n\n• Registrar caminhadas\n• Calcular distâncias\n• Mostrar rotas no mapa\n\nPor favor, permita o acesso nas configurações do dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        ...(onRetry ? [{ text: 'Tentar Novamente', onPress: onRetry }] : []),
        { 
          text: 'Configurações', 
          onPress: () => {
            Logger.userAction('Open device settings for location permission');
            // Em um app real, você usaria Linking.openSettings()
          }
        }
      ]
    );
  }

  static async requestLocationPermissionWithAlert(onRetry = null) {
    const result = await this.requestLocationPermission();
    
    if (!result.granted) {
      this.showLocationPermissionAlert(onRetry);
    }
    
    return result;
  }

  static async ensureLocationPermission() {
    // Primeiro verifica se já tem permissão
    const currentStatus = await this.checkLocationPermission();
    
    if (currentStatus.granted) {
      return { granted: true, status: currentStatus.status };
    }

    // Se não tem, solicita
    return await this.requestLocationPermissionWithAlert();
  }
}
