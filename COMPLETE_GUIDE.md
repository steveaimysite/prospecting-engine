# Prospecting Engine - Complete Testing & Deployment Guide

**Version:** 5d50bd42  
**Last Updated:** November 16, 2025  
**Author:** Manus AI

---

## Table of Contents

1. [Testing the Application](#testing-the-application)
2. [Railway Deployment Guide](#railway-deployment-guide)
3. [Post-Deployment Configuration](#post-deployment-configuration)
4. [Future Development](#future-development)

---

## Testing the Application

### Frontend Testing

The application includes a comprehensive web dashboard accessible at the development URL. Follow these steps to test all features:

#### **1. Authentication & Access**

Navigate to the development URL and log in using Manus OAuth. Upon successful authentication, you will be redirected to the main dashboard showing prospecting statistics and recent executions.

#### **2. ICP Management Testing**

Access the ICP Management page from the navigation menu to test the following functionality:

**Sync from Google Sheets:**
- Click the "Sync from Google Sheets" button
- The system will fetch ICP data from `https://docs.google.com/spreadsheets/d/1EHMijNDykLjmRLmU5MCxik6Hhr9Kpf2m8cRR-U-99P8/edit`
- Verify that attributes, values, and weights are correctly imported
- Check that the data appears in the table with editable weight fields

**Search Query Preview:**
- After syncing ICP data, click "Preview Search Query"
- A dialog will display the exact Google search query that will be generated from your current ICP weights
- This helps validate that your ICP configuration produces meaningful search terms
- Example output: `"SaaS" AND "B2B" AND "enterprise" AND "cloud platform"`

**Weight Adjustment:**
- Modify weight values for any ICP attribute using the input fields
- Click "Update" to save changes
- Verify that changes persist after page refresh

#### **3. Dashboard Testing**

The main dashboard provides real-time statistics and execution monitoring:

**Statistics Cards:**
- **Total Runs:** Shows count of all prospecting executions (successful + failed)
- **Total Leads:** Displays unique leads tracked in the database
- **Last Run:** Timestamp of most recent execution
- **Latest Result:** Number of leads posted in the last run
- **Duplicates Skipped:** Count of emails already in database that were not reposted
- **API Rate Limits:** Real-time status of Google Custom Search and Hunter.io quotas

**Manual Execution:**
- Click the "Run Now" button in the top-right corner
- Monitor the execution progress in real-time
- Verify that the Recent Executions table updates with the new run
- Check that statistics cards reflect the new data

#### **4. ICP Analytics Testing**

Navigate to the ICP Analytics page (accessible via `/analytics` route) to test AI-powered insights:

**Run Analysis:**
- Click "Run Analysis" to fetch engagement data from ActiveCampaign
- The system queries all contacts in list ID 4 (Prospects)
- Wait for analysis to complete (typically 10-30 seconds depending on lead count)

**Review Insights:**
- **Top Performers:** Green cards showing ICP attributes with highest engagement scores
- **Underperformers:** Orange cards highlighting attributes with low engagement
- **All Attribute Performance:** Detailed table with current weights, suggested weights, and recommendations (increase/decrease/maintain)
- **AI Recommendations:** Natural language suggestions for optimizing your ICP

**Apply Recommendations:**
- Click "Apply Recommendations" to automatically update ICP weights based on AI analysis
- Confirm that weights are updated in the ICP Management page
- Re-run analysis to verify improvements

#### **5. A/B Testing**

Access the A/B Testing page (via `/ab-testing` route) to test variant comparison:

**Create New Test:**
- Click "Create New Test"
- Enter test name (e.g., "SaaS vs Enterprise Focus")
- Provide optional description
- Name two variants (default: "Control" and "Variant B")
- Click "Create Test"

**Configure Variants:**
- After creating a test, navigate to ICP Management
- Modify ICP weights for Variant A
- Switch to Variant B and adjust weights differently
- Each variant maintains its own ICP configuration snapshot

**Start Test:**
- Return to A/B Testing page
- Click "Start" on the draft test
- Status changes to "RUNNING"
- Both variants will be used in alternating prospecting runs

**Monitor Results:**
- Each variant card shows:
  - Execution count
  - Total leads generated
  - Average engagement score
  - Leads per run metric
- Winner is automatically determined when test is stopped

**Stop Test:**
- Click "Stop" on a running test
- System calculates winner based on highest average engagement
- Winner is highlighted with a trophy icon
- Test status changes to "COMPLETED"

#### **6. Execution Logs**

Navigate to the Execution Logs page to verify historical data:

**Log Entries:**
- Each row shows: Start time, status, domains found, emails found, leads posted, duplicates skipped
- Click on any row to expand and view detailed information including search query used and error messages (if any)
- Verify that "Triggered By" field correctly shows "scheduled" or "manual"

**Filtering & Search:**
- Use the status filter to show only successful or failed runs
- Search by date range to find specific executions

#### **7. Settings Testing**

Access the Settings page to configure notification recipients and view system information:

**Notification Recipients:**
- Default recipient `steve@goaimysite.com` should be pre-configured
- Click "Add Recipient" to add additional email addresses
- Toggle recipients on/off using the switch
- Delete recipients using the trash icon
- Verify that only active recipients receive daily and weekly emails

**System Information:**
- Verify that all API keys are configured (masked for security)
- Check Google Sheets URL is correct
- Confirm ActiveCampaign list ID is 4

---

### Backend Integration Testing

To verify that the application successfully integrates with external services, perform these tests:

#### **1. Google Sheets Integration**

**Test Sync:**
1. Modify the Google Sheets document at `https://docs.google.com/spreadsheets/d/1EHMijNDykLjmRLmU5MCxik6Hhr9Kpf2m8cRR-U-99P8/edit`
2. Add a new row with Attribute, Value, and Weight columns
3. In the app, click "Sync from Google Sheets" in ICP Management
4. Verify the new row appears in the dashboard

**Expected Behavior:**
- Sync completes within 5-10 seconds
- All rows from the sheet are imported
- Weights are correctly parsed as decimal numbers (0.00 to 1.00)
- Previous ICP data is replaced with new data from the sheet

#### **2. Google Custom Search API**

**Test Search:**
1. Ensure ICP data is synced
2. Click "Run Now" on the dashboard
3. Monitor execution logs for "domainsFound" count

**Expected Behavior:**
- Search query is built from weighted ICP attributes
- API returns up to 10 results per query
- Domains are extracted from search result URLs
- Rate limit tracking updates after each search

**Verify Rate Limits:**
- Check Dashboard for "Google Search Quota" widget
- Should show remaining queries out of daily limit
- Warning appears when approaching 80% of limit

#### **3. Hunter.io Email Finding**

**Test Email Discovery:**
1. Run a prospecting execution
2. Check execution logs for "emailsFound" count
3. Verify that emails are in valid format

**Expected Behavior:**
- For each domain found, Hunter.io is queried for up to 2 email addresses
- Only personal emails are returned (generic emails like info@, support@ are filtered)
- Rate limit tracking updates after each Hunter.io call
- Emails are deduplicated against existing leads in database

**Verify Deduplication:**
- Run the same prospecting execution twice
- Second run should show "Duplicates Skipped" count matching the first run's "Leads Posted"
- No duplicate emails are posted to ActiveCampaign

#### **4. ActiveCampaign Integration**

**Test Lead Posting:**
1. Run a prospecting execution
2. Log in to ActiveCampaign at `https://stevehoman2.api-us1.com`
3. Navigate to Contacts → Lists → Prospects (List ID 4)
4. Verify that new contacts appear with correct email addresses

**Expected Behavior:**
- Each email found by Hunter.io is posted as a new contact
- Contacts are added to list ID 4 (Prospects)
- Contact fields include email and domain
- No duplicates are created (ActiveCampaign's email uniqueness is enforced)

**Test Engagement Analysis:**
1. In ActiveCampaign, open some contacts and add engagement data (opens, clicks, or manually set contact score)
2. In the app, navigate to ICP Analytics and click "Run Analysis"
3. Verify that engagement scores are correctly pulled from ActiveCampaign

**Expected Behavior:**
- Analysis fetches all contacts from list ID 4
- Contact scores (0-100) are used as engagement metrics
- Leads are correlated back to their ICP attributes via the `icpSnapshot` field
- Top performers and underperformers are correctly identified

#### **5. Email Notifications (Resend)**

**Test Daily Summary:**
1. Trigger a manual prospecting run
2. Use the "Manual Triggers" section in Settings to send a test daily summary email
3. Check `steve@goaimysite.com` inbox for the email

**Expected Behavior:**
- Email arrives within 1-2 minutes
- Subject line: "Daily Prospecting Summary - [Date]"
- Body includes:
  - Total leads posted
  - Domains found
  - Emails found
  - Duplicates skipped
  - Success/failure status
  - Link to execution logs

**Test Weekly Summary:**
1. Use the "Manual Triggers" section to send a test weekly summary
2. Check inbox for the email

**Expected Behavior:**
- Email arrives within 1-2 minutes
- Subject line: "Weekly Prospecting Summary - [Date Range]"
- Body includes:
  - Total leads for the week
  - Success rate percentage
  - Top-performing ICP attributes
  - Underperforming attributes
  - AI-powered recommendations
  - Engagement trends

**Note:** Resend requires API key configuration. If emails are not being sent, check the `RESEND_API_KEY` environment variable in Railway settings.

---

### GDPR Compliance Testing

The application includes comprehensive GDPR compliance features. Test these to ensure data protection:

#### **1. Data Retention**

**Automatic Cleanup:**
- The system runs a daily cleanup job at 2:00 AM GMT
- Default retention policies:
  - Leads: 365 days
  - Execution logs: 90 days
  - Audit logs: 730 days (2 years)

**Test Retention:**
1. Navigate to Settings → GDPR Compliance
2. View current retention policies
3. Manually trigger cleanup using the "Run Cleanup Now" button
4. Verify that old records are deleted according to policy

#### **2. Right to be Forgotten**

**Delete Personal Data:**
1. Navigate to Settings → GDPR Compliance
2. Enter an email address in the "Delete Personal Data" field
3. Click "Delete"
4. Verify that:
   - Lead record is removed from database
   - Audit log entry is created
   - Confirmation message appears

**Expected Behavior:**
- Email is permanently deleted from the `leads` table
- Audit log records the deletion with timestamp and user ID
- No trace of the email remains in the system

#### **3. Data Export (Subject Access Request)**

**Export Personal Data:**
1. Navigate to Settings → GDPR Compliance
2. Enter an email address in the "Export Personal Data" field
3. Click "Export"
4. Download the JSON file

**Expected Behavior:**
- JSON file contains all data associated with the email:
  - Email address
  - Domain
  - Posted date
  - Execution log ID
  - Search query used to find the lead
  - ICP snapshot at time of discovery
- Audit log records the export operation

#### **4. Audit Logging**

**View Audit Logs:**
1. Navigate to Settings → GDPR Compliance → Audit Logs
2. Review all data operations

**Expected Entries:**
- `create`: When a new lead is added
- `read`: When personal data is accessed (exports)
- `delete`: When data is removed (right to be forgotten)
- `cleanup`: Automated retention policy deletions

Each entry includes:
- Action type
- Entity type (e.g., "lead")
- Entity ID
- User ID (who performed the action)
- IP address
- Timestamp
- Additional details (JSON)

---

## Railway Deployment Guide

Railway.app provides a simple, scalable platform for deploying your prospecting engine. Follow these steps for production deployment:

### Prerequisites

Before deploying, ensure you have:

1. **Railway Account:** Sign up at [railway.app](https://railway.app) (free tier available)
2. **GitHub Account:** The project will be deployed from a Git repository
3. **API Keys:** All required API keys (Google, Hunter.io, ActiveCampaign, Resend)
4. **Domain (Optional):** Custom domain for production use

### Step 1: Prepare the Repository

The project is already configured for Railway deployment with the following files:

- `Dockerfile`: Containerizes the application
- `railway.json`: Railway-specific configuration
- `.dockerignore`: Excludes unnecessary files from the Docker image

**Push to GitHub:**

```bash
cd /path/to/prospecting-engine
git init
git add .
git commit -m "Initial commit - Prospecting Engine"
git remote add origin https://github.com/YOUR_USERNAME/prospecting-engine.git
git push -u origin main
```

### Step 2: Create Railway Project

1. Log in to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account
5. Select the `prospecting-engine` repository
6. Railway will automatically detect the Dockerfile and begin deployment

### Step 3: Add MySQL Database

Railway provides managed MySQL databases:

1. In your Railway project, click "New" → "Database" → "Add MySQL"
2. Railway will provision a MySQL instance and generate connection credentials
3. The `DATABASE_URL` environment variable is automatically set

**Verify Database Connection:**
- Click on the MySQL service in Railway dashboard
- Navigate to "Variables" tab
- Confirm `DATABASE_URL` is present (format: `mysql://user:password@host:port/database`)

### Step 4: Configure Environment Variables

Navigate to your application service in Railway, then click "Variables" tab. Add the following environment variables:

#### **Required API Keys**

```
GOOGLE_API_KEY=AIzaSyAf9Qqx8AP-wosStzpWfkvurSWw3eaQxcg
SEARCH_ENGINE_ID=b05119c9175944f77
HUNTER_API_KEY=0709057b74ecfdf2eadd6ad42f2c9ee625830a94
AC_API_URL=https://stevehoman2.api-us1.com
AC_API_TOKEN=10ca4b4414320efdf4b92751ef46306f7322ceab56650a4a1da595deaaf665ede727df77
AC_LIST_ID=4
```

#### **Resend Email Service**

To enable email notifications, sign up for Resend:

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (3,000 emails/month, no credit card required)
3. Verify your domain OR use Resend's testing domain (`onboarding@resend.dev`)
4. Navigate to API Keys and create a new key
5. Add to Railway:

```
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=steve@goaimysite.com
```

**Note:** For production use with a custom domain, you must verify domain ownership in Resend by adding DNS records.

#### **OAuth & System Variables**

These are automatically set by the Manus platform but should be configured in Railway:

```
JWT_SECRET=your_random_secret_key_here
VITE_APP_TITLE=Prospecting Engine
VITE_APP_LOGO=/logo.png
OWNER_OPEN_ID=your_manus_open_id
OWNER_NAME=Steve Homan
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Deploy and Verify

1. After adding all environment variables, Railway will automatically redeploy
2. Wait for deployment to complete (typically 2-3 minutes)
3. Click "View Logs" to monitor the deployment process

**Expected Log Output:**
```
[Server] Starting prospecting engine...
[Database] Connected successfully
[Scheduler] Initializing daily prospecting scheduler (7:00 AM GMT)
[Scheduler] Initializing GDPR data cleanup scheduler (2:00 AM GMT)
[Scheduler] Initializing weekly summary scheduler (Monday 9:00 AM GMT)
[Scheduler] All schedulers initialized successfully
Server running on http://localhost:3000/
```

4. Click "Generate Domain" to get a public URL (e.g., `prospecting-engine-production.up.railway.app`)
5. Open the URL in your browser and verify the application loads

### Step 6: Run Database Migrations

Railway does not automatically run database migrations. You must execute them manually:

1. In Railway dashboard, click on your application service
2. Navigate to "Settings" tab
3. Scroll to "Deploy" section
4. Add a "Build Command":

```
pnpm install && pnpm db:push
```

5. Redeploy the application

**Alternative: Manual Migration via Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migration
railway run pnpm db:push
```

### Step 7: Configure Custom Domain (Optional)

To use a custom domain instead of the Railway-generated URL:

1. In Railway dashboard, navigate to your application service
2. Click "Settings" → "Domains"
3. Click "Add Custom Domain"
4. Enter your domain (e.g., `prospecting.goaimysite.com`)
5. Railway will provide DNS records to add to your domain registrar:
   - **CNAME Record:** Point your subdomain to the Railway URL

**Example DNS Configuration:**
```
Type: CNAME
Name: prospecting
Value: prospecting-engine-production.up.railway.app
TTL: 3600
```

6. Wait for DNS propagation (5-60 minutes)
7. Railway will automatically provision an SSL certificate via Let's Encrypt

### Step 8: Verify Production Deployment

After deployment, perform these verification steps:

**1. Health Check:**
- Visit your Railway URL
- Confirm the application loads without errors
- Log in using Manus OAuth

**2. Database Connection:**
- Navigate to ICP Management
- Click "Sync from Google Sheets"
- Verify data is imported successfully

**3. Scheduler Verification:**
- Check Railway logs for scheduler initialization messages
- Confirm all three schedulers are active:
  - Daily prospecting (7:00 AM GMT)
  - GDPR cleanup (2:00 AM GMT)
  - Weekly summary (Monday 9:00 AM GMT)

**4. Manual Execution Test:**
- Click "Run Now" on the dashboard
- Monitor execution in real-time
- Verify leads are posted to ActiveCampaign
- Check that email notification is sent to `steve@goaimysite.com`

**5. Email Notification Test:**
- Navigate to Settings → Manual Triggers
- Click "Send Test Daily Summary"
- Confirm email arrives within 1-2 minutes

---

## Post-Deployment Configuration

### Monitoring and Maintenance

**Railway Logs:**
- Access logs via Railway dashboard → Application Service → "View Logs"
- Logs include:
  - Scheduler executions
  - API calls and responses
  - Error messages
  - Database queries

**Set Up Alerts:**
1. In Railway dashboard, click "Settings" → "Notifications"
2. Enable email notifications for:
   - Deployment failures
   - Application crashes
   - High memory usage

**Resource Monitoring:**
- Railway provides built-in metrics for CPU, memory, and network usage
- Free tier includes:
  - 512 MB RAM
  - 1 GB disk space
  - $5/month usage credit
- Upgrade to Pro plan ($20/month) for:
  - 8 GB RAM
  - 100 GB disk space
  - Priority support

### Scaling Considerations

**Database Scaling:**
- Railway MySQL starts with 1 GB storage
- Automatically scales up to 10 GB on free tier
- For larger datasets, upgrade to Pro plan or use external database (PlanetScale, AWS RDS)

**Application Scaling:**
- Railway automatically handles horizontal scaling
- For high-traffic scenarios, consider:
  - Enabling Railway's autoscaling (Pro plan)
  - Using a CDN for static assets
  - Implementing caching for API responses

**Rate Limit Management:**
- Google Custom Search: 100 queries/day (free tier)
- Hunter.io: Varies by plan (check your subscription)
- ActiveCampaign: No rate limits on API calls
- Resend: 3,000 emails/month (free tier)

**Upgrade Recommendations:**
- If you exceed 100 leads/day, upgrade Google Custom Search to paid tier
- For higher email volume, upgrade Resend to paid plan ($20/month for 50,000 emails)

### Backup Strategy

**Database Backups:**
Railway does not provide automatic backups on the free tier. Implement manual backups:

```bash
# Using Railway CLI
railway run mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > backup.sql
```

**Automated Backup Script:**
Create a GitHub Action to run weekly backups:

```yaml
name: Database Backup
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          railway run mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > backup-$(date +%Y%m%d).sql
          # Upload to S3 or Google Drive
```

**Code Backups:**
- All code is version-controlled in GitHub
- Railway automatically creates deployment snapshots
- You can rollback to any previous deployment via Railway dashboard

### Security Best Practices

**Environment Variables:**
- Never commit API keys to Git
- Use Railway's environment variable encryption
- Rotate API keys quarterly

**HTTPS Enforcement:**
- Railway automatically provisions SSL certificates
- All traffic is encrypted via HTTPS
- No additional configuration needed

**Database Security:**
- Railway MySQL is only accessible from within the Railway network
- Use strong passwords (Railway auto-generates secure credentials)
- Enable IP whitelisting if accessing database externally

**GDPR Compliance:**
- Automated data retention policies are active
- Audit logging tracks all data operations
- Right to be forgotten and data export features are available

---

## Future Development

### How to Request New Features

To add new features or modifications to your prospecting engine, follow these steps:

**1. Prepare Your Requirements:**
- Write a clear description of the feature you want
- Include specific use cases and expected behavior
- Provide examples or mockups if applicable

**2. Contact Manus AI:**
- Open a new conversation in the Manus platform
- Reference your existing project: `prospecting-engine` (version `5d50bd42`)
- Describe the new feature in detail

**3. Development Process:**
- Manus AI will analyze your requirements
- Propose an implementation plan
- Build and test the feature
- Save a new checkpoint for deployment

**4. Deploy Updates:**
- Railway automatically detects changes when you push to GitHub
- Alternatively, download the new checkpoint and manually deploy

### Common Feature Requests

Here are some features you might consider adding in the future:

**Enhanced Analytics:**
- Conversion tracking integration with your CRM
- Predictive lead scoring using machine learning
- Custom dashboards with drag-and-drop widgets
- Export analytics data to Google Sheets or CSV

**Advanced Automation:**
- Multi-stage prospecting campaigns (e.g., find leads → enrich data → score → post to CRM)
- Conditional logic for ICP attributes (e.g., "IF industry = SaaS THEN weight location higher")
- Integration with LinkedIn Sales Navigator for additional data enrichment
- Automated follow-up sequences in ActiveCampaign

**Collaboration Features:**
- Multi-user access with role-based permissions
- Team notifications via Slack or Microsoft Teams
- Shared ICP configurations and A/B tests
- Comments and notes on execution logs

**Data Enrichment:**
- Company size and revenue data from Clearbit or ZoomInfo
- Social media profiles from LinkedIn, Twitter
- Technographic data (tech stack used by companies)
- Funding and investor information from Crunchbase

**Integrations:**
- Salesforce, HubSpot, Pipedrive CRM integrations
- Zapier or Make.com webhooks for custom workflows
- Slack notifications for daily summaries and alerts
- Google Analytics integration for attribution tracking

### Maintenance Schedule

To keep your prospecting engine running smoothly, follow this maintenance schedule:

**Weekly:**
- Review execution logs for errors
- Check API rate limit usage
- Verify email notifications are being delivered
- Monitor database storage usage

**Monthly:**
- Review ICP Analytics and apply recommendations
- Analyze A/B test results and promote winners
- Update ICP data in Google Sheets based on market changes
- Check for software updates and security patches

**Quarterly:**
- Rotate API keys for security
- Review GDPR compliance and audit logs
- Backup database and export critical data
- Evaluate API usage and upgrade plans if needed

**Annually:**
- Comprehensive security audit
- Review and update data retention policies
- Analyze ROI and prospecting effectiveness
- Plan major feature additions or redesigns

---

## Support and Resources

### Documentation

- **TESTING_GUIDE.md:** Detailed testing procedures for all features
- **GDPR_COMPLIANCE.md:** Complete GDPR compliance documentation
- **DEPLOYMENT_GUIDE.md:** Original Railway deployment guide
- **README.md:** Project overview and quick start

### External Resources

- **Railway Documentation:** [docs.railway.app](https://docs.railway.app)
- **Resend Documentation:** [resend.com/docs](https://resend.com/docs)
- **ActiveCampaign API:** [developers.activecampaign.com](https://developers.activecampaign.com)
- **Hunter.io API:** [hunter.io/api-documentation](https://hunter.io/api-documentation)
- **Google Custom Search API:** [developers.google.com/custom-search](https://developers.google.com/custom-search)

### Getting Help

For technical support or feature requests:

1. **Manus Platform:** Open a new conversation and reference your project
2. **GitHub Issues:** Create an issue in your repository
3. **Railway Support:** Use the Railway dashboard support chat (Pro plan only)

---

**End of Guide**

Your prospecting engine is now fully documented, tested, and ready for production deployment. Follow the Railway deployment steps to go live, and refer to this guide for ongoing maintenance and future enhancements.
