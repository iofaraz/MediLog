import { ipcMain, dialog, BrowserWindow } from 'electron';
import { BackupService } from '../services/BackupService';

export function registerBackupHandlers() {
  ipcMain.handle('backup:create', async (_event, userId: string) => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return { success: false, error: 'No active window found.' };

    const { filePath } = await dialog.showSaveDialog(window, {
      title: 'Save Database Backup',
      defaultPath: `medilog_backup_${new Date().toISOString().slice(0, 10)}.sqlite`,
      filters: [{ name: 'SQLite Database', extensions: ['sqlite'] }]
    });

    if (!filePath) {
      return { success: false, error: 'Backup cancelled.' }; // User cancelled
    }

    return await BackupService.createBackup(filePath, userId);
  });

  ipcMain.handle('backup:restore', async (_event, userId: string) => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return { success: false, error: 'No active window found.' };

    const { filePaths } = await dialog.showOpenDialog(window, {
      title: 'Restore Database Backup',
      properties: ['openFile'],
      filters: [{ name: 'SQLite Database', extensions: ['sqlite'] }]
    });

    if (!filePaths || filePaths.length === 0) {
      return { success: false, error: 'Restore cancelled.' }; // User cancelled
    }

    const sourcePath = filePaths[0];
    return await BackupService.restoreBackup(sourcePath, userId);
  });
}
