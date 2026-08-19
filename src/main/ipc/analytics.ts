import { ipcMain } from 'electron';
import { AnalyticsService } from '../services/AnalyticsService';

export function registerAnalyticsHandlers() {
  ipcMain.handle('analytics:getDashboard', async () => {
    return await AnalyticsService.getDashboardMetrics();
  });
}
