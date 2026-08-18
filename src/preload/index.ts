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
    create: (data: unknown) => ipcRenderer.invoke('patient:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('patient:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('patient:delete', id),
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
