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