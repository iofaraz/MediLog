import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const patients = sqliteTable('patients', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dob: integer('dob', { mode: 'timestamp' }).notNull(),
  gender: text('gender').notNull(),
  contactNumber: text('contact_number'),
  address: text('address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const visits = sqliteTable('visits', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: text('doctor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  reason: text('reason'),
  notes: text('notes'),
  diagnosis: text('diagnosis'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  isVoided: integer('is_voided', { mode: 'boolean' }).default(false).notNull(),
});

export const medications = sqliteTable('medications', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  defaultDosage: text('default_dosage'),
});

export const prescriptions = sqliteTable('prescriptions', {
  id: text('id').primaryKey(),
  visitId: text('visit_id').notNull().references(() => visits.id, { onDelete: 'cascade' }),
  medicationId: text('medication_id').notNull().references(() => medications.id, { onDelete: 'restrict' }),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  duration: text('duration').notNull(),
  notes: text('notes'),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  details: text('details'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
