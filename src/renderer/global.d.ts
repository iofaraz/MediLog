export {};

type PatientFormData = {
  firstName: string;
  lastName: string;
  dob: Date;
  gender: 'Male' | 'Female' | 'Other';
  contactNumber?: string;
  address?: string;
};

type VisitPayload = {
  patientId: string;
  doctorName?: string;
  date: string;
  reason?: string;
  diagnosis?: string;
  notes?: string;
  prescriptions?: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }>;
};

declare global {
  interface Window {
    api: {
      dashboard: {
        getStats: () => Promise<{
          success: boolean;
          stats?: {
            totalPatients: number;
            todayVisits: number;
            pendingFollowUps: number;
          };
          error?: string;
        }>;
      };
      patient: {
        getAll: (options?: { searchQuery?: string; gender?: string }) => Promise<{ success: boolean; data?: any[]; error?: string }>;
        getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        create: (data: PatientFormData) => Promise<{ success: boolean; data?: any; error?: string; details?: any }>;
        update: (id: string, data: PatientFormData) => Promise<{ success: boolean; data?: any; error?: string; details?: any }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
      visit: {
        getAll: (filters?: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
        getByPatient: (patientId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
        create: (data: VisitPayload) => Promise<{ success: boolean; data?: any; error?: string; details?: any }>;
        update: (
          id: string,
          data: { date?: string; reason?: string; notes?: string; diagnosis?: string; prescriptions?: VisitPayload['prescriptions'] },
        ) => Promise<{ success: boolean; data?: any; error?: string; details?: any }>;
        void: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
      audit: {
        getLogs: (options?: { entityType?: string; action?: string; startDate?: Date; endDate?: Date; limit?: number }) => Promise<{ success: boolean; data?: any[]; error?: string }>;
      };
      backup: {
        create: () => Promise<{ success: boolean; message?: string; filePath?: string; error?: string }>;
        restore: () => Promise<{ success: boolean; message?: string; error?: string }>;
      };
      settings: {
        getAll: () => Promise<{ success: boolean; data?: Record<string, string>; error?: string }>;
        update: (newSettings: Record<string, string>) => Promise<{ success: boolean; data?: Record<string, string>; error?: string; details?: any }>;
      };
      analytics: {
        getDashboard: () => Promise<{ success: boolean; data?: any; error?: string }>;
      };
      export: {
        patients: () => Promise<{ success: boolean; error?: string }>;
        visits: () => Promise<{ success: boolean; error?: string }>;
      };
    };
  }
}
