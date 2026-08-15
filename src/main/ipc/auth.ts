import { ipcMain } from 'electron';
import { AuthService } from '../services/AuthService';

export function registerAuthHandlers() {
  ipcMain.handle('auth:login', async (_event, username: string, password: string) => {
    try {
      return await AuthService.login(username, password);
    } catch (err) {
      console.error('auth:login error', err);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  });
}
