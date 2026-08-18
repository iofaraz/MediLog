import { ipcMain } from 'electron';
import { MedicationService } from '../services/MedicationService';

export function registerMedicationHandlers() {
  // Medications Catalog
  ipcMain.handle('medication:getAll', async (_event, searchQuery?: string) => {
    return await MedicationService.getAllMedications(searchQuery);
  });

  ipcMain.handle('medication:create', async (_event, data: any) => {
    return await MedicationService.createMedication(data);
  });

  ipcMain.handle('medication:update', async (_event, id: string, data: any) => {
    return await MedicationService.updateMedication(id, data);
  });

  ipcMain.handle('medication:delete', async (_event, id: string) => {
    return await MedicationService.deleteMedication(id);
  });

  // Prescriptions
  ipcMain.handle('prescription:getByVisit', async (_event, visitId: string) => {
    return await MedicationService.getPrescriptionsByVisit(visitId);
  });

  ipcMain.handle('prescription:create', async (_event, data: any) => {
    return await MedicationService.createPrescription(data);
  });

  ipcMain.handle('prescription:delete', async (_event, id: string) => {
    return await MedicationService.deletePrescription(id);
  });
}
