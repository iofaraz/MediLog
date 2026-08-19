import { ipcMain } from 'electron';
import { PatientService } from '../services/PatientService';

export function registerPatientHandlers() {
  ipcMain.handle('patient:getAll', async (_event, options?: { searchQuery?: string; gender?: string }) => {
    return await PatientService.getPatients(options || {});
  });

  ipcMain.handle('patient:getById', async (_event, id: string) => {
    return await PatientService.getPatientById(id);
  });

  ipcMain.handle('patient:create', async (_event, data: unknown, userId: string) => {
    return await PatientService.createPatient(data, userId);
  });

  ipcMain.handle('patient:update', async (_event, id: string, data: unknown, userId: string) => {
    return await PatientService.updatePatient(id, data, userId);
  });

  ipcMain.handle('patient:delete', async (_event, id: string, userId: string) => {
    return await PatientService.deletePatient(id, userId);
  });
}
