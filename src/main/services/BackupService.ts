import { app } from 'electron';
import Database from 'better-sqlite3';
import fs from 'fs/promises';
import path from 'path';
import { dbPath, sqlite } from '../db';
import { AuditService } from './AuditService';
import { backupPathSchema, restoreInputSchema } from '../../shared/schemas';

const REQUIRED_TABLES = ['patients', 'visits', 'prescriptions', 'audit_logs', 'settings'];

function formatStamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

async function fileExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function validateSqliteBackup(filePath: string) {
  const db = new Database(filePath, { readonly: true, fileMustExist: true });
  try {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row: { name: string }) => row.name);

    const tableSet = new Set(tables);
    const missing = REQUIRED_TABLES.filter((table) => !tableSet.has(table));
    if (missing.length > 0) {
      return { valid: false, error: `Backup is missing required tables: ${missing.join(', ')}` };
    }

    const visitColumns = db.prepare('PRAGMA table_info(visits)').all().map((row: any) => row.name);
    const hasVisitDoctorField = visitColumns.includes('doctor_name') || visitColumns.includes('doctor_id');
    if (!hasVisitDoctorField) {
      return { valid: false, error: 'Backup does not contain a compatible visits schema.' };
    }

    const prescriptionColumns = db.prepare('PRAGMA table_info(prescriptions)').all().map((row: any) => row.name);
    const hasPrescriptionName = prescriptionColumns.includes('medication_name');
    const hasPrescriptionLegacyMedication = prescriptionColumns.includes('medication_id');
    if (!hasPrescriptionName && !hasPrescriptionLegacyMedication) {
      return { valid: false, error: 'Backup does not contain a compatible prescriptions schema.' };
    }

    const auditColumns = db.prepare('PRAGMA table_info(audit_logs)').all().map((row: any) => row.name);
    const hasAuditCore = ['action', 'entity_type', 'entity_id', 'timestamp'].every((column) =>
      auditColumns.includes(column),
    );
    if (!hasAuditCore) {
      return { valid: false, error: 'Backup does not contain a compatible audit schema.' };
    }

    return { valid: true };
  } finally {
    db.close();
  }
}

export class BackupService {
  static async createBackup(destinationPath?: string) {
    try {
      const backupPath =
        destinationPath?.trim() || path.join(app.getPath('userData'), `medilog_backup_${formatStamp()}.db`);
      await sqlite.backup(backupPath);

      if (!(await fileExists(backupPath))) {
        throw new Error('Backup file was not created.');
      }

      await AuditService.log({
        action: 'Created',
        entityType: 'Backup',
        entityId: 'backup',
        details: 'Created database backup',
      });

      return { success: true, message: 'Backup created successfully.', filePath: backupPath };
    } catch (error: any) {
      console.error('Failed to create backup:', error);
      return { success: false, error: 'Failed to create backup: ' + error.message };
    }
  }

  static async restoreBackup(sourcePath: string) {
    try {
      const parsed = restoreInputSchema.parse({ sourcePath });
      const validatedPath = backupPathSchema.parse(parsed.sourcePath);

      const validation = await validateSqliteBackup(validatedPath);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const safetyBackupPath = path.join(app.getPath('userData'), `medilog_pre_restore_${formatStamp()}.db`);
      await sqlite.backup(safetyBackupPath);

      sqlite.close();
      await fs.copyFile(validatedPath, dbPath);

      app.relaunch();
      app.exit(0);

      return { success: true, message: 'Backup restored successfully. The app will restart.' };
    } catch (error: any) {
      console.error('Failed to restore backup:', error);
      return { success: false, error: error?.message || 'Failed to restore backup' };
    }
  }
}
