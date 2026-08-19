// Global type declarations for the preload API bridge (contextBridge)
export {};

declare global {
  interface Window {
    api: {
      auth: {
        login: (
          username: string,
          password: string,
        ) => Promise<{
          success: boolean;
          user?: { id: string; username: string; name: string; role: string };
          error?: string;
        }>;
      };
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
        create: (data: unknown, userId: string) => Promise<{ success: boolean; data?: any; error?: string; details?: any }>;
        update: (id: string, data: unknown, userId: string) => Promise<{ success: boolean; data?: any; error?: string; details?: any }>;
        delete: (id: string, userId: string) => Promise<{ success: boolean; error?: string }>;
      };
      visit: {
        getByPatient: (patientId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
        create: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        update: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
        void: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
      medication: {
        getAll: (searchQuery?: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
        create: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        update: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
      prescription: {
        getByVisit: (visitId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
        create: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
      audit: {
        getLogs: (options?: { entityType?: string; userId?: string; startDate?: Date; endDate?: Date; limit?: number }) => Promise<{ success: boolean; data?: any[]; error?: string }>;
      };
      backup: {
        create: (userId: string) => Promise<{ success: boolean; error?: string }>;
        restore: (userId: string) => Promise<{ success: boolean; error?: string }>;
      };
      settings: {
        getAll: () => Promise<{ success: boolean; data?: Record<string, string>; error?: string }>;
        update: (newSettings: Record<string, string>, userId: string) => Promise<{ success: boolean; error?: string }>;
      };
    };
  }
}
