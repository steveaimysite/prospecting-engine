import { Resend } from 'resend';
import { getExecutionLogs, getAllNotificationRecipients, getLeadsCount } from './db';
import { analyzeIcpPerformance } from './icpLearningService';

interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  totalRuns: number;
  successfulRuns: number;
  totalLeadsPosted: number;
  avgLeadsPerRun: number;
  successRate: number;
  topIcpInsights: string[];
  recommendations: string[];
}

/**
 * Generate weekly summary statistics
 */
export async function generateWeeklySummary(): Promise<WeeklySummary> {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(now);
  weekEnd.setHours(23, 59, 59, 999);

  // Get execution logs from the past week
  const allLogs = await getExecutionLogs(1000);
  const weekLogs = allLogs.filter(log => {
    const logDate = new Date(log.startedAt);
    return logDate >= weekStart && logDate <= weekEnd;
  });

  const totalRuns = weekLogs.length;
  const successfulRuns = weekLogs.filter(log => log.status === 'completed').length;
  const totalLeadsPosted = weekLogs.reduce((sum, log) => sum + (log.leadsPosted || 0), 0);
  const avgLeadsPerRun = totalRuns > 0 ? totalLeadsPosted / totalRuns : 0;
  const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

  // Run ICP analysis if we have enough data
  let topIcpInsights: string[] = [];
  let recommendations: string[] = [];

  try {
    const acApiUrl = process.env.AC_API_URL;
    const acApiToken = process.env.AC_API_TOKEN;

    if (acApiUrl && acApiToken && totalLeadsPosted > 10) {
      const analysis = await analyzeIcpPerformance(acApiUrl, acApiToken);
      
      // Extract top 3 insights
      if (analysis.topPerformers.length > 0) {
        topIcpInsights = analysis.topPerformers.slice(0, 3).map(perf => 
          `${perf.attribute}: ${perf.value} (${perf.avgEngagement.toFixed(1)} engagement, ${perf.leadsGenerated} leads)`
        );
      }

      recommendations = analysis.recommendations;
    }
  } catch (error: any) {
    console.warn('[Weekly Summary] Could not fetch ICP insights:', error.message);
  }

  return {
    weekStart,
    weekEnd,
    totalRuns,
    successfulRuns,
    totalLeadsPosted,
    avgLeadsPerRun,
    successRate,
    topIcpInsights,
    recommendations,
  };
}

/**
 * Send weekly summary email
 */
export async function sendWeeklySummary(): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  if (!resendApiKey) {
    console.log('[Weekly Summary] Resend API key not configured, logging summary instead');
    const summary = await generateWeeklySummary();
    console.log('[Weekly Summary]', JSON.stringify(summary, null, 2));
    return;
  }

  const resend = new Resend(resendApiKey);
  const summary = await generateWeeklySummary();
  const recipients = await getAllNotificationRecipients();
  const activeRecipients = recipients.filter((r: any) => r.isActive);

  if (activeRecipients.length === 0) {
    console.log('[Weekly Summary] No active recipients configured');
    return;
  }

  const weekStartStr = summary.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekEndStr = summary.weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Prospecting Summary</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">📊 Weekly Prospecting Summary</h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">${weekStartStr} - ${weekEndStr}</p>
            </td>
          </tr>

          <!-- Stats Grid -->
          <tr>
            <td style="padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">${summary.totalRuns}</div>
                    <div style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Total Runs</div>
                  </td>
                  <td width="10"></td>
                  <td width="50%" style="padding: 20px; background-color: #f0fdf4; border-radius: 8px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700; color: #15803d; margin-bottom: 8px;">${summary.totalLeadsPosted}</div>
                    <div style="font-size: 14px; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">Leads Posted</div>
                  </td>
                </tr>
                <tr><td colspan="3" height="10"></td></tr>
                <tr>
                  <td width="50%" style="padding: 20px; background-color: #eff6ff; border-radius: 8px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${summary.successRate.toFixed(0)}%</div>
                    <div style="font-size: 14px; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px;">Success Rate</div>
                  </td>
                  <td width="10"></td>
                  <td width="50%" style="padding: 20px; background-color: #faf5ff; border-radius: 8px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700; color: #7c3aed; margin-bottom: 8px;">${summary.avgLeadsPerRun.toFixed(1)}</div>
                    <div style="font-size: 14px; color: #8b5cf6; text-transform: uppercase; letter-spacing: 0.5px;">Avg Per Run</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${summary.topIcpInsights.length > 0 ? `
          <!-- Top Performing ICPs -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1e293b;">🎯 Top Performing ICP Attributes</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
                ${summary.topIcpInsights.map((insight, i) => `
                <tr>
                  <td style="padding: 12px 0; ${i < summary.topIcpInsights.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''}">
                    <div style="display: flex; align-items: center;">
                      <span style="display: inline-block; width: 24px; height: 24px; background-color: #10b981; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; margin-right: 12px;">${i + 1}</span>
                      <span style="font-size: 14px; color: #475569;">${insight}</span>
                    </div>
                  </td>
                </tr>
                `).join('')}
              </table>
            </td>
          </tr>
          ` : ''}

          ${summary.recommendations.length > 0 ? `
          <!-- Recommendations -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1e293b;">💡 AI-Powered Recommendations</h2>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;">
                ${summary.recommendations.map(rec => `
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #78350f; line-height: 1.6;">${rec}</p>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8fafc; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">
                This is an automated weekly summary from your Prospecting Engine.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8;">
                Sent on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  for (const recipient of activeRecipients) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: recipient.email,
        subject: `📊 Weekly Prospecting Summary: ${summary.totalLeadsPosted} leads posted`,
        html: htmlContent,
      });

      console.log(`[Weekly Summary] Sent to ${recipient.email}`);
    } catch (error: any) {
      console.error(`[Weekly Summary] Failed to send to ${recipient.email}:`, error.message);
    }
  }
}
