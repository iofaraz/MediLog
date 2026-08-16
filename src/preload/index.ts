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
    getAll: (searchQuery?: string) => ipcRenderer.invoke('patient:getAll', searchQuery),
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
