import { db } from '../db';
import { patients, visits } from '../db/schema';
import { and, count, eq, gte, lt } from 'drizzle-orm';

export class DashboardService {
  static async getDashboardStats() {
    try {
      // Get total patients
      const [{ totalPatients }] = await db
        .select({ totalPatients: count() })
        .from(patients);

      // Get today's visits
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfTomorrow = new Date(startOfDay);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const [{ todayVisits }] = await db
        .select({ todayVisits: count() })
        .from(visits)
        .where(
          and(
            gte(visits.date, startOfDay),
            lt(visits.date, startOfTomorrow),
            eq(visits.isVoided, false),
          )
        );

      // Pending Follow-ups (Placeholder for now, could be visits in the future or specifically marked)
      const pendingFollowUps = 0;

      return {
        success: true,
        stats: {
          totalPatients,
          todayVisits,
          pendingFollowUps,
        },
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      return { success: false, error: 'Failed to retrieve dashboard statistics' };
    }
  }
}
