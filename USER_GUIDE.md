# Prospecting Engine - Complete User Guide

**Version 1.0** | **Author: Manus AI** | **Last Updated: November 16, 2025**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Dashboard Overview](#dashboard-overview)
3. [ICP Management](#icp-management)
4. [Running Prospecting Campaigns](#running-prospecting-campaigns)
5. [ICP Analytics & Learning](#icp-analytics--learning)
6. [A/B Testing](#ab-testing)
7. [Execution Logs](#execution-logs)
8. [Settings](#settings)
9. [Email Notifications](#email-notifications)
10. [GDPR Compliance](#gdpr-compliance)
11. [Troubleshooting](#troubleshooting)

---

## Introduction

The Prospecting Engine is an automated lead generation system designed specifically for goaimysite.com. The application runs daily at 7:00 AM GMT to find and qualify leads based on your Ideal Customer Profile (ICP), then automatically posts validated email addresses to your ActiveCampaign Prospects list.

### Key Features

The system provides **automated prospecting** that searches Google based on weighted ICP attributes, finds personal email addresses using Hunter.io, and posts qualified leads to ActiveCampaign list ID 4. It includes **AI-powered learning** that analyzes ActiveCampaign engagement metrics to automatically optimize ICP weights over time. The **A/B testing capability** allows you to run parallel campaigns with different ICP configurations to identify the best-performing strategy. **GDPR compliance** is built-in with automated data retention policies and right-to-be-forgotten endpoints. The system provides **comprehensive monitoring** through execution logs, rate limit tracking, and email notifications for every run.

---

## Dashboard Overview

The Dashboard is your command center for monitoring prospecting performance. When you first log in, you will see four key metrics at the top of the page.

**Total Runs** displays the number of prospecting campaigns executed, along with the count of successful completions. **Total Leads** shows unique email addresses tracked in the database, preventing duplicates from being posted to ActiveCampaign. **Last Run** indicates when the most recent prospecting campaign started and its current status (running, completed, or failed). **Latest Result** displays the number of leads posted to ActiveCampaign in the most recent successful run.

Below these metrics, the **Recent Executions** section lists your latest prospecting runs with timestamps, trigger source (manual or scheduled), and detailed results including domains found, emails discovered, and leads posted.

### Running a Manual Campaign

To run a prospecting campaign immediately, click the **Run Now** button in the top-right corner of the Dashboard. The system will execute the complete workflow: build a search query from your ICP data, search Google for matching domains, find email addresses via Hunter.io, check for duplicates in the database, post new leads to ActiveCampaign, and send you an email notification with results.

The default target is 100 leads per run. You can monitor progress in the Recent Executions section, which updates in real-time as the campaign runs.

---

## ICP Management

The ICP (Ideal Customer Profile) Management page allows you to configure and adjust the weighted attributes that define your target audience. The system uses these weights to build Google search queries that find the most relevant prospects.

### Understanding ICP Attributes

Your ICP data is organized into five attribute categories. **Industry** defines business sectors you target (e.g., SaaS, E-commerce, Marketing Agencies). **Company Size** specifies employee count ranges (e.g., 11-50, 51-200). **Region** indicates geographic targeting (e.g., UK, North America). **Tech Stack** lists technologies your ideal customers use (e.g., HubSpot, Webflow). **Role** identifies decision-maker titles (e.g., Founder, Marketing Director).

Each attribute value has a **weight** between 0 and 1, where 1.0 means highest priority and 0.0 means excluded from searches. For example, if "SaaS" has weight 1.0 and "Nonprofits" has weight 0.5, the system will prioritize SaaS companies but still include nonprofits in searches.

### Editing ICP Weights

To modify a weight, click the weight button next to any attribute value. Enter the new weight (0 to 1) in the input field that appears, then click the checkmark to save or the X to cancel. Changes take effect immediately for the next prospecting run.

### Preview Search Query

Before running a campaign, you can preview the exact Google search query that will be generated from your current ICP weights. Click the **Preview Search Query** button at the top of the page. A dialog will display the complete search query with all weighted attributes combined using Boolean operators (AND/OR). This helps you validate that your ICP configuration will produce relevant results.

For example, a typical query might look like: `("SaaS" OR "E-commerce" OR "Marketing Agencies") AND ("11-50" OR "51-200") AND ("UK") AND ("HubSpot" OR "Webflow") AND ("Founder" OR "Marketing Director")`.

### Managing ICP Data

You can delete individual ICP items by clicking the trash icon next to any attribute value. The system currently manages ICP data directly in the database—there is no Google Sheets sync required. All changes are stored immediately and persist across sessions.

---

## Running Prospecting Campaigns

Prospecting campaigns can be triggered in two ways: manually via the Dashboard's **Run Now** button, or automatically via the daily scheduler at 7:00 AM GMT.

### Campaign Workflow

When a campaign starts, the system executes six sequential steps. First, it **builds the search query** by combining all ICP attributes with weights greater than 0, using Boolean operators to create a targeted Google search. Second, it **searches Google** using the Custom Search API to find domains matching your ICP criteria, targeting the configured lead count (default 100). Third, it **finds emails** by querying Hunter.io for up to 2 personal email addresses per domain. Fourth, it **checks for duplicates** by comparing found emails against the leads database to prevent posting the same contact twice. Fifth, it **posts to ActiveCampaign** by adding new leads to the Prospects list (ID 4) with full contact details. Sixth, it **sends notification** via email to all configured recipients with campaign results and statistics.

### Monitoring Progress

During execution, you can monitor real-time progress on the Dashboard. The **Last Run** card shows the current status (running, completed, or failed). The **Recent Executions** section displays live updates including domains found, emails discovered, and leads posted. If the campaign fails, an error message will appear in the execution log with details about what went wrong.

### Rate Limits

The system automatically tracks API usage to prevent exceeding quotas. **Google Custom Search** is limited to 100 queries per day on the free tier. **Hunter.io** limits depend on your plan (check your Hunter dashboard for current usage). The Dashboard displays remaining quotas for both services. If you approach a limit, the system will show a warning and may reduce the target lead count to stay within bounds.

---

## ICP Analytics & Learning

The ICP Analytics page provides AI-powered insights into which ICP attributes drive the best engagement. The system analyzes ActiveCampaign data to identify high-performing leads and recommends weight adjustments to improve future campaigns.

### Viewing Analytics

The analytics dashboard displays three key visualizations. **Top Performing Attributes** shows a bar chart of ICP attributes ranked by engagement score, calculated from ActiveCampaign open rates, click rates, and conversions. **Engagement Trends** presents a line graph showing how lead quality has changed over time, helping you identify whether your ICP optimization is working. **Recommended Adjustments** lists specific weight changes the AI suggests based on performance data, such as "Increase 'SaaS' weight from 0.9 to 1.0" or "Decrease 'Nonprofits' weight from 0.5 to 0.3".

### Applying Recommendations

To implement the AI's suggestions, click the **Apply Recommendations** button at the bottom of the page. The system will automatically update all ICP weights to the recommended values. You can review the changes on the ICP Management page before running your next campaign.

### How Learning Works

The learning algorithm queries ActiveCampaign weekly to retrieve engagement metrics for all leads posted by the Prospecting Engine. It correlates high-performing leads back to the ICP attributes that were used to find them (stored in the `icpSnapshot` field of each lead). The system calculates an engagement score for each attribute based on open rates (40% weight), click rates (40% weight), and conversions (20% weight). Attributes with scores above the median are recommended for weight increases, while those below are recommended for decreases.

This creates a **feedback loop** where the system continuously improves targeting based on real-world results, not just search volume.

---

## A/B Testing

The A/B Testing page allows you to run parallel prospecting campaigns with different ICP configurations to scientifically determine which strategy performs best.

### Creating an A/B Test

To create a new test, click the **Create New A/B Test** button. Enter a descriptive name for your test (e.g., "SaaS vs E-commerce Focus"). Configure **Variant A** by adjusting ICP weights for your first strategy (e.g., SaaS weight 1.0, E-commerce weight 0.5). Configure **Variant B** by adjusting weights for your alternative strategy (e.g., SaaS weight 0.5, E-commerce weight 1.0). Set the **duration** for how many days the test should run (recommended: 7-14 days for statistical significance). Click **Start Test** to begin.

### How A/B Tests Work

Once started, the system will run both variants in parallel during each daily prospecting cycle. Each variant gets half of the target lead count (e.g., if targeting 100 leads/day, each variant gets 50). Leads are posted to ActiveCampaign with tags identifying which variant they came from (e.g., `ab_test_123_variant_a`). The system tracks engagement metrics separately for each variant, including open rates, click rates, and conversions.

### Viewing Results

The A/B Test Results section displays a comparison table with key metrics for each variant. **Leads Posted** shows the total number of leads generated by each variant. **Open Rate** indicates the percentage of leads who opened at least one email. **Click Rate** shows the percentage who clicked a link. **Conversion Rate** displays the percentage who completed a desired action (if conversion tracking is configured). **Engagement Score** is a weighted composite of all metrics, used to determine the winner.

### Promoting a Winner

When the test duration completes, the system automatically calculates which variant performed better based on engagement scores. You can click **Promote Winner** to apply the winning variant's ICP weights to your main configuration. This makes the winning strategy your new default for future campaigns.

---

## Execution Logs

The Execution Logs page provides a detailed history of all prospecting runs, including successes, failures, and performance metrics.

### Log Entries

Each log entry displays the execution ID, start timestamp, and current status (running, completed, or failed). The **results summary** shows domains found, emails discovered, leads posted to ActiveCampaign, and duplicates skipped. The **trigger source** indicates whether the run was manual (via Run Now button) or scheduled (daily 7am GMT). If the run failed, an **error message** explains what went wrong (e.g., "Hunter.io API rate limit exceeded" or "ActiveCampaign authentication failed").

### Filtering and Search

You can filter logs by status (all, completed, failed, running) using the dropdown menu at the top of the page. The search box allows you to find specific executions by ID or date. Logs are displayed in reverse chronological order (newest first) with pagination for large datasets.

### Exporting Logs

To download execution logs for analysis or record-keeping, click the **Export to CSV** button. The exported file includes all log fields: execution ID, start time, end time, status, domains found, emails found, leads posted, duplicates skipped, error messages, and trigger source.

---

## Settings

The Settings page allows you to configure system-wide options, manage notification recipients, and view API credentials.

### Notification Recipients

The **Email Notifications** section lists all email addresses that receive daily prospecting reports. By default, steve@goaimysite.com is configured as the primary recipient. To add a new recipient, enter their email address in the input field and click **Add Recipient**. To remove a recipient, click the trash icon next to their email address. To temporarily disable notifications for a recipient without deleting them, toggle the **Active** switch.

### API Configuration

The **API Credentials** section displays (but does not expose) the status of your configured API keys. **Google Custom Search** shows whether the API key and Search Engine ID are configured. **Hunter.io** indicates whether the API key is set and displays your current monthly usage. **ActiveCampaign** confirms the API URL and token are configured, and shows the target list ID (4 - Prospects). **Resend** displays whether the email service API key is configured for sending notifications.

You cannot edit API keys directly in the Settings page for security reasons. API credentials are configured via environment variables during deployment (see Deployment Guide).

### System Settings

The **Prospecting Configuration** section allows you to adjust campaign parameters. **Daily Target Leads** sets the number of leads to find per daily run (default: 100). **Max Emails Per Domain** limits how many email addresses Hunter.io will search for per domain (default: 2, recommended to avoid spam). **Scheduler Time** displays the daily run time (7:00 AM GMT) and allows you to change it if needed.

---

## Email Notifications

The system sends automated email notifications for every prospecting run, providing detailed results and insights.

### Notification Content

Each notification email includes a **summary section** with execution ID, start time, completion time, and total duration. The **results section** lists domains found, emails discovered, leads posted to ActiveCampaign, and duplicates skipped. The **status indicator** shows whether the run succeeded (✅ SUCCESS) or failed (❌ FAILED) with error details. For successful runs, a **quick stats** section highlights performance metrics like success rate and average emails per domain.

### Configuring Resend

Email notifications are sent via Resend, a modern email API service. To enable actual email delivery (currently notifications are logged to console), you need to configure the `RESEND_API_KEY` environment variable during deployment.

To get a Resend API key, visit https://resend.com and sign up for a free account (3,000 emails/month included). Navigate to API Keys in your Resend dashboard and create a new key. Add the key to your Railway environment variables as `RESEND_API_KEY`. Verify your sending domain in Resend (or use their test domain for development).

Once configured, notifications will be sent from `noreply@goaimysite.com` (or your verified domain) to all active recipients in the Settings page.

### Weekly Summary Emails

In addition to daily run notifications, the system sends a **weekly summary email** every Monday at 9:00 AM GMT. This digest includes total leads posted in the past week, average success rate across all runs, top-performing ICP attributes based on engagement, API usage statistics for Google and Hunter.io, and AI-generated recommendations for ICP optimization.

Weekly summaries provide a high-level view of prospecting performance without overwhelming you with daily details.

---

## GDPR Compliance

The Prospecting Engine is designed to comply with GDPR and similar data protection regulations. The system implements several safeguards to protect personal data.

### Data Retention

Personal data (email addresses, domains, names) is automatically deleted after **365 days** from the date it was collected. The system runs a daily cleanup job at 2:00 AM GMT to remove expired data. You can view current retention statistics on the Settings page under the **GDPR Compliance** section, which shows total leads stored, oldest lead date, and leads scheduled for deletion.

### Right to Be Forgotten

If a lead requests deletion of their personal data, you can fulfill this request via the **GDPR Data Management** section in Settings. Enter the lead's email address and click **Delete Personal Data**. The system will immediately remove all records associated with that email from the database and create an audit log entry for compliance documentation.

### Data Export

To provide a data subject access request (DSAR), use the **Export Personal Data** function in Settings. Enter the lead's email address and click **Export**. The system will generate a JSON file containing all stored data for that email, including when it was collected, which ICP attributes were used to find it, and any engagement metrics tracked.

### Audit Logging

All GDPR-related operations (data deletion, data export, retention policy changes) are logged in the `auditLogs` table with timestamps, user IDs, and operation details. These logs are retained for **7 years** to comply with regulatory requirements and cannot be deleted.

### Encryption and Security

All data is encrypted at rest using Railway's MySQL database encryption. Data in transit is protected by HTTPS/TLS encryption (enforced by Railway). API keys and credentials are stored as environment variables, never in code or the database. The application uses JWT-based authentication with secure session cookies.

---

## Troubleshooting

This section addresses common issues and their solutions.

### "No ICP data found" Error

**Problem:** When clicking Run Now, you see an error message "No ICP data found. Please sync from Google Sheets first."

**Solution:** The ICP data has not been imported into the database. This should have been completed during initial setup. If you see this error, contact your system administrator to run the ICP import script (`import-icp-data.ts`).

### Prospecting Run Finds Zero Domains

**Problem:** The execution log shows "Domains Found: 0" and no emails are discovered.

**Solution:** Your ICP weights may be too restrictive, creating a search query that matches no results. Click **Preview Search Query** on the ICP Management page to see the generated query. Try reducing the number of required attributes or increasing weights for broader categories. Alternatively, Google Custom Search may have reached its daily quota (100 queries). Check the rate limit status on the Dashboard.

### Hunter.io Returns No Emails

**Problem:** Domains are found, but "Emails Found: 0" in the execution log.

**Solution:** This can occur for several reasons. The domains may not have publicly listed email addresses that Hunter.io can find. Your Hunter.io API quota may be exhausted (check your Hunter dashboard). The domains may be using email privacy services that block scraping. Try targeting larger companies (51-200 employees) which typically have more discoverable emails.

### ActiveCampaign Posting Fails

**Problem:** Emails are found, but "Leads Posted: 0" and the execution log shows an error related to ActiveCampaign.

**Solution:** Verify your ActiveCampaign API credentials in Settings. The API URL should be `https://stevehoman2.api-us1.com` and the API token should be valid. Check that list ID 4 (Prospects) exists in your ActiveCampaign account. Ensure the API token has permission to add contacts to lists.

### Rate Limit Warnings

**Problem:** The Dashboard shows "Google Custom Search: 95/100 remaining" or similar warnings.

**Solution:** The system is approaching API quota limits. If you hit the limit, prospecting runs will fail until the quota resets (daily for Google, monthly for Hunter.io). To avoid this, reduce the **Daily Target Leads** setting to use fewer API calls, or upgrade your API plans to higher tiers with larger quotas.

### Email Notifications Not Received

**Problem:** Prospecting runs complete successfully, but you don't receive email notifications.

**Solution:** Check that your email address is listed in Settings > Notification Recipients and the **Active** toggle is enabled. Verify that the `RESEND_API_KEY` environment variable is configured in Railway. If using the free Resend tier, check that you haven't exceeded 3,000 emails/month. Look for email notifications in your spam folder.

### Duplicate Leads Still Being Posted

**Problem:** The same email addresses are being posted to ActiveCampaign multiple times.

**Solution:** The deduplication system should prevent this automatically. If duplicates are appearing, check the Execution Logs for "Duplicates Skipped" counts. If this shows 0 even when you know duplicates exist, there may be a database issue. Contact your system administrator to verify the `leads` table is populated correctly.

---

## Getting Help

If you encounter issues not covered in this guide, you can access additional support resources. Review the **Execution Logs** for detailed error messages that may indicate the root cause. Check the **TESTING_GUIDE.md** file in the project repository for step-by-step testing procedures. Consult the **GDPR_COMPLIANCE.md** file for detailed information about data protection features. For deployment issues, refer to the **RAILWAY_DEPLOYMENT_GUIDE.md** file.

For technical support or feature requests, contact your development team or submit an issue through your project management system.

---

**End of User Guide**
