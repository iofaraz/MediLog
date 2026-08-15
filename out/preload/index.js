"use strict";
const electron = require("electron");
const api = {
  // Example API:
  // getPatients: () => ipcRenderer.invoke('get-patients'),
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", {
      ipcRenderer: {
        send: (channel, data) => {
          electron.ipcRenderer.send(channel, data);
        },
        on: (channel, func) => {
          electron.ipcRenderer.on(channel, (_event, ...args) => func(...args));
        }
      }
    });
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = { ipcRenderer: electron.ipcRenderer };
  window.api = api;
}
