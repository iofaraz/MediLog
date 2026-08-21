import { db } from '../db';
import { patients, visits, auditLogs } from '../db/schema';
import { sql, desc } from 'drizzle-orm';

export class AnalyticsService {
  static async getDashboardMetrics() {
    try {
      // 1. Total counts
      const [patientsCount] = await db.select({ count: sql<number>`count(*)` }).from(patients);
      const [visitsCount] = await db.select({ count: sql<number>`count(*)` }).from(visits);

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
      // Since date is an integer timestamp in JS, we need to group by day.
      // Drizzle doesn't have native day-grouping for SQLite integer timestamps out of the box,
      // so we'll fetch all visits and bucket them in JS for safety and cross-platform consistency.
      const allVisits = await db.select({ date: visits.date }).from(visits);
      
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      // Initialize buckets for the last 14 days
      const visitsByDateMap = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
        visitsByDateMap.set(dateStr, 0);
      }

      // Fill buckets
      allVisits.forEach(v => {
        const d = new Date(v.date);
        const dateStr = d.toISOString().slice(0, 10);
        if (visitsByDateMap.has(dateStr)) {
          visitsByDateMap.set(dateStr, visitsByDateMap.get(dateStr)! + 1);
        }
      });

      const visitsByDate = Array.from(visitsByDateMap.entries()).map(([date, count]) => {
        // Format to "MMM DD"
        const [, month, day] = date.split('-');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const shortDate = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
        return { date: shortDate, visits: count };
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
