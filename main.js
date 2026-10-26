const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const si = require('systeminformation');
const path = require('node:path');
const packageInfo = require('./package.json');

let mainWindow;

function sendUpdateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', status);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 760,
    minHeight: 600,
    backgroundColor: '#f2f4f1',
    title: 'Opernix',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.loadFile('index.html');
}

ipcMain.handle('system:get-info', async () => {
  const [os, cpu, memory, graphics, filesystems, disks, load, network, battery, time, board, bios, system] = await Promise.all([
    si.osInfo(), si.cpu(), si.mem(), si.graphics(), si.fsSize(), si.diskLayout(),
    si.currentLoad(), si.networkInterfaces(), si.battery(), si.time(),
    si.baseboard(), si.bios(), si.system()
  ]);
  return { os, cpu, memory, graphics, filesystems, disks, load, network, battery, time, board, bios, system, hostname: os.hostname };
});

ipcMain.handle('app:get-info', () => ({
  version: app.getVersion(),
  releasesUrl: `https://github.com/${packageInfo.build.publish.owner}/${packageInfo.build.publish.repo}/releases`
}));

ipcMain.handle('updates:check', async () => {
  if (!app.isPackaged) return { status: 'dev-mode' };
  try {
    const result = await autoUpdater.checkForUpdates();
    return { status: 'checked', version: result?.updateInfo?.version };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
});

ipcMain.handle('updates:download', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { status: 'downloading' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
});

ipcMain.handle('updates:install', () => autoUpdater.quitAndInstall());

ipcMain.handle('app:open-external', async (_event, url) => {
  if (typeof url === 'string' && url.startsWith('https://')) await shell.openExternal(url);
});

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.on('checking-for-update', () => sendUpdateStatus({ status: 'checking' }));
autoUpdater.on('update-available', (info) => sendUpdateStatus({ status: 'available', version: info.version }));
autoUpdater.on('update-not-available', () => sendUpdateStatus({ status: 'current' }));
autoUpdater.on('download-progress', (progress) => sendUpdateStatus({ status: 'downloading', percent: progress.percent }));
autoUpdater.on('update-downloaded', (info) => sendUpdateStatus({ status: 'downloaded', version: info.version }));
autoUpdater.on('error', (error) => sendUpdateStatus({ status: 'error', message: error.message }));

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});