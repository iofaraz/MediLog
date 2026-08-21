import { db } from '../db';
import { settings } from '../db/schema';
import { AuditService } from './AuditService';
import { settingsSchema } from '../../shared/schemas';

export const DEFAULT_SETTINGS = {
  clinicName: 'MediLog',
  clinicAddress: '',
  contactNumber: '',
  contactEmail: '',
  doctorName: 'Primary Clinician',
  profilePicture: '',
};

export class SettingsService {
  static ensureDefaultSettings(executor: typeof db = db) {
    const rows = executor.select().from(settings).all();
    const existing = new Map(rows.map((row) => [row.key, row.value]));
    const missing = Object.entries(DEFAULT_SETTINGS).filter(([key]) => !existing.has(key));

    if (missing.length === 0) {
      return;
    }

    for (const [key, value] of missing) {
      executor.insert(settings).values({ key, value }).run();
    }
  }

  static async getAllSettings() {
    try {
      this.ensureDefaultSettings();
      const results = db.select().from(settings).all();
      const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };

      results.forEach((row) => {
        settingsMap[row.key] = row.value;
      });

      return { success: true, data: settingsMap };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return { success: false, error: 'Failed to retrieve settings' };
    }
  }

  static async getDoctorName() {
    const result = await this.getAllSettings();
    if (result.success && result.data?.doctorName?.trim()) {
      return result.data.doctorName.trim();
    }
    return DEFAULT_SETTINGS.doctorName;
  }

  static async updateSettings(newSettings: Record<string, string>) {
    try {
      const parsed = settingsSchema.parse(newSettings);

      db.transaction((tx) => {
        this.ensureDefaultSettings(tx);

        for (const [key, value] of Object.entries(parsed)) {
          tx
            .insert(settings)
            .values({ key, value })
            .onConflictDoUpdate({ target: settings.key, set: { value } })
            .run();
        }

        AuditService.log(
          {
            action: 'Updated',
            entityType: 'Settings',
            entityId: 'app-settings',
            details: 'Updated application settings',
          },
          tx,
        );
      });

      return { success: true, data: { ...DEFAULT_SETTINGS, ...parsed } };
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      if (error?.name === 'ZodError') {
        return { success: false, error: 'Validation failed', details: error.errors };
      }
      return { success: false, error: 'Failed to update settings' };
    }
  }

  static async getSetting(key: keyof typeof DEFAULT_SETTINGS) {
    const result = await this.getAllSettings();
    if (!result.success || !result.data) {
      return DEFAULT_SETTINGS[key];
    }
    return result.data[key] || DEFAULT_SETTINGS[key];
  }
}
