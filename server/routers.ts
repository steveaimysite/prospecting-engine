import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { runProspectingEngine, syncIcpDataFromSheets } from "./prospectingEngine";
import { deletePersonalData, exportPersonalData, getRetentionStats, cleanupOldData } from "./gdprService";
import { analyzeIcpPerformance } from "./icpLearningService";
import { getRateLimitStatus, canProceedWithProspecting } from "./rateLimitService";
import * as abTestService from "./abTestService";
import { sendWeeklySummary } from "./weeklySummaryService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

   // ICP Learning & Analytics
  icpAnalytics: router({
    // Run engagement analysis and get optimization suggestions
    analyze: protectedProcedure.mutation(async () => {
      const acApiUrl = process.env.AC_API_URL;
      const acApiToken = process.env.AC_API_TOKEN;
      
      if (!acApiUrl || !acApiToken) {
        throw new Error('ActiveCampaign credentials not configured');
      }
      
      return await analyzeIcpPerformance(acApiUrl, acApiToken);
    }),
  }),

  // ICP Management
  icp: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllIcpData();
    }),
    
    applyRecommendations: protectedProcedure
      .input(z.object({
        recommendations: z.array(z.object({
          attribute: z.string(),
          value: z.string(),
          newWeight: z.number(),
        })),
      }))
      .mutation(async ({ input }) => {
        // Apply weight updates
        for (const rec of input.recommendations) {
          await db.updateIcpWeight(rec.attribute, rec.value, rec.newWeight);
        }
        return { success: true, applied: input.recommendations.length };
      }),

    previewQuery: protectedProcedure.query(async () => {
      const icpData = await db.getAllIcpData();
      if (icpData.length === 0) {
        return { query: '', error: 'No ICP data found. Please sync from Google Sheets first.' };
      }
      
      // Build search query using the same logic as prospecting engine
      const grouped = icpData.reduce((acc, item) => {
        const weight = parseFloat(item.weight);
        if (weight > 0) {
          if (!acc[item.attribute]) {
            acc[item.attribute] = [];
          }
          acc[item.attribute].push({ value: item.value, weight });
        }
        return acc;
      }, {} as Record<string, Array<{ value: string; weight: number }>>);

      const queryParts: string[] = [];
      for (const [attribute, values] of Object.entries(grouped)) {
        if (values.length > 0) {
          const sortedValues = values.sort((a, b) => b.weight - a.weight);
          const valueStrings = sortedValues.map(v => `"${v.value}"`).join(' OR ');
          queryParts.push(`(${valueStrings})`);
        }
      }

      return { query: queryParts.join(' AND '), error: null };
    }),
    
    sync: protectedProcedure
      .input(z.object({ sheetId: z.string() }))
      .mutation(async ({ input }) => {
        await syncIcpDataFromSheets(input.sheetId);
        return { success: true };
      }),
    
    updateWeight: protectedProcedure
      .input(z.object({ id: z.number(), weight: z.string() }))
      .mutation(async ({ input }) => {
        await db.updateIcpDataItem(input.id, input.weight);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteIcpDataItem(input.id);
        return { success: true };
      }),
  }),

  // Prospecting Engine
  prospecting: router({
    run: protectedProcedure
      .input(z.object({ targetLeads: z.number().default(100) }))
      .mutation(async ({ input }) => {
        const result = await runProspectingEngine(input.targetLeads, 'manual');
        return result;
      }),
    
    logs: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await db.getExecutionLogs(input.limit);
      }),
    
    logDetail: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getExecutionLogById(input.id);
      }),
  }),

  // Notification Recipients
  notifications: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllNotificationRecipients();
    }),
    
    add: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await db.addNotificationRecipient(input.email);
        return { success: true };
      }),
    
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.toggleNotificationRecipient(input.id, input.isActive);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteNotificationRecipient(input.id);
        return { success: true };
      }),
  }),

  // Leads Statistics
  leads: router({
    count: protectedProcedure.query(async () => {
      return await db.getLeadsCount();
    }),
    
    recent: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await db.getRecentLeads(input.limit);
      }),
    
    // Export all leads to CSV
    exportAll: protectedProcedure.query(async () => {
      return await db.getAllLeads();
    }),
  }),

  // Rate Limit Monitoring
  rateLimit: router({
    status: protectedProcedure.query(() => {
      return getRateLimitStatus();
    }),
    
    checkCapacity: protectedProcedure
      .input(z.object({ targetLeads: z.number() }))
      .query(({ input }) => {
        return canProceedWithProspecting(input.targetLeads);
      }),
  }),

  // A/B Testing
  abTest: router({
    list: protectedProcedure.query(async () => {
      return await abTestService.getAllTests();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        variantAName: z.string(),
        variantBName: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await abTestService.createTest(input);
      }),

    start: protectedProcedure
      .input(z.object({ testId: z.number() }))
      .mutation(async ({ input }) => {
        return await abTestService.startTest(input.testId);
      }),

    stop: protectedProcedure
      .input(z.object({ testId: z.number() }))
      .mutation(async ({ input }) => {
        return await abTestService.stopTest(input.testId);
      }),
  }),

  // Manual triggers (for testing)
  manual: router({
    sendWeeklySummary: protectedProcedure.mutation(async () => {
      await sendWeeklySummary();
      return { success: true };
    }),
  }),

  // GDPR Compliance
  gdpr: router({
    // Export personal data (Subject Access Request)
    exportData: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const ipAddress = ctx.req.ip || ctx.req.socket.remoteAddress || 'unknown';
        return await exportPersonalData(input.email, {
          userId: ctx.user.id,
          ipAddress,
        });
      }),
    
    // Delete personal data (Right to be Forgotten)
    deleteData: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const ipAddress = ctx.req.ip || ctx.req.socket.remoteAddress || 'unknown';
        await deletePersonalData(input.email, {
          userId: ctx.user.id,
          ipAddress,
        });
        return { success: true };
      }),
    
    // Get retention statistics
    retentionStats: protectedProcedure.query(async () => {
      return await getRetentionStats();
    }),
    
    // Manual data cleanup (admin only)
    cleanupOldData: protectedProcedure.mutation(async () => {
      return await cleanupOldData();
    }),
    
    // Get audit logs
    auditLogs: protectedProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return await db.getAuditLogs(input.limit);
      }),
    
    // Get retention policies
    retentionPolicies: protectedProcedure.query(async () => {
      return await db.getRetentionPolicies();
    }),
  }),

  // Settings
  settings: router({
    get: protectedProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await db.getSetting(input.key);
      }),
    
    set: protectedProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await db.setSetting(input.key, input.value);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
