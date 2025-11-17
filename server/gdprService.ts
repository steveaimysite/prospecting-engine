import { getDb } from './db';
import { auditLogs, dataRetentionPolicy, leads, executionLogs, InsertAuditLog } from '../drizzle/schema';
import { lt, sql } from 'drizzle-orm';

/**
 * GDPR Compliance Service
 * Handles data retention, audit logging, and right to be forgotten
 */

interface AuditContext {
  userId?: number;
  ipAddress?: string;
}

/**
 * Log data operation for GDPR audit trail
 */
export async function logAudit(
  action: 'create' | 'read' | 'update' | 'delete' | 'export',
  entityType: string,
  entityId: number | null,
  context: AuditContext,
  details?: Record<string, any>
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const auditEntry: InsertAuditLog = {
      action,
      entityType,
      entityId: entityId || undefined,
      userId: context.userId,
      ipAddress: context.ipAddress,
      details: details ? JSON.stringify(details) : undefined,
    };

    await db.insert(auditLogs).values(auditEntry);
  } catch (error: any) {
    console.error('[GDPR] Failed to log audit:', error.message);
    // Don't throw - audit logging failures shouldn't break operations
  }
}

/**
 * Initialize default data retention policies
 */
export async function initializeRetentionPolicies(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const defaultPolicies = [
    { entityType: 'lead', retentionDays: 730 }, // 2 years for leads (GDPR allows up to 6 years for B2B)
    { entityType: 'execution_log', retentionDays: 365 }, // 1 year for execution logs
    { entityType: 'audit_log', retentionDays: 2555 }, // 7 years for audit logs (legal requirement)
  ];

  for (const policy of defaultPolicies) {
    await db.insert(dataRetentionPolicy)
      .values(policy)
      .onDuplicateKeyUpdate({
        set: { retentionDays: policy.retentionDays },
      });
  }

  console.log('[GDPR] Data retention policies initialized');
}

/**
 * Clean up old data according to retention policies
 * Should be run daily via cron
 */
export async function cleanupOldData(): Promise<{ deleted: Record<string, number> }> {
  const db = await getDb();
  if (!db) return { deleted: {} };

  const deleted: Record<string, number> = {};

  try {
    // Get all retention policies
    const policies = await db.select().from(dataRetentionPolicy);

    for (const policy of policies) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

      let deletedCount = 0;

      switch (policy.entityType) {
        case 'lead':
          await db
            .delete(leads)
            .where(lt(leads.postedAt, cutoffDate));
          deletedCount = 0; // Count not available in this driver
          break;

        case 'execution_log':
          await db
            .delete(executionLogs)
            .where(lt(executionLogs.startedAt, cutoffDate));
          deletedCount = 0;
          break;

        case 'audit_log':
          await db
            .delete(auditLogs)
            .where(lt(auditLogs.createdAt, cutoffDate));
          deletedCount = 0;
          break;
      }

      deleted[policy.entityType] = deletedCount;

      // Update last cleanup timestamp
      await db
        .update(dataRetentionPolicy)
        .set({ lastCleanupAt: new Date() })
        .where(sql`entityType = ${policy.entityType}`);
    }

    console.log('[GDPR] Data cleanup completed:', deleted);
    return { deleted };
  } catch (error: any) {
    console.error('[GDPR] Data cleanup failed:', error.message);
    throw error;
  }
}

/**
 * Delete all data for a specific email (Right to be Forgotten)
 */
export async function deletePersonalData(email: string, context: AuditContext): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    // Find the lead
    const leadRecords = await db.select().from(leads).where(sql`email = ${email}`);
    
    if (leadRecords.length === 0) {
      throw new Error('No data found for this email');
    }

    const leadId = leadRecords[0].id;

    // Log the deletion request
    await logAudit('delete', 'lead', leadId, context, {
      email,
      reason: 'Right to be forgotten request',
    });

    // Delete the lead
    await db.delete(leads).where(sql`email = ${email}`);

    console.log(`[GDPR] Deleted personal data for: ${email}`);
  } catch (error: any) {
    console.error('[GDPR] Failed to delete personal data:', error.message);
    throw error;
  }
}

/**
 * Export all data for a specific email (Subject Access Request)
 */
export async function exportPersonalData(email: string, context: AuditContext): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    // Find all data for this email
    const leadData = await db.select().from(leads).where(sql`email = ${email}`);

    if (leadData.length === 0) {
      throw new Error('No data found for this email');
    }

    const exportData = {
      email,
      exportDate: new Date().toISOString(),
      data: {
        leads: leadData,
      },
    };

    // Log the export
    await logAudit('export', 'lead', leadData[0].id, context, {
      email,
      reason: 'Subject access request',
    });

    console.log(`[GDPR] Exported personal data for: ${email}`);
    return exportData;
  } catch (error: any) {
    console.error('[GDPR] Failed to export personal data:', error.message);
    throw error;
  }
}

/**
 * Get data retention statistics
 */
export async function getRetentionStats(): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  const policies = await db.select().from(dataRetentionPolicy);
  
  const stats = await Promise.all(
    policies.map(async (policy) => {
      let count = 0;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

      switch (policy.entityType) {
        case 'lead':
          const oldLeads = await db.select().from(leads).where(lt(leads.postedAt, cutoffDate));
          count = oldLeads.length;
          break;
        case 'execution_log':
          const oldLogs = await db.select().from(executionLogs).where(lt(executionLogs.startedAt, cutoffDate));
          count = oldLogs.length;
          break;
        case 'audit_log':
          const oldAudits = await db.select().from(auditLogs).where(lt(auditLogs.createdAt, cutoffDate));
          count = oldAudits.length;
          break;
      }

      return {
        entityType: policy.entityType,
        retentionDays: policy.retentionDays,
        recordsToDelete: count,
        lastCleanup: policy.lastCleanupAt,
      };
    })
  );

  return stats;
}
