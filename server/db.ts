import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  icpData, 
  InsertIcpData, 
  executionLogs, 
  InsertExecutionLog,
  notificationRecipients,
  InsertNotificationRecipient,
  settings,
  InsertSetting,
  leads,
  InsertLead,
  auditLogs,
  InsertAuditLog,
  dataRetentionPolicy
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ICP Data helpers
export async function getAllIcpData() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(icpData);
}

export async function upsertIcpData(data: InsertIcpData[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Clear existing data and insert new
  await db.delete(icpData);
  if (data.length > 0) {
    await db.insert(icpData).values(data);
  }
}

export async function updateIcpDataItem(id: number, weight: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(icpData).set({ weight }).where(eq(icpData.id, id));
}

export async function deleteIcpDataItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(icpData).where(eq(icpData.id, id));
}

export async function updateIcpWeight(attribute: string, value: string, newWeight: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(icpData)
    .set({ weight: newWeight.toString() })
    .where(and(eq(icpData.attribute, attribute), eq(icpData.value, value)));
}

// Execution Log helpers
export async function createExecutionLog(log: InsertExecutionLog): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(executionLogs).values(log);
  // MySQL returns insertId in result
  return Number(result[0].insertId);
}

export async function updateExecutionLog(id: number, updates: Partial<InsertExecutionLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(executionLogs).set(updates).where(eq(executionLogs.id, id));
}

export async function getExecutionLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(executionLogs).orderBy(executionLogs.createdAt).limit(limit);
}

export async function getExecutionLogById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(executionLogs).where(eq(executionLogs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Notification Recipients helpers
export async function getAllNotificationRecipients() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(notificationRecipients);
}

export async function getActiveNotificationRecipients() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(notificationRecipients).where(eq(notificationRecipients.isActive, true));
}

export async function addNotificationRecipient(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(notificationRecipients).values({ email, isActive: true });
}

export async function toggleNotificationRecipient(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notificationRecipients).set({ isActive }).where(eq(notificationRecipients.id, id));
}

export async function deleteNotificationRecipient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(notificationRecipients).where(eq(notificationRecipients.id, id));
}

// Settings helpers
export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(settings).values({ key, value }).onDuplicateKeyUpdate({
    set: { value, updatedAt: new Date() },
  });
}

// Leads helpers for deduplication
export async function isEmailAlreadyProcessed(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
  return result.length > 0;
}

export async function addLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(leads).values(lead).onDuplicateKeyUpdate({
    set: { postedAt: new Date() },
  });
}

export async function getLeadsCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(leads);
  return result.length;
}

export async function getRecentLeads(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(leads).orderBy(leads.postedAt).limit(limit);
}

export async function getAllLeads() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(leads).orderBy(leads.postedAt);
}

// GDPR helpers
export async function getAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(auditLogs).orderBy(auditLogs.createdAt).limit(limit);
}

export async function getRetentionPolicies() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dataRetentionPolicy);
}
