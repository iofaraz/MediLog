import { db } from '../db';
import { auditLogs } from '../db/schema';
import { desc, eq, and, gte, lte } from 'drizzle-orm';
import crypto from 'crypto';

interface LogOptions {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
}

interface GetLogsOptions {
  entityType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export class AuditService {
  static async log(options: LogOptions) {
    try {
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: options.userId,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        details: options.details || null,
        timestamp: new Date(),
      });
    } catch (error) {
      // Audit log failures should never crash the main operation
      console.error('Failed to write audit log:', error);
    }
  }

  static async getLogs(options: GetLogsOptions = {}) {
    try {
      const conditions: any[] = [];

      if (options.entityType) {
        conditions.push(eq(auditLogs.entityType, options.entityType));
      }
      if (options.userId) {
        conditions.push(eq(auditLogs.userId, options.userId));
      }
      if (options.startDate) {
        conditions.push(gte(auditLogs.timestamp, options.startDate));
      }
      if (options.endDate) {
        conditions.push(lte(auditLogs.timestamp, options.endDate));
      }

      const results = await db.select().from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(auditLogs.timestamp))
        .limit(options.limit || 200);

      return { success: true, data: results };
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return { success: false, error: 'Failed to retrieve audit logs' };
    }
  }
}
