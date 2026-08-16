import { ipcMain } from 'electron';
import { VisitService } from '../services/VisitService';

export function registerVisitHandlers() {
  ipcMain.handle('visit:getByPatient', async (_event, patientId: string) => {
    return await VisitService.getVisitsByPatient(patientId);
  });

  ipcMain.handle('visit:create', async (_event, data: any) => {
    return await VisitService.createVisit(data);
  });

  ipcMain.handle('visit:update', async (_event, id: string, data: any) => {
    return await VisitService.updateVisit(id, data);
  });

  ipcMain.handle('visit:void', async (_event, id: string) => {
    return await VisitService.voidVisit(id);
  });
}
