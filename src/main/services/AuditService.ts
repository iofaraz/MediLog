import { and, desc, eq, gte, lte } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../db';
import { auditLogs } from '../db/schema';

interface LogOptions {
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
}

interface GetLogsOptions {
  entityType?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export class AuditService {
  static log(options: LogOptions, executor: typeof db = db) {
    try {
      executor.insert(auditLogs).values({
        id: crypto.randomUUID(),
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        details: options.details || null,
        timestamp: new Date(),
      }).run();
    } catch (error) {
      console.error('Failed to write audit log:', error);
      throw error;
    }
  }

  static async getLogs(options: GetLogsOptions = {}) {
    try {
      const conditions: any[] = [];

      if (options.entityType) {
        conditions.push(eq(auditLogs.entityType, options.entityType));
      }

      if (options.action) {
        conditions.push(eq(auditLogs.action, options.action));
      }

      if (options.startDate) {
        conditions.push(gte(auditLogs.timestamp, options.startDate));
      }

      if (options.endDate) {
        conditions.push(lte(auditLogs.timestamp, options.endDate));
      }

      const results = await db
        .select()
        .from(auditLogs)
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
