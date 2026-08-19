import { ipcMain } from 'electron';
import { AuthService } from '../services/AuthService';

export function registerUserHandlers() {
  ipcMain.handle('users:getAll', async () => {
    return await AuthService.getAllUsers();
  });

  ipcMain.handle('users:create', async (_event, data: any, adminId: string) => {
    return await AuthService.createUser(data, adminId);
  });

  ipcMain.handle('users:update', async (_event, id: string, data: any, adminId: string) => {
    return await AuthService.updateUser(id, data, adminId);
  });

  ipcMain.handle('users:delete', async (_event, id: string, adminId: string) => {
    return await AuthService.deleteUser(id, adminId);
  });
}
