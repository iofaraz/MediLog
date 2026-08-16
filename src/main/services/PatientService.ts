import { db } from '../db';
import { patients } from '../db/schema';
import { eq, desc, like } from 'drizzle-orm';
import crypto from 'crypto';
import { patientSchema } from '../../shared/schemas';

export class PatientService {
  static async getPatients(searchQuery?: string) {
    try {
      let query = db.select().from(patients).orderBy(desc(patients.updatedAt));
      
      if (searchQuery) {
        // Basic search on first or last name
        query = db.select().from(patients)
          .where(like(patients.firstName, `%${searchQuery}%`))
          .orderBy(desc(patients.updatedAt)) as any;
          
          // Note: Full text search in SQLite requires FTS5, but simple LIKE is fine for basic usage
      }

      const results = await query;
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
      // Validate incoming data
      const parsedData = patientSchema.parse(data);
      
      const newPatient = {
        id: crypto.randomUUID(),
        ...parsedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(patients).values(newPatient);
      return { success: true, data: newPatient };
    } catch (error: any) {
      console.error('Failed to create patient:', error);
      if (error.name === 'ZodError') {
        return { success: false, error: 'Validation failed', details: error.errors };
      }
      return { success: false, error: 'Failed to create patient' };
    }
  }

  static async updatePatient(id: string, data: unknown) {
    try {
      const parsedData = patientSchema.parse(data);
      
      const updatedPatient = {
        ...parsedData,
        updatedAt: new Date(),
      };

      await db.update(patients)
        .set(updatedPatient)
        .where(eq(patients.id, id));

      return { success: true, data: { id, ...updatedPatient } };
    } catch (error: any) {
      console.error('Failed to update patient:', error);
      if (error.name === 'ZodError') {
        return { success: false, error: 'Validation failed', details: error.errors };
      }
      return { success: false, error: 'Failed to update patient' };
    }
  }

  static async deletePatient(id: string) {
    try {
      await db.delete(patients).where(eq(patients.id, id));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete patient:', error);
      return { success: false, error: 'Failed to delete patient' };
    }
  }
}
