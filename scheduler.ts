import cron from 'node-cron';
import { runProspectingEngine } from './prospectingEngine';
import { cleanupOldData } from './gdprService';
import { sendWeeklySummary } from './weeklySummaryService';

/**
 * Initialize the scheduler for daily prospecting runs
 * Runs every day at 7:00 AM GMT
 */
export function initializeScheduler(): void {
  // Prospecting run: Every day at 7:00 AM GMT
  const prospectingCron = '0 7 * * *';
  
  // GDPR cleanup: Every day at 2:00 AM GMT
  const gdprCleanupCron = '0 2 * * *';

  console.log('[Scheduler] Initializing daily prospecting scheduler (7:00 AM GMT)');

  cron.schedule(prospectingCron, async () => {
    console.log('[Scheduler] Starting scheduled prospecting run at', new Date().toISOString());
    
    try {
      const result = await runProspectingEngine(100, 'scheduled');
      
      if (result.success) {
        console.log(`[Scheduler] Completed successfully: ${result.leadsPosted} leads posted`);
      } else {
        console.error(`[Scheduler] Failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('[Scheduler] Unexpected error during scheduled run:', error.message);
    }
  }, {
    timezone: 'GMT'
  });

  console.log('[Scheduler] Initializing GDPR data cleanup scheduler (2:00 AM GMT)');

  cron.schedule(gdprCleanupCron, async () => {
    console.log('[Scheduler] Starting scheduled GDPR data cleanup at', new Date().toISOString());
    
    try {
      const result = await cleanupOldData();
      console.log('[Scheduler] GDPR cleanup completed:', result.deleted);
    } catch (error: any) {
      console.error('[Scheduler] GDPR cleanup failed:', error.message);
    }
  }, {
    timezone: 'GMT'
  });

  // Weekly summary: Every Monday at 9:00 AM GMT
  const weeklySummaryCron = '0 9 * * 1';

  console.log('[Scheduler] Initializing weekly summary scheduler (Monday 9:00 AM GMT)');

  cron.schedule(weeklySummaryCron, async () => {
    console.log('[Scheduler] Sending weekly summary at', new Date().toISOString());
    
    try {
      await sendWeeklySummary();
      console.log('[Scheduler] Weekly summary sent successfully');
    } catch (error: any) {
      console.error('[Scheduler] Weekly summary failed:', error.message);
    }
  }, {
    timezone: 'GMT'
  });

  console.log('[Scheduler] All schedulers initialized successfully');
}
