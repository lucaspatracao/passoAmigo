import { Clipboard } from 'react-native';
import { UsersRepo, WalksRepo } from '../storage/storage';
import Logger from './logger';

/**
 * Exporta dados para CSV (retorna string CSV)
 */
export async function exportToCSV() {
  try {
    Logger.userAction('Export data to CSV');
    
    const users = await UsersRepo.list();
    const allWalks = [];
    
    // Coletar todas as caminhadas de todos os usuários
    for (const user of users) {
      const walks = await WalksRepo.listByUser(user.id);
      allWalks.push(...walks.map(w => ({ ...w, userName: user.name, userEmail: user.email })));
    }

    // Criar CSV
    let csv = 'ID,Usuário,Email,Distância (m),Data Início,Duração (s)\n';
    
    allWalks.forEach(walk => {
      const date = walk.startTime ? new Date(walk.startTime).toLocaleString('pt-BR') : '-';
      csv += `${walk.id || '-'},${walk.userName || '-'},${walk.userEmail || '-'},${walk.distanceMeters || 0},${date},${walk.duration || 0}\n`;
    });

    // Copiar para clipboard
    await Clipboard.setString(csv);
    Logger.info('CSV exported to clipboard');
    return { success: true, message: 'Dados CSV copiados para a área de transferência!', data: csv };
  } catch (error) {
    Logger.error('Error exporting CSV', error);
    throw error;
  }
}

/**
 * Exporta dados para JSON (retorna string JSON)
 */
export async function exportToJSON() {
  try {
    Logger.userAction('Export data to JSON');
    
    const users = await UsersRepo.list();
    const allWalks = [];
    
    for (const user of users) {
      const walks = await WalksRepo.listByUser(user.id);
      allWalks.push(...walks.map(w => ({ 
        ...w, 
        userName: user.name, 
        userEmail: user.email 
      })));
    }

    const data = {
      exportDate: new Date().toISOString(),
      users: users,
      walks: allWalks,
    };

    const json = JSON.stringify(data, null, 2);
    
    // Copiar para clipboard
    await Clipboard.setString(json);
    Logger.info('JSON exported to clipboard');
    return { success: true, message: 'Dados JSON copiados para a área de transferência!', data: json };
  } catch (error) {
    Logger.error('Error exporting JSON', error);
    throw error;
  }
}
