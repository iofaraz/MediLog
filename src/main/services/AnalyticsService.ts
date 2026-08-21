import { db } from '../db';
import { patients, visits, auditLogs } from '../db/schema';
import { desc, eq, sql } from 'drizzle-orm';

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateKey(dateKey: string) {
  const [, month, day] = dateKey.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[Number(month) - 1]} ${Number(day)}`;
}

export class AnalyticsService {
  static async getDashboardMetrics() {
    try {
      // 1. Total counts
      const [patientsCount] = await db.select({ count: sql<number>`count(*)` }).from(patients);
      const [visitsCount] = await db.select({ count: sql<number>`count(*)` }).from(visits).where(eq(visits.isVoided, false));

      // 2. Patient Demographics (Gender Distribution)
      const demographicsRaw = await db.select({
        gender: patients.gender,
        count: sql<number>`count(*)`
      }).from(patients).groupBy(patients.gender);
      
      const demographics = demographicsRaw.map(d => ({
        name: d.gender.charAt(0).toUpperCase() + d.gender.slice(1),
        value: Number(d.count)
      }));

      // 3. Visits by Date (last 14 days approximation, using SQLite date/time functions)
      // Since date is an integer timestamp in JS, we need to group by day in the user's local timezone.
      // Drizzle doesn't have native day-grouping for SQLite integer timestamps out of the box,
      // so we'll fetch all non-voided visits and bucket them in JS for safety and cross-platform consistency.
      const allVisits = await db
        .select({ date: visits.date })
        .from(visits)
        .where(eq(visits.isVoided, false));
      
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      // Initialize buckets for the last 14 days, including today.
      const visitsByDateMap = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateKey(d);
        visitsByDateMap.set(dateStr, 0);
      }

      // Fill buckets
      allVisits.forEach(v => {
        const d = new Date(v.date);
        const dateStr = getLocalDateKey(d);
        if (visitsByDateMap.has(dateStr)) {
          visitsByDateMap.set(dateStr, visitsByDateMap.get(dateStr)! + 1);
        }
      });

      const visitsByDate = Array.from(visitsByDateMap.entries()).map(([date, count]) => {
        return { date: formatDateKey(date), visits: count };
      });

      // 4. Recent Activity (Last 5 audit logs)
      const recentActivity = await db.select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.timestamp))
        .limit(5);

      return {
        success: true,
        data: {
          totalPatients: patientsCount.count,
          totalVisits: visitsCount.count,
          demographics,
          visitsByDate,
          recentActivity
        }
      };
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return { success: false, error: 'Failed to generate analytics' };
    }
  }
}
