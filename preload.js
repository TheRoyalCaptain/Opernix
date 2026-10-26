const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('opernix', {
  getSystemInfo: () => ipcRenderer.invoke('system:get-info'),
  getAppInfo: () => ipcRenderer.invoke('app:get-info'),
  checkForUpdates: () => ipcRenderer.invoke('updates:check'),
  downloadUpdate: () => ipcRenderer.invoke('updates:download'),
  installUpdate: () => ipcRenderer.invoke('updates:install'),
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
  onUpdateStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on('update-status', listener);
    return () => ipcRenderer.removeListener('update-status', listener);
  }
});