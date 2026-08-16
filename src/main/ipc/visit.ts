import { ipcMain } from 'electron';
import { VisitService } from '../services/VisitService';

export function registerVisitHandlers() {
  ipcMain.handle('visit:getByPatient', async (_event, patientId: string) => {
    return await VisitService.getVisitsByPatient(patientId);
  });
}
