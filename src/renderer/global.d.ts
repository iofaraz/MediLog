// Global type declarations for the preload API bridge
export {};

declare global {
  interface Window {
    api: {
      auth: {
        login: (username: string, password: string) => Promise<{
          success: boolean;
          user?: { id: string; username: string; name: string; role: string };
          error?: string;
        }>;
      };
    };
  }
}
