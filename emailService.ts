import { Resend } from 'resend';
import { getActiveNotificationRecipients } from './db';

interface EmailNotificationData {
  executionLogId: number;
  status: 'completed' | 'failed';
  domainsFound: number;
  emailsFound: number;
  leadsPosted: number;
  duplicatesSkipped?: number;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}

/**
 * Send email notification using Resend
 * Resend is the recommended email service for Railway.app deployments
 * - Free tier: 3,000 emails/month, 100 emails/day
 * - Simple API, great Railway integration
 * - No credit card required for free tier
 */
export async function sendDailyReport(data: EmailNotificationData): Promise<void> {
  try {
    const recipients = await getActiveNotificationRecipients();
    
    if (recipients.length === 0) {
      console.log('[Email] No active recipients configured, skipping notification');
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // Default Resend test email

    if (!resendApiKey) {
      console.warn('[Email] RESEND_API_KEY not configured, logging notification instead');
      logEmailToConsole(data, recipients.map(r => r.email));
      return;
    }

    const resend = new Resend(resendApiKey);

    const subject = data.status === 'completed' 
      ? `✅ Prospecting Run #${data.executionLogId} Completed Successfully`
      : `❌ Prospecting Run #${data.executionLogId} Failed`;

    const htmlBody = generateHtmlEmail(data);
    const textBody = generateTextEmail(data);

    // Send email to all active recipients
    const result = await resend.emails.send({
      from: fromEmail,
      to: recipients.map(r => r.email),
      subject,
      html: htmlBody,
      text: textBody,
    });

    if (result.error) {
      console.error('[Email] Resend error:', result.error);
    } else {
      console.log('[Email] Notification sent successfully to:', recipients.map(r => r.email).join(', '));
      console.log('[Email] Message ID:', result.data?.id);
    }
    
  } catch (error: any) {
    console.error('[Email] Failed to send notification:', error.message);
    // Don't throw - we don't want email failures to break the prospecting run
  }
}

function logEmailToConsole(data: EmailNotificationData, recipients: string[]): void {
  const subject = data.status === 'completed' 
    ? `✅ Prospecting Run #${data.executionLogId} Completed Successfully`
    : `❌ Prospecting Run #${data.executionLogId} Failed`;

  console.log('\n' + '='.repeat(80));
  console.log('[Email] Would send to:', recipients.join(', '));
  console.log('[Email] Subject:', subject);
  console.log('[Email] Body:');
  console.log(generateTextEmail(data));
  console.log('='.repeat(80) + '\n');
}

function generateTextEmail(data: EmailNotificationData): string {
  const duration = Math.round((data.completedAt.getTime() - data.startedAt.getTime()) / 1000);
  
  if (data.status === 'completed') {
    return `
Prospecting Engine - Daily Report
=================================

Execution #${data.executionLogId} completed successfully!

Summary:
--------
• Started: ${data.startedAt.toLocaleString()}
• Completed: ${data.completedAt.toLocaleString()}
• Duration: ${duration} seconds

Results:
--------
• Domains Found: ${data.domainsFound}
• Emails Found: ${data.emailsFound}
• Leads Posted to ActiveCampaign: ${data.leadsPosted}
${data.duplicatesSkipped ? `• Duplicates Skipped: ${data.duplicatesSkipped}` : ''}

Status: ✅ SUCCESS

---
This is an automated message from your Prospecting Engine.
Visit your dashboard to view detailed logs.
    `.trim();
  } else {
    return `
Prospecting Engine - Error Report
==================================

Execution #${data.executionLogId} failed!

Summary:
--------
• Started: ${data.startedAt.toLocaleString()}
• Failed: ${data.completedAt.toLocaleString()}
• Duration: ${duration} seconds

Error:
------
${data.error || 'Unknown error'}

Partial Results:
----------------
• Domains Found: ${data.domainsFound}
• Emails Found: ${data.emailsFound}
• Leads Posted: ${data.leadsPosted}

Status: ❌ FAILED

Please check the execution logs for more details.

---
This is an automated message from your Prospecting Engine.
    `.trim();
  }
}

function generateHtmlEmail(data: EmailNotificationData): string {
  const duration = Math.round((data.completedAt.getTime() - data.startedAt.getTime()) / 1000);
  const statusColor = data.status === 'completed' ? '#10b981' : '#ef4444';
  const statusIcon = data.status === 'completed' ? '✅' : '❌';
  const statusText = data.status === 'completed' ? 'SUCCESS' : 'FAILED';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prospecting Engine Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${statusColor}; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ${statusIcon} Prospecting Engine
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">
                Execution #${data.executionLogId} - ${statusText}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">Summary</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">Started:</td>
                  <td style="color: #111827; font-size: 14px; text-align: right; font-weight: 500;">${data.startedAt.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">Completed:</td>
                  <td style="color: #111827; font-size: 14px; text-align: right; font-weight: 500;">${data.completedAt.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">Duration:</td>
                  <td style="color: #111827; font-size: 14px; text-align: right; font-weight: 500;">${duration} seconds</td>
                </tr>
              </table>
              
              ${data.status === 'completed' ? `
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">Results</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 6px; margin-bottom: 10px;">
                    <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Domains Found</div>
                    <div style="color: #111827; font-size: 32px; font-weight: 600;">${data.domainsFound}</div>
                  </td>
                  <td width="20"></td>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 6px;">
                    <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Emails Found</div>
                    <div style="color: #111827; font-size: 32px; font-weight: 600;">${data.emailsFound}</div>
                  </td>
                </tr>
                <tr><td colspan="3" height="20"></td></tr>
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 6px;">
                    <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Leads Posted</div>
                    <div style="color: #10b981; font-size: 32px; font-weight: 600;">${data.leadsPosted}</div>
                  </td>
                  ${data.duplicatesSkipped ? `
                  <td width="20"></td>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 6px;">
                    <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Duplicates Skipped</div>
                    <div style="color: #f59e0b; font-size: 32px; font-weight: 600;">${data.duplicatesSkipped}</div>
                  </td>
                  ` : '<td></td>'}
                </tr>
              </table>
              ` : `
              <h2 style="margin: 0 0 20px 0; color: #ef4444; font-size: 20px;">Error Details</h2>
              <div style="padding: 20px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; font-family: monospace;">${data.error || 'Unknown error'}</p>
              </div>
              
              <h3 style="margin: 20px 0 10px 0; color: #111827; font-size: 16px;">Partial Results</h3>
              <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">Domains Found:</td>
                  <td style="color: #111827; font-size: 14px; text-align: right; font-weight: 500;">${data.domainsFound}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">Emails Found:</td>
                  <td style="color: #111827; font-size: 14px; text-align: right; font-weight: 500;">${data.emailsFound}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">Leads Posted:</td>
                  <td style="color: #111827; font-size: 14px; text-align: right; font-weight: 500;">${data.leadsPosted}</td>
                </tr>
              </table>
              `}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This is an automated message from your Prospecting Engine.<br>
                Visit your dashboard to view detailed logs.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
