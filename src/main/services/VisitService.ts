import { db } from '../db';
import { visits, prescriptions, users, medications } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

interface CreateVisitData {
  patientId: string;
  doctorId: string;
  date: string;
  reason?: string;
  notes?: string;
  diagnosis?: string;
}

interface UpdateVisitData {
  reason?: string;
  notes?: string;
  diagnosis?: string;
}

export class VisitService {
  static async getVisitsByPatient(patientId: string) {
    try {
      const patientVisits = await db
        .select({
          visit: visits,
          doctorName: users.name,
        })
        .from(visits)
        .leftJoin(users, eq(visits.doctorId, users.id))
        .where(eq(visits.patientId, patientId))
        .orderBy(desc(visits.date));

      const visitsWithDetails = await Promise.all(
        patientVisits.map(async (v) => {
          const visitPrescriptions = await db
            .select({
              id: prescriptions.id,
              visitId: prescriptions.visitId,
              medicationId: prescriptions.medicationId,
              dosage: prescriptions.dosage,
              frequency: prescriptions.frequency,
              duration: prescriptions.duration,
              notes: prescriptions.notes,
              medicationName: medications.name,
            })
            .from(prescriptions)
            .leftJoin(medications, eq(prescriptions.medicationId, medications.id))
            .where(eq(prescriptions.visitId, v.visit.id));

          return {
            ...v.visit,
            doctorName: v.doctorName,
            prescriptions: visitPrescriptions,
          };
        })
      );

      return { success: true, data: visitsWithDetails };
    } catch (error) {
      console.error('Failed to get patient visits:', error);
      return { success: false, error: 'Failed to retrieve medical history' };
    }
  }

  static async createVisit(data: CreateVisitData) {
    try {
      const newVisit = {
        id: crypto.randomUUID(),
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: new Date(data.date),
        reason: data.reason || null,
        notes: data.notes || null,
        diagnosis: data.diagnosis || null,
        createdAt: new Date(),
        isVoided: false,
      };

      await db.insert(visits).values(newVisit);
      return { success: true, data: newVisit };
    } catch (error) {
      console.error('Failed to create visit:', error);
      return { success: false, error: 'Failed to create visit' };
    }
  }

  static async updateVisit(id: string, data: UpdateVisitData) {
    try {
      await db.update(visits)
        .set({
          reason: data.reason,
          notes: data.notes,
          diagnosis: data.diagnosis,
        })
        .where(eq(visits.id, id));

      return { success: true };
    } catch (error) {
      console.error('Failed to update visit:', error);
      return { success: false, error: 'Failed to update visit' };
    }
  }

  static async voidVisit(id: string) {
    try {
      await db.update(visits)
        .set({ isVoided: true })
        .where(eq(visits.id, id));

      return { success: true };
    } catch (error) {
      console.error('Failed to void visit:', error);
      return { success: false, error: 'Failed to void visit' };
    }
  }
}
