import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { registerAuthHandlers } from './ipc/auth';
import { registerDashboardHandlers } from './ipc/dashboard';
import { registerMedicationHandlers } from './ipc/medication';
import { registerPatientHandlers } from './ipc/patient';
import { registerVisitHandlers } from './ipc/visit';
import { registerAuditHandlers } from './ipc/audit';
import { registerBackupHandlers } from './ipc/backup';
import { registerSettingsHandlers } from './ipc/settings';
import { registerUserHandlers } from './ipc/users';
import { registerAnalyticsHandlers } from './ipc/analytics';
import { registerExportHandlers } from './ipc/export';
import { AuthService } from './services/AuthService';

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
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
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
  // Register all IPC handlers before window creation
  registerAuthHandlers();
  registerDashboardHandlers();
  registerPatientHandlers();
  registerVisitHandlers();
  registerMedicationHandlers();
  registerAuditHandlers();
  registerBackupHandlers();
  registerSettingsHandlers();
  registerUserHandlers();
  registerAnalyticsHandlers();
  registerExportHandlers();

  // Setup default admin user if not present
  await AuthService.setupDefaultAdmin();

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
