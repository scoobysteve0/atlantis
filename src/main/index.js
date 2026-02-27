const { app, BrowserWindow, ipcMain, nativeTheme, Tray, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset', // Makes it look native on macOS
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true, // Secure context
    },
    // macOS automatically uses the app icon if packaged, but we can set a runtime icon
    icon: path.join(__dirname, '../renderer/assets/icon.png')
  });

  // Load the index.html from the renderer directory
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  if (isDev) {
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('app:version', () => app.getVersion());

ipcMain.handle('data:read', async () => {
  try {
    const dataPath = path.join(__dirname, '../renderer/data.json');
    // Ensure we handle JSON parsing errors gracefully
    const data = await fs.promises.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read data.json:', error);
    // Return empty state or throw depending on desired UX
    throw error;
  }
});

ipcMain.on('notify', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});
