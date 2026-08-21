import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { registerDashboardHandlers } from './ipc/dashboard';
import { registerPatientHandlers } from './ipc/patient';
import { registerVisitHandlers } from './ipc/visit';
import { registerAuditHandlers } from './ipc/audit';
import { registerBackupHandlers } from './ipc/backup';
import { registerSettingsHandlers } from './ipc/settings';
import { registerAnalyticsHandlers } from './ipc/analytics';
import { registerExportHandlers } from './ipc/export';
import { SettingsService } from './services/SettingsService';

app.setName('MediLog');
app.setAppUserModelId('com.medilog.app');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    frame: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  registerDashboardHandlers();
  registerPatientHandlers();
  registerVisitHandlers();
  registerAuditHandlers();
  registerBackupHandlers();
  registerSettingsHandlers();
  registerAnalyticsHandlers();
  registerExportHandlers();

  await SettingsService.ensureDefaultSettings();

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
