import { db } from '../db';
import { settings } from '../db/schema';
import { AuditService } from './AuditService';

export class SettingsService {
  static async getAllSettings() {
    try {
      const results = await db.select().from(settings);
      const settingsMap: Record<string, string> = {};
      results.forEach((row) => {
        settingsMap[row.key] = row.value;
      });
      return { success: true, data: settingsMap };
    } catch (error: any) {
      console.error('Failed to get settings:', error);
      return { success: false, error: 'Failed to retrieve settings' };
    }
  }

  static async updateSettings(newSettings: Record<string, string>, userId: string) {
    try {
      // Upsert each setting
      for (const [key, value] of Object.entries(newSettings)) {
        await db.insert(settings)
          .values({ key, value })
          .onConflictDoUpdate({ target: settings.key, set: { value } });
      }

      await AuditService.log({
        userId,
        action: 'UPDATE',
        entityType: 'SETTINGS',
        entityId: 'app_settings',
        details: 'Updated application settings'
      });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  }
}
