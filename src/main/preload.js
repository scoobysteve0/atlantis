const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('app:version'),
  platform: process.platform,
  // Add more safe IPC methods here
  sendNotification: (title, body) => ipcRenderer.send('notify', { title, body }),
  readData: () => ipcRenderer.invoke('data:read')
});
