import { ipcMain, dialog, BrowserWindow } from 'electron';
import { db } from '../db';
import { patients, visits, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import fs from 'fs/promises';

function toCSV(headers: string[], rows: Record<string, any>[]): string {
  const escape = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const headerLine = headers.map(escape).join(',');
  const dataLines = rows.map(row => headers.map(h => escape(row[h])).join(','));
  return [headerLine, ...dataLines].join('\n');
}

export function registerExportHandlers() {
  ipcMain.handle('export:patients', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return { success: false, error: 'No active window found.' };

    const { filePath } = await dialog.showSaveDialog(window, {
      title: 'Export Patients to CSV',
      defaultPath: `medilog_patients_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: 'CSV File', extensions: ['csv'] }]
    });

    if (!filePath) return { success: false, error: 'Export cancelled.' };

    try {
      const allPatients = await db.select().from(patients).orderBy(desc(patients.createdAt));
      const rows = allPatients.map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        dob: new Date(p.dob).toISOString().slice(0, 10),
        gender: p.gender,
        contactNumber: p.contactNumber ?? '',
        address: p.address ?? '',
        createdAt: new Date(p.createdAt).toISOString().slice(0, 10)
      }));

      const headers = ['id', 'firstName', 'lastName', 'dob', 'gender', 'contactNumber', 'address', 'createdAt'];
      await fs.writeFile(filePath, toCSV(headers, rows), 'utf-8');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Failed to export: ' + error.message };
    }
  });

  ipcMain.handle('export:visits', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return { success: false, error: 'No active window found.' };

    const { filePath } = await dialog.showSaveDialog(window, {
      title: 'Export Visits to CSV',
      defaultPath: `medilog_visits_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: 'CSV File', extensions: ['csv'] }]
    });

    if (!filePath) return { success: false, error: 'Export cancelled.' };

    try {
      const allVisits = await db
        .select({
          id: visits.id,
          date: visits.date,
          patientId: visits.patientId,
          reason: visits.reason,
          diagnosis: visits.diagnosis,
          notes: visits.notes,
          isVoided: visits.isVoided,
          doctorName: users.name,
        })
        .from(visits)
        .leftJoin(users, eq(visits.doctorId, users.id))
        .orderBy(desc(visits.date));

      const rows = allVisits.map(v => ({
        id: v.id,
        date: new Date(v.date).toISOString().slice(0, 10),
        patientId: v.patientId,
        doctor: v.doctorName ?? '',
        reason: v.reason ?? '',
        diagnosis: v.diagnosis ?? '',
        notes: v.notes ?? '',
        isVoided: v.isVoided ? 'Yes' : 'No'
      }));

      const headers = ['id', 'date', 'patientId', 'doctor', 'reason', 'diagnosis', 'notes', 'isVoided'];
      await fs.writeFile(filePath, toCSV(headers, rows), 'utf-8');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Failed to export: ' + error.message };
    }
  });
}
