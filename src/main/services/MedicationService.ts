import { db } from '../db';
import { medications, prescriptions } from '../db/schema';
import { eq, like } from 'drizzle-orm';
import crypto from 'crypto';

interface CreateMedicationData {
  name: string;
  description?: string;
  defaultDosage?: string;
}

interface CreatePrescriptionData {
  visitId: string;
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export class MedicationService {
  // ---- Medications Catalog ----
  static async getAllMedications(searchQuery?: string) {
    try {
      if (searchQuery) {
        const results = await db.select().from(medications)
          .where(like(medications.name, `%${searchQuery}%`));
        return { success: true, data: results };
      }
      const results = await db.select().from(medications);
      return { success: true, data: results };
    } catch (error) {
      console.error('Failed to get medications:', error);
      return { success: false, error: 'Failed to retrieve medications' };
    }
  }

  static async createMedication(data: CreateMedicationData) {
    try {
      const newMed = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description || null,
        defaultDosage: data.defaultDosage || null,
      };
      await db.insert(medications).values(newMed);
      return { success: true, data: newMed };
    } catch (error) {
      console.error('Failed to create medication:', error);
      return { success: false, error: 'Failed to create medication' };
    }
  }

  static async updateMedication(id: string, data: CreateMedicationData) {
    try {
      await db.update(medications)
        .set({
          name: data.name,
          description: data.description || null,
          defaultDosage: data.defaultDosage || null,
        })
        .where(eq(medications.id, id));
      return { success: true };
    } catch (error) {
      console.error('Failed to update medication:', error);
      return { success: false, error: 'Failed to update medication' };
    }
  }

  static async deleteMedication(id: string) {
    try {
      await db.delete(medications).where(eq(medications.id, id));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete medication:', error);
      return { success: false, error: 'Failed to delete medication' };
    }
  }

  // ---- Prescriptions ----
  static async getPrescriptionsByVisit(visitId: string) {
    try {
      const results = await db
        .select({
          prescription: prescriptions,
          medicationName: medications.name,
        })
        .from(prescriptions)
        .leftJoin(medications, eq(prescriptions.medicationId, medications.id))
        .where(eq(prescriptions.visitId, visitId));
      return { success: true, data: results };
    } catch (error) {
      console.error('Failed to get prescriptions:', error);
      return { success: false, error: 'Failed to retrieve prescriptions' };
    }
  }

  static async createPrescription(data: CreatePrescriptionData) {
    try {
      const newPx = {
        id: crypto.randomUUID(),
        visitId: data.visitId,
        medicationId: data.medicationId,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        notes: data.notes || null,
      };
      await db.insert(prescriptions).values(newPx);
      return { success: true, data: newPx };
    } catch (error) {
      console.error('Failed to create prescription:', error);
      return { success: false, error: 'Failed to create prescription' };
    }
  }

  static async deletePrescription(id: string) {
    try {
      await db.delete(prescriptions).where(eq(prescriptions.id, id));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete prescription:', error);
      return { success: false, error: 'Failed to delete prescription' };
    }
  }
}
