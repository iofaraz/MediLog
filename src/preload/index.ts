import { contextBridge, ipcRenderer } from 'electron';

// Typed API surface exposed to the renderer
const api = {
  auth: {
    login: (username: string, password: string) =>
      ipcRenderer.invoke('auth:login', username, password),
  },
  dashboard: {
    getStats: () => ipcRenderer.invoke('dashboard:getStats'),
  },
  patient: {
    getAll: (options?: { searchQuery?: string; gender?: string }) => ipcRenderer.invoke('patient:getAll', options),
    getById: (id: string) => ipcRenderer.invoke('patient:getById', id),
    create: (data: unknown, userId: string) => ipcRenderer.invoke('patient:create', data, userId),
    update: (id: string, data: unknown, userId: string) => ipcRenderer.invoke('patient:update', id, data, userId),
    delete: (id: string, userId: string) => ipcRenderer.invoke('patient:delete', id, userId),
  },
  visit: {
    getByPatient: (patientId: string) => ipcRenderer.invoke('visit:getByPatient', patientId),
    create: (data: any) => ipcRenderer.invoke('visit:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('visit:update', id, data),
    void: (id: string) => ipcRenderer.invoke('visit:void', id),
  },
  medication: {
    getAll: (searchQuery?: string) => ipcRenderer.invoke('medication:getAll', searchQuery),
    create: (data: any) => ipcRenderer.invoke('medication:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('medication:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('medication:delete', id),
  },
  prescription: {
    getByVisit: (visitId: string) => ipcRenderer.invoke('prescription:getByVisit', visitId),
    create: (data: any) => ipcRenderer.invoke('prescription:create', data),
    delete: (id: string) => ipcRenderer.invoke('prescription:delete', id),
  },
  audit: {
    getLogs: (options?: any) => ipcRenderer.invoke('audit:getLogs', options),
  },
  backup: {
    create: (userId: string) => ipcRenderer.invoke('backup:create', userId),
    restore: (userId: string) => ipcRenderer.invoke('backup:restore', userId),
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    update: (newSettings: Record<string, string>, userId: string) => ipcRenderer.invoke('settings:update', newSettings, userId),
  },
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    create: (data: any, adminId: string) => ipcRenderer.invoke('users:create', data, adminId),
    update: (id: string, data: any, adminId: string) => ipcRenderer.invoke('users:update', id, data, adminId),
    delete: (id: string, adminId: string) => ipcRenderer.invoke('users:delete', id, adminId),
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api;
}
