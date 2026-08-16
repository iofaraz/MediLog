import { db } from '../db';
import { visits, prescriptions, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class VisitService {
  static async getVisitsByPatient(patientId: string) {
    try {
      // Get all visits for the patient
      const patientVisits = await db
        .select({
          visit: visits,
          doctorName: users.name,
        })
        .from(visits)
        .leftJoin(users, eq(visits.doctorId, users.id))
        .where(eq(visits.patientId, patientId))
        .orderBy(desc(visits.date));

      // For each visit, get prescriptions (we could do this with relations or a second query)
      // Since it's local SQLite, a mapped promise all is fine for small scale, 
      // or we can fetch all prescriptions for these visits.
      
      const visitsWithDetails = await Promise.all(
        patientVisits.map(async (v) => {
          const visitPrescriptions = await db
            .select()
            .from(prescriptions)
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
}
