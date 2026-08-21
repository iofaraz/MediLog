import { z } from 'zod';

const optionalText = z.string().trim().max(500).optional().default('');

export const patientSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  dob: z.coerce.date().refine((date) => date <= new Date(), { message: 'Date of birth cannot be in the future' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  contactNumber: optionalText,
  address: optionalText,
});

export const prescriptionSchema = z.object({
  medicationName: z.string().trim().min(1, 'Medication name is required').max(120),
  dosage: z.string().trim().min(1, 'Dosage is required').max(120),
  frequency: z.string().trim().min(1, 'Frequency is required').max(120),
  duration: z.string().trim().min(1, 'Duration is required').max(120),
  notes: optionalText,
});

export const visitPrescriptionSchema = prescriptionSchema;

export const visitSchema = z.object({
  patientId: z.string().trim().min(1, 'Patient is required'),
  doctorName: z.string().trim().min(1, 'Clinician name is required').max(120).optional(),
  date: z.coerce.date(),
  reason: optionalText,
  notes: optionalText,
  diagnosis: optionalText,
  prescriptions: z.array(prescriptionSchema).max(25).optional().default([]),
});

export const visitUpdateSchema = z.object({
  date: z.coerce.date().optional(),
  reason: optionalText,
  notes: optionalText,
  diagnosis: optionalText,
  prescriptions: z.array(prescriptionSchema).max(25).optional(),
});

export const settingsSchema = z.object({
  clinicName: z.string().trim().max(120).optional().default(''),
  clinicAddress: z.string().trim().max(240).optional().default(''),
  contactNumber: z.string().trim().max(60).optional().default(''),
  contactEmail: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')).default(''),
  doctorName: z.string().trim().min(1, 'Clinician name is required').max(120),
  profilePicture: z.string().optional().default(''),
});

export const settingsUpdateSchema = settingsSchema;

export const backupPathSchema = z.string().trim().min(1, 'A backup path is required');

export const restoreInputSchema = z.object({
  sourcePath: backupPathSchema,
});

export type PatientFormData = z.infer<typeof patientSchema>;
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
export type VisitFormData = z.infer<typeof visitSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
