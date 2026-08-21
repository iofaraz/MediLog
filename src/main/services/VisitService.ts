import { desc, eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../db';
import { patients, prescriptions, visits } from '../db/schema';
import { visitSchema, visitUpdateSchema } from '../../shared/schemas';
import { AuditService } from './AuditService';
import { SettingsService } from './SettingsService';

interface GetVisitsFilters {
  dateFrom?: string;
  dateTo?: string;
}

interface PrescriptionInput {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

function normalizePrescriptionInput(prescription: PrescriptionInput) {
  return {
    medicationName: prescription.medicationName.trim(),
    dosage: prescription.dosage.trim(),
    frequency: prescription.frequency.trim(),
    duration: prescription.duration.trim(),
    notes: prescription.notes?.trim() || '',
  };
}

function buildPrescriptionRows(visitId: string, items: PrescriptionInput[]) {
  const seenNames = new Set<string>();

  return items.map((item) => {
    const normalized = normalizePrescriptionInput(item);
    const duplicateKey = normalized.medicationName.toLowerCase();

    if (seenNames.has(duplicateKey)) {
      throw new Error(`Duplicate medication entry: ${normalized.medicationName}`);
    }

    seenNames.add(duplicateKey);

    return {
      id: crypto.randomUUID(),
      visitId,
      medicationName: normalized.medicationName,
      dosage: normalized.dosage,
      frequency: normalized.frequency,
      duration: normalized.duration,
      notes: normalized.notes || null,
    };
  });
}

async function loadVisitPrescriptions(visitId: string) {
  return db
    .select({
      id: prescriptions.id,
      visitId: prescriptions.visitId,
      medicationName: prescriptions.medicationName,
      dosage: prescriptions.dosage,
      frequency: prescriptions.frequency,
      duration: prescriptions.duration,
      notes: prescriptions.notes,
    })
    .from(prescriptions)
    .where(eq(prescriptions.visitId, visitId));
}

export class VisitService {
  static async getAllVisits(_filters?: GetVisitsFilters) {
    try {
      const allVisits = await db
        .select({
          id: visits.id,
          patientId: visits.patientId,
          doctorName: visits.doctorName,
          date: visits.date,
          reason: visits.reason,
          notes: visits.notes,
          diagnosis: visits.diagnosis,
          isVoided: visits.isVoided,
          createdAt: visits.createdAt,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
        })
        .from(visits)
        .leftJoin(patients, eq(visits.patientId, patients.id))
        .orderBy(desc(visits.date));

      return { success: true, data: allVisits };
    } catch (error) {
      console.error('Failed to get all visits:', error);
      return { success: false, error: 'Failed to retrieve visits' };
    }
  }

  static async getVisitsByPatient(patientId: string) {
    try {
      const patientVisits = await db
        .select({
          visit: visits,
        })
        .from(visits)
        .where(eq(visits.patientId, patientId))
        .orderBy(desc(visits.date));

      const visitsWithDetails = await Promise.all(
        patientVisits.map(async (v) => {
          const visitPrescriptions = await loadVisitPrescriptions(v.visit.id);

          return {
            ...v.visit,
            prescriptions: visitPrescriptions,
          };
        }),
      );

      return { success: true, data: visitsWithDetails };
    } catch (error) {
      console.error('Failed to get visits by patient:', error);
      return { success: false, error: 'Failed to retrieve patient visits' };
    }
  }

  static async createVisit(data: unknown) {
    try {
      const parsed = visitSchema.parse(data);
      const patient = await db.select().from(patients).where(eq(patients.id, parsed.patientId)).get();
      if (!patient) {
        return { success: false, error: 'Patient not found' };
      }

      const doctorName = (parsed.doctorName?.trim() || (await SettingsService.getDoctorName())).trim();
      const newVisit = {
        id: crypto.randomUUID(),
        patientId: parsed.patientId,
        doctorName,
        date: parsed.date,
        reason: parsed.reason || null,
        notes: parsed.notes || null,
        diagnosis: parsed.diagnosis || null,
        createdAt: new Date(),
        isVoided: false,
      };

      const prescriptionRows = buildPrescriptionRows(newVisit.id, parsed.prescriptions || []);

      db.transaction((tx) => {
        tx.insert(visits).values(newVisit).run();

        for (const prescription of prescriptionRows) {
          tx.insert(prescriptions).values(prescription).run();

          AuditService.log(
            {
              action: 'Created',
              entityType: 'Prescription',
              entityId: prescription.id,
              details: `Created prescription for ${prescription.medicationName}`,
            },
            tx,
          );
        }

        AuditService.log(
          {
            action: 'Created',
            entityType: 'Visit',
            entityId: newVisit.id,
            details: `Created visit for ${patient.firstName} ${patient.lastName}`,
          },
          tx,
        );
      });

      const createdPrescriptions = await loadVisitPrescriptions(newVisit.id);

      return {
        success: true,
        data: {
          ...newVisit,
          patientFirstName: patient.firstName,
          patientLastName: patient.lastName,
          prescriptions: createdPrescriptions,
        },
      };
    } catch (error: any) {
      console.error('Failed to create visit:', error);
      if (error?.name === 'ZodError') {
        return { success: false, error: 'Validation failed', details: error.errors };
      }
      return { success: false, error: error?.message || 'Failed to create visit' };
    }
  }

  static async updateVisit(id: string, data: unknown) {
    try {
      const parsed = visitUpdateSchema.parse(data);
      const existing = await db.select().from(visits).where(eq(visits.id, id)).get();
      if (!existing) {
        return { success: false, error: 'Visit not found' };
      }

      db.transaction((tx) => {
        tx
          .update(visits)
          .set({
            ...(parsed.date ? { date: parsed.date } : {}),
            reason: parsed.reason || null,
            notes: parsed.notes || null,
            diagnosis: parsed.diagnosis || null,
          })
          .where(eq(visits.id, id))
          .run();

        if (parsed.prescriptions !== undefined) {
          tx.delete(prescriptions).where(eq(prescriptions.visitId, id)).run();

          const prescriptionRows = buildPrescriptionRows(id, parsed.prescriptions);
          for (const prescription of prescriptionRows) {
            tx.insert(prescriptions).values(prescription).run();
            AuditService.log(
              {
                action: 'Updated',
                entityType: 'Prescription',
                entityId: prescription.id,
                details: `Updated prescription for ${prescription.medicationName}`,
              },
              tx,
            );
          }
        }

        AuditService.log(
          {
            action: 'Updated',
            entityType: 'Visit',
            entityId: id,
            details: 'Updated visit details',
          },
          tx,
        );
      });

      const updatedVisit = await db
        .select({
          id: visits.id,
          patientId: visits.patientId,
          doctorName: visits.doctorName,
          date: visits.date,
          reason: visits.reason,
          notes: visits.notes,
          diagnosis: visits.diagnosis,
          isVoided: visits.isVoided,
          createdAt: visits.createdAt,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
        })
        .from(visits)
        .leftJoin(patients, eq(visits.patientId, patients.id))
        .where(eq(visits.id, id))
        .get();

      const updatedPrescriptions = await loadVisitPrescriptions(id);

      return {
        success: true,
        data: {
          ...updatedVisit,
          prescriptions: updatedPrescriptions,
        },
      };
    } catch (error: any) {
      console.error('Failed to update visit:', error);
      if (error?.name === 'ZodError') {
        return { success: false, error: 'Validation failed', details: error.errors };
      }
      return { success: false, error: error?.message || 'Failed to update visit' };
    }
  }

  static async voidVisit(id: string) {
    try {
      const existing = await db.select().from(visits).where(eq(visits.id, id)).get();
      if (!existing) {
        return { success: false, error: 'Visit not found' };
      }

      db.transaction((tx) => {
        tx.update(visits).set({ isVoided: true }).where(eq(visits.id, id)).run();
        AuditService.log(
          {
            action: 'Voided',
            entityType: 'Visit',
            entityId: id,
            details: 'Voided visit',
          },
          tx,
        );
      });

      return { success: true, data: { ...existing, isVoided: true } };
    } catch (error) {
      console.error('Failed to void visit:', error);
      return { success: false, error: 'Failed to void visit' };
    }
  }
}
