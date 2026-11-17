// Puente seguro entre la interfaz y el proceso principal.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (json) => ipcRenderer.invoke('data:save', json),

  saveMedia: (ext, buffer) => ipcRenderer.invoke('media:save', { ext, buffer }),
  readMedia64: (name) => ipcRenderer.invoke('media:read64', name),
  writeMedia64: (name, b64) => ipcRenderer.invoke('media:write64', { name, b64 }),
  listMedia: () => ipcRenderer.invoke('media:list'),
  deleteMedia: (names) => ipcRenderer.invoke('media:delete', names),

  exportFile: (defaultName, content, filters) => ipcRenderer.invoke('file:export', { defaultName, content, filters }),
  importFile: (filters) => ipcRenderer.invoke('file:import', { filters }),

  setWindowMode: (mode) => ipcRenderer.invoke('win:mode', mode),
  quit: () => ipcRenderer.invoke('app:quit'),
  info: () => ipcRenderer.invoke('app:info'),
  openDataFolder: () => ipcRenderer.invoke('app:openData'),
  openSpeechSettings: () => ipcRenderer.invoke('app:openSpeechSettings'),

  aiSetKey: (key) => ipcRenderer.invoke('ai:setKey', key),
  aiHasKey: () => ipcRenderer.invoke('ai:hasKey'),
  aiGenerate: (req) => ipcRenderer.invoke('ai:generate', req),

  onCloseBlocked: (fn) => ipcRenderer.on('close-blocked', () => fn()),
  onFlush: (fn) => ipcRenderer.on('flush', async () => {
    try { await fn(); } finally { ipcRenderer.send('flushed'); }
  }),
});
