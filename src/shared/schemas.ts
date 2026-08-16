import { z } from 'zod';

export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dob: z.coerce.date().refine((date) => date <= new Date(), { message: 'Date of birth cannot be in the future' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;
