import { contextBridge, ipcRenderer } from 'electron';

const api = {
  dashboard: {
    getStats: () => ipcRenderer.invoke('dashboard:getStats'),
  },
  patient: {
    getAll: (options?: { searchQuery?: string; gender?: string }) =>
      ipcRenderer.invoke('patient:getAll', options),
    getById: (id: string) => ipcRenderer.invoke('patient:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('patient:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('patient:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('patient:delete', id),
  },
  visit: {
    getAll: (filters?: any) => ipcRenderer.invoke('visit:getAll', filters),
    getByPatient: (patientId: string) => ipcRenderer.invoke('visit:getByPatient', patientId),
    create: (data: any) => ipcRenderer.invoke('visit:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('visit:update', id, data),
    void: (id: string) => ipcRenderer.invoke('visit:void', id),
  },
  audit: {
    getLogs: (options?: { entityType?: string; action?: string; startDate?: Date; endDate?: Date; limit?: number }) =>
      ipcRenderer.invoke('audit:getLogs', options),
  },
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    restore: () => ipcRenderer.invoke('backup:restore'),
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    update: (newSettings: Record<string, string>) => ipcRenderer.invoke('settings:update', newSettings),
  },
  analytics: {
    getDashboard: () => ipcRenderer.invoke('analytics:getDashboard'),
  },
  export: {
    patients: () => ipcRenderer.invoke('export:patients'),
    visits: () => ipcRenderer.invoke('export:visits'),
  },
};

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api);
} else {
  // @ts-ignore - fallback for non-isolated renderer environments
  window.api = api;
}
