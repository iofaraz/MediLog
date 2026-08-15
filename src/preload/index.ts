import { contextBridge, ipcRenderer } from 'electron';

// Custom APIs for renderer
const api = {
  // Example API:
  // getPatients: () => ipcRenderer.invoke('get-patients'),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ipcRenderer: {
        send: (channel: string, data: any) => {
          ipcRenderer.send(channel, data);
        },
        on: (channel: string, func: (...args: any[]) => void) => {
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        },
      }
    });
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = { ipcRenderer };
  // @ts-ignore (define in dts)
  window.api = api;
}
