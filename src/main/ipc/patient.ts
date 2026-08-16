import { ipcMain } from 'electron';
import { PatientService } from '../services/PatientService';

export function registerPatientHandlers() {
  ipcMain.handle('patient:getAll', async (_event, searchQuery?: string) => {
    return await PatientService.getPatients(searchQuery);
  });

  ipcMain.handle('patient:getById', async (_event, id: string) => {
    return await PatientService.getPatientById(id);
  });

  ipcMain.handle('patient:create', async (_event, data: unknown) => {
    return await PatientService.createPatient(data);
  });

  ipcMain.handle('patient:update', async (_event, id: string, data: unknown) => {
    return await PatientService.updatePatient(id, data);
  });

  ipcMain.handle('patient:delete', async (_event, id: string) => {
    return await PatientService.deletePatient(id);
  });
}
