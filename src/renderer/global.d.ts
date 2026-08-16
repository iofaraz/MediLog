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
        getAll: (searchQuery?: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
        getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        create: (data: unknown) => Promise<{ success: boolean; data?: any; error?: string; details?: any }>;
        update: (id: string, data: unknown) => Promise<{ success: boolean; data?: any; error?: string; details?: any }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
    };
  }
}
