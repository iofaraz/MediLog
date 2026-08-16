import { ipcMain } from 'electron';
import { DashboardService } from '../services/DashboardService';

export function registerDashboardHandlers() {
  ipcMain.handle('dashboard:getStats', async () => {
    try {
      return await DashboardService.getDashboardStats();
    } catch (err) {
      console.error('dashboard:getStats error', err);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  });
}
