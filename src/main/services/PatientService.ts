import { and, desc, eq, like, or } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../db';
import { patients } from '../db/schema';
import { patientSchema } from '../../shared/schemas';
import { AuditService } from './AuditService';

interface GetPatientsOptions {
  searchQuery?: string;
  gender?: string;
}

export class PatientService {
  static async getPatients(options: GetPatientsOptions = {}) {
    try {
      const { searchQuery, gender } = options;
      const conditions: any[] = [];

      if (searchQuery) {
        conditions.push(
          or(
            like(patients.firstName, `%${searchQuery}%`),
            like(patients.lastName, `%${searchQuery}%`),
          ),
        );
      }

      if (gender && gender !== 'All') {
        conditions.push(eq(patients.gender, gender));
      }

      const results = await db
        .select()
        .from(patients)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(patients.updatedAt));

      return { success: true, data: results };
    } catch (error) {
      console.error('Failed to get patients:', error);
      return { success: false, error: 'Failed to retrieve patients' };
    }
  }

  static async getPatientById(id: string) {
    try {
      const patient = await db.select().from(patients).where(eq(patients.id, id)).get();
      if (!patient) return { success: false, error: 'Patient not found' };
      return { success: true, data: patient };
    } catch (error) {
      console.error('Failed to get patient:', error);
      return { success: false, error: 'Failed to retrieve patient details' };
    }
  }

  static async createPatient(data: unknown) {
    try {
      const parsedData = patientSchema.parse(data);

      const newPatient = {
        id: crypto.randomUUID(),
        ...parsedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.transaction((tx) => {
        tx.insert(patients).values(newPatient).run();
        AuditService.log(
          {
            action: 'Created',
            entityType: 'Patient',
            entityId: newPatient.id,
            details: `Created patient: ${newPatient.firstName} ${newPatient.lastName}`,
          },
          tx,
        );
      });

      return { success: true, data: newPatient };
    } catch (error: any) {
      console.error('Failed to create patient:', error);
      if (error?.name === 'ZodError') {
        return { success: false, error: 'Validation failed', details: error.errors };
      }
      return { success: false, error: 'Failed to create patient' };
    }
  }

  static async updatePatient(id: string, data: unknown) {
    try {
      const parsedData = patientSchema.parse(data);
      const existing = await db.select().from(patients).where(eq(patients.id, id)).get();
      if (!existing) {
        return { success: false, error: 'Patient not found' };
      }

      const updatedPatient = {
        ...parsedData,
        updatedAt: new Date(),
      };

      db.transaction((tx) => {
        tx.update(patients).set(updatedPatient).where(eq(patients.id, id)).run();
        AuditService.log(
          {
            action: 'Updated',
            entityType: 'Patient',
            entityId: id,
            details: `Updated patient: ${updatedPatient.firstName} ${updatedPatient.lastName}`,
          },
          tx,
        );
      });

      return { success: true, data: { id, ...existing, ...updatedPatient } };
    } catch (error: any) {
      console.error('Failed to update patient:', error);
      if (error?.name === 'ZodError') {
        return { success: false, error: 'Validation failed', details: error.errors };
      }
      return { success: false, error: 'Failed to update patient' };
    }
  }

  static async deletePatient(id: string) {
    try {
      const existing = await db.select().from(patients).where(eq(patients.id, id)).get();
      if (!existing) {
        return { success: false, error: 'Patient not found' };
      }

      db.transaction((tx) => {
        tx.delete(patients).where(eq(patients.id, id)).run();
        AuditService.log(
          {
            action: 'Deleted',
            entityType: 'Patient',
            entityId: id,
            details: `Deleted patient: ${existing.firstName} ${existing.lastName}`,
          },
          tx,
        );
      });

      return { success: true, data: { id } };
    } catch (error) {
      console.error('Failed to delete patient:', error);
      return { success: false, error: 'Failed to delete patient' };
    }
  }
}
