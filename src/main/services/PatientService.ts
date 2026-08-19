import { db } from '../db';
import { patients } from '../db/schema';
import { eq, desc, like, or, and } from 'drizzle-orm';
import crypto from 'crypto';
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
        // Search across first name OR last name
        conditions.push(
          or(
            like(patients.firstName, `%${searchQuery}%`),
            like(patients.lastName, `%${searchQuery}%`)
          )
        );
      }

      if (gender && gender !== 'All') {
        conditions.push(eq(patients.gender, gender));
      }

      const results = await db.select().from(patients)
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

  static async createPatient(data: unknown, userId: string) {
    try {
      const parsedData = patientSchema.parse(data);

      const newPatient = {
        id: crypto.randomUUID(),
        ...parsedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(patients).values(newPatient);
      await AuditService.log({ userId, action: 'CREATE', entityType: 'PATIENT', entityId: newPatient.id, details: `Created patient: ${newPatient.firstName} ${newPatient.lastName}` });
      return { success: true, data: newPatient };
    } catch (error: any) {
      console.error('Failed to create patient:', error);
      if (error.name === 'ZodError') {
        return { success: false, error: 'Validation failed', details: error.errors };
      }
      return { success: false, error: 'Failed to create patient' };
    }
  }

  static async updatePatient(id: string, data: unknown, userId: string) {
    try {
      const parsedData = patientSchema.parse(data);

      const updatedPatient = {
        ...parsedData,
        updatedAt: new Date(),
      };

      await db.update(patients)
        .set(updatedPatient)
        .where(eq(patients.id, id));

      await AuditService.log({ userId, action: 'UPDATE', entityType: 'PATIENT', entityId: id });
      return { success: true, data: { id, ...updatedPatient } };
    } catch (error: any) {
      console.error('Failed to update patient:', error);
      if (error.name === 'ZodError') {
        return { success: false, error: 'Validation failed', details: error.errors };
      }
      return { success: false, error: 'Failed to update patient' };
    }
  }

  static async deletePatient(id: string, userId: string) {
    try {
      await db.delete(patients).where(eq(patients.id, id));
      await AuditService.log({ userId, action: 'DELETE', entityType: 'PATIENT', entityId: id });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete patient:', error);
      return { success: false, error: 'Failed to delete patient' };
    }
  }
}
