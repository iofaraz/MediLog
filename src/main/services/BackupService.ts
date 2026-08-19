import { app } from 'electron';
import { sqlite, dbPath } from '../db';
import { AuditService } from './AuditService';
import fs from 'fs/promises';

export class BackupService {
  static async createBackup(destinationPath: string, userId: string) {
    try {
      await sqlite.backup(destinationPath);
      await AuditService.log({
        userId,
        action: 'CREATE',
        entityType: 'BACKUP',
        entityId: 'backup',
        details: `Created database backup to ${destinationPath}`
      });
      return { success: true };
    } catch (error: any) {
      console.error('Failed to create backup:', error);
      return { success: false, error: 'Failed to create backup: ' + error.message };
    }
  }

  static async restoreBackup(sourcePath: string, userId: string) {
    try {
      // 1. Log the audit first while DB is still open
      await AuditService.log({
        userId,
        action: 'UPDATE',
        entityType: 'RESTORE',
        entityId: 'restore',
        details: `Restored database from ${sourcePath}`
      });

      // 2. Close the current SQLite connection safely
      sqlite.close();

      // 3. Overwrite the main medilog.sqlite file
      await fs.copyFile(sourcePath, dbPath);

      // 4. Relaunch the app
      app.relaunch();
      app.exit(0);

      return { success: true }; // Should never actually return to caller
    } catch (error: any) {
      console.error('Failed to restore backup:', error);
      return { success: false, error: 'Failed to restore backup: ' + error.message };
    }
  }
}
