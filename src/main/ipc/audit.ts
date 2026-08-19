import { ipcMain } from 'electron';
import { AuditService } from '../services/AuditService';

export function registerAuditHandlers() {
  ipcMain.handle('audit:getLogs', async (_event, options: any) => {
    return await AuditService.getLogs(options);
  });
}
