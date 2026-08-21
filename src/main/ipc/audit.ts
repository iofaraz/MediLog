import { ipcMain } from 'electron';
import { AuditService } from '../services/AuditService';

export function registerAuditHandlers() {
  ipcMain.handle('audit:getLogs', async (_event, options: { entityType?: string; action?: string }) => {
    return await AuditService.getLogs(options);
  });
}
