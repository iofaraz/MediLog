import { ipcMain, dialog, BrowserWindow } from 'electron';
import { BackupService } from '../services/BackupService';

export function registerBackupHandlers() {
  ipcMain.handle('backup:create', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return { success: false, error: 'No active window found.' };

    const { filePath } = await dialog.showSaveDialog(window, {
      title: 'Save Database Backup',
      defaultPath: `medilog_backup_${new Date().toISOString().slice(0, 10)}.db`,
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }],
    });

    if (!filePath) {
      return { success: false, error: 'Backup cancelled.' };
    }

    return await BackupService.createBackup(filePath);
  });

  ipcMain.handle('backup:restore', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return { success: false, error: 'No active window found.' };

    const { filePaths } = await dialog.showOpenDialog(window, {
      title: 'Restore Database Backup',
      properties: ['openFile'],
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }],
    });

    if (!filePaths || filePaths.length === 0) {
      return { success: false, error: 'Restore cancelled.' };
    }

    const sourcePath = filePaths[0];
    return await BackupService.restoreBackup(sourcePath);
  });
}
