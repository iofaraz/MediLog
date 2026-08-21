import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';

const userDataPath = app.getPath('userData');
export const dbPath = join(userDataPath, 'medilog.sqlite');

export const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite);

function getTableColumns(tableName: string) {
  return sqlite.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
}

function hasTable(tableName: string) {
  const row = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName) as { name?: string } | undefined;
  return !!row;
}

function migrateLegacySchemaIfNeeded() {
  const hasMedications = hasTable('medications');
  const hasLegacyUsers = hasTable('users');
  const visitColumns = hasTable('visits') ? getTableColumns('visits').map((column) => column.name) : [];
  const auditColumns = hasTable('audit_logs') ? getTableColumns('audit_logs').map((column) => column.name) : [];
  const prescriptionColumns = hasTable('prescriptions') ? getTableColumns('prescriptions').map((column) => column.name) : [];
  const needsVisitMigration = visitColumns.includes('doctor_id') && !visitColumns.includes('doctor_name');
  const needsAuditMigration = auditColumns.includes('user_id');
  const needsPrescriptionMigration =
    hasTable('prescriptions') &&
    (prescriptionColumns.includes('medication_id') || !prescriptionColumns.includes('medication_name'));

  if (!hasLegacyUsers && !needsVisitMigration && !needsAuditMigration && !needsPrescriptionMigration && !hasMedications) {
    return;
  }

  sqlite.pragma('foreign_keys = OFF');

  try {
    sqlite.exec('BEGIN TRANSACTION');

    if (needsVisitMigration) {
      const doctorNameSelect = hasLegacyUsers
        ? `COALESCE(u.name, 'Primary Clinician')`
        : `'Primary Clinician'`;
      sqlite.exec('DROP TABLE IF EXISTS visits_new');
      sqlite.exec(`
        CREATE TABLE visits_new (
          id text PRIMARY KEY NOT NULL,
          patient_id text NOT NULL REFERENCES patients(id) ON DELETE cascade,
          doctor_name text NOT NULL,
          date integer NOT NULL,
          reason text,
          notes text,
          diagnosis text,
          created_at integer NOT NULL,
          is_voided integer DEFAULT false NOT NULL
        )
      `);
      sqlite.exec(`
        INSERT INTO visits_new (id, patient_id, doctor_name, date, reason, notes, diagnosis, created_at, is_voided)
        SELECT
          v.id,
          v.patient_id,
          ${doctorNameSelect},
          v.date,
          v.reason,
          v.notes,
          v.diagnosis,
          v.created_at,
          v.is_voided
        FROM visits v
        ${hasLegacyUsers ? 'LEFT JOIN users u ON u.id = v.doctor_id' : ''}
      `);
      sqlite.exec('DROP TABLE visits');
      sqlite.exec('ALTER TABLE visits_new RENAME TO visits');
    }

    if (needsAuditMigration) {
      sqlite.exec('DROP TABLE IF EXISTS audit_logs_new');
      sqlite.exec(`
        CREATE TABLE audit_logs_new (
          id text PRIMARY KEY NOT NULL,
          action text NOT NULL,
          entity_type text NOT NULL,
          entity_id text NOT NULL,
          details text,
          timestamp integer NOT NULL
        )
      `);
      sqlite.exec(`
        INSERT INTO audit_logs_new (id, action, entity_type, entity_id, details, timestamp)
        SELECT id, action, entity_type, entity_id, details, timestamp
        FROM audit_logs
      `);
      sqlite.exec('DROP TABLE audit_logs');
      sqlite.exec('ALTER TABLE audit_logs_new RENAME TO audit_logs');
    }

    if (needsPrescriptionMigration) {
      sqlite.exec('DROP TABLE IF EXISTS prescriptions_new');
      sqlite.exec(`
        CREATE TABLE prescriptions_new (
          id text PRIMARY KEY NOT NULL,
          visit_id text NOT NULL REFERENCES visits(id) ON DELETE cascade,
          medication_name text NOT NULL,
          dosage text NOT NULL,
          frequency text NOT NULL,
          duration text NOT NULL,
          notes text
        )
      `);

      if (prescriptionColumns.includes('medication_id') && hasMedications) {
        sqlite.exec(`
          INSERT INTO prescriptions_new (id, visit_id, medication_name, dosage, frequency, duration, notes)
          SELECT
            p.id,
            p.visit_id,
            COALESCE(m.name, p.medication_id),
            p.dosage,
            p.frequency,
            p.duration,
            p.notes
          FROM prescriptions p
          LEFT JOIN medications m ON m.id = p.medication_id
        `);
      } else if (prescriptionColumns.includes('medication_name')) {
        sqlite.exec(`
          INSERT INTO prescriptions_new (id, visit_id, medication_name, dosage, frequency, duration, notes)
          SELECT id, visit_id, medication_name, dosage, frequency, duration, notes
          FROM prescriptions
        `);
      }

      sqlite.exec('DROP TABLE IF EXISTS prescriptions');
      sqlite.exec('ALTER TABLE prescriptions_new RENAME TO prescriptions');
    }

    if (hasLegacyUsers) {
      sqlite.exec('DROP TABLE users');
    }

    if (hasMedications) {
      sqlite.exec('DROP TABLE medications');
    }

    sqlite.exec('COMMIT');
  } catch (error) {
    try {
      sqlite.exec('ROLLBACK');
    } catch {
      // Ignore rollback failures after a failed migration attempt.
    }
    throw error;
  } finally {
    sqlite.pragma('foreign_keys = ON');
  }
}

migrateLegacySchemaIfNeeded();

const migrationsFolder = join(__dirname, 'db/migrations');
migrate(db, { migrationsFolder });
