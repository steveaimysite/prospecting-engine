import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * ICP (Ideal Customer Profile) data table
 * Stores weighted attributes for search query building
 */
export const icpData = mysqlTable("icp_data", {
  id: int("id").autoincrement().primaryKey(),
  attribute: varchar("attribute", { length: 100 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  weight: decimal("weight", { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IcpData = typeof icpData.$inferSelect;
export type InsertIcpData = typeof icpData.$inferInsert;

/**
 * Execution logs for daily prospecting runs
 */
export const executionLogs = mysqlTable("execution_logs", {
  id: int("id").autoincrement().primaryKey(),
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["running", "completed", "failed"]).notNull(),
  domainsFound: int("domainsFound").default(0),
  emailsFound: int("emailsFound").default(0),
  leadsPosted: int("leadsPosted").default(0),
  errorMessage: text("errorMessage"),
  searchQuery: text("searchQuery"),
  triggeredBy: varchar("triggeredBy", { length: 50 }).default("scheduled"), // "scheduled" or "manual"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExecutionLog = typeof executionLogs.$inferSelect;
export type InsertExecutionLog = typeof executionLogs.$inferInsert;

/**
 * Email notification recipients
 */
export const notificationRecipients = mysqlTable("notification_recipients", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NotificationRecipient = typeof notificationRecipients.$inferSelect;
export type InsertNotificationRecipient = typeof notificationRecipients.$inferInsert;

/**
 * Application settings
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Leads table for deduplication tracking
 * Stores all leads that have been posted to ActiveCampaign
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }).notNull(),
  postedAt: timestamp("postedAt").defaultNow().notNull(),
  executionLogId: int("executionLogId"),
  searchQuery: text("searchQuery"), // The exact Google search query used to find this lead
  icpSnapshot: text("icpSnapshot"), // JSON snapshot of ICP weights at time of discovery
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Audit log for GDPR compliance
 * Tracks all data operations on PII
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 50 }).notNull(), // 'create', 'read', 'update', 'delete', 'export'
  entityType: varchar("entityType", { length: 50 }).notNull(), // 'lead', 'user', etc.
  entityId: int("entityId"),
  userId: int("userId"), // Who performed the action
  details: text("details"), // JSON string with additional context
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Data retention policy tracking
 * Manages automatic deletion of old data per GDPR
 */
export const dataRetentionPolicy = mysqlTable("data_retention_policy", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 50 }).notNull().unique(), // 'lead', 'execution_log', 'audit_log'
  retentionDays: int("retentionDays").notNull(), // How many days to keep
  lastCleanupAt: timestamp("lastCleanupAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataRetentionPolicy = typeof dataRetentionPolicy.$inferSelect;
export type InsertDataRetentionPolicy = typeof dataRetentionPolicy.$inferInsert;

/**
 * A/B Testing for ICP variations
 */
export const abTests = mysqlTable("ab_tests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "running", "completed", "cancelled"]).default("draft").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  winningVariantId: int("winningVariantId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AbTest = typeof abTests.$inferSelect;
export type InsertAbTest = typeof abTests.$inferInsert;

export const abTestVariants = mysqlTable("ab_test_variants", {
  id: int("id").autoincrement().primaryKey(),
  testId: int("testId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  icpSnapshot: text("icpSnapshot").notNull(), // JSON snapshot of ICP weights
  executionCount: int("executionCount").default(0).notNull(),
  totalLeads: int("totalLeads").default(0).notNull(),
  avgEngagement: varchar("avgEngagement", { length: 10 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AbTestVariant = typeof abTestVariants.$inferSelect;
export type InsertAbTestVariant = typeof abTestVariants.$inferInsert;
