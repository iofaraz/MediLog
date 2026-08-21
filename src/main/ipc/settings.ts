import { ipcMain } from 'electron';
import { SettingsService } from '../services/SettingsService';

export function registerSettingsHandlers() {
  ipcMain.handle('settings:getAll', async () => {
    return await SettingsService.getAllSettings();
  });

  ipcMain.handle('settings:update', async (_event, newSettings: Record<string, string>) => {
    return await SettingsService.updateSettings(newSettings);
  });
}
