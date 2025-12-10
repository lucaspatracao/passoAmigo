import { Alert } from 'react-native';

export function confirm({ title, message, confirmText = 'OK', cancelText = 'Cancelar' }){
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { 
        text: cancelText, 
        style: 'cancel',
        onPress: () => resolve(false)
      },
      { 
        text: confirmText, 
        style: confirmText.toLowerCase().includes('excluir') || confirmText.toLowerCase().includes('deletar') ? 'destructive' : 'default',
        onPress: () => resolve(true)
      }
    ]);
  });
}


