# Railway.app Deployment Guide

**Prospecting Engine** | **Version 1.0** | **Last Updated: November 16, 2025**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step-by-Step Deployment](#step-by-step-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to Railway, ensure you have the following items ready.

### Required Accounts

You will need a **Railway.app account** (sign up at https://railway.app with GitHub authentication recommended). You will also need a **GitHub account** to host your code repository. Additionally, you should have a **Resend account** for email notifications (sign up at https://resend.com, free tier includes 3,000 emails/month).

### API Credentials

Gather the following API credentials before starting deployment. For **Google Custom Search**, you need the API Key (`GOOGLE_API_KEY`) and Search Engine ID (`SEARCH_ENGINE_ID`). For **Hunter.io**, you need the API Key (`HUNTER_API_KEY`). For **ActiveCampaign**, you need the API URL (`AC_API_URL`), API Token (`AC_API_TOKEN`), and List ID (`AC_LIST_ID`). For **Resend**, you need the API Key (`RESEND_API_KEY`).

All of these credentials should already be available from the initial setup. If you need to regenerate any keys, refer to the respective service's documentation.

### Code Repository

Your Prospecting Engine code must be in a Git repository. If you received the code as a zip file or folder, you need to initialize a Git repository and push it to GitHub.

To do this, navigate to your project directory in the terminal and run the following commands:

```bash
cd /path/to/prospecting-engine
git init
git add .
git commit -m "Initial commit - Prospecting Engine"
```

Then create a new repository on GitHub (https://github.com/new) and push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/prospecting-engine.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step-by-Step Deployment

Follow these steps to deploy your Prospecting Engine to Railway.app.

### Step 1: Create a New Railway Project

Navigate to https://railway.app and log in with your GitHub account. Click the **New Project** button in the top-right corner. Select **Deploy from GitHub repo** from the options. Railway will ask for permission to access your GitHub repositories—click **Configure GitHub App** and grant access to the repository containing your Prospecting Engine code.

### Step 2: Select Your Repository

After granting access, you will see a list of your GitHub repositories. Find and select the **prospecting-engine** repository (or whatever you named it). Railway will automatically detect that this is a Node.js project and configure the build settings.

### Step 3: Add a Database

Your Prospecting Engine requires a MySQL database. In your Railway project dashboard, click the **New** button and select **Database**. Choose **MySQL** from the list of available databases. Railway will provision a new MySQL instance and automatically add a `DATABASE_URL` environment variable to your project.

Wait for the database to finish provisioning (this usually takes 30-60 seconds). You will see a green checkmark when it is ready.

### Step 4: Configure Environment Variables

Click on your web service (the one connected to your GitHub repository) in the Railway dashboard. Navigate to the **Variables** tab. You need to add all the API credentials and configuration values as environment variables.

Click **New Variable** and add each of the following:

```
GOOGLE_API_KEY=AIzaSyAf9Qqx8AP-wosStzpWfkvurSWw3eaQxcg
SEARCH_ENGINE_ID=b05119c9175944f77
HUNTER_API_KEY=0709057b74ecfdf2eadd6ad42f2c9ee625830a94
AC_API_URL=https://stevehoman2.api-us1.com
AC_API_TOKEN=10ca4b4414320efdf4b92751ef46306f7322ceab56650a4a1da595deaaf665ede727df77
AC_LIST_ID=4
RESEND_API_KEY=your_resend_api_key_here
```

**Important:** Replace `your_resend_api_key_here` with your actual Resend API key from https://resend.com/api-keys.

Railway automatically provides the `DATABASE_URL` variable from the MySQL database you added in Step 3, so you do not need to add it manually.

### Step 5: Deploy

After adding all environment variables, Railway will automatically trigger a deployment. You can monitor the deployment progress in the **Deployments** tab. The build process will install dependencies, compile TypeScript, and start the server. This usually takes 2-3 minutes.

Once the deployment shows a green checkmark and status "Success", your application is live.

### Step 6: Get Your Application URL

In the Railway dashboard, click on your web service. Navigate to the **Settings** tab and scroll down to the **Domains** section. Click **Generate Domain** to create a public URL for your application (e.g., `prospecting-engine-production.up.railway.app`).

Copy this URL—you will use it to access your Prospecting Engine dashboard.

---

## Environment Variables

This section provides detailed information about each environment variable and how to obtain it.

### Google Custom Search

**GOOGLE_API_KEY**: Your Google Cloud API key with Custom Search API enabled. To obtain this, visit https://console.cloud.google.com/apis/credentials, create a new API key, and enable the Custom Search API.

**SEARCH_ENGINE_ID**: Your Google Custom Search Engine ID. To obtain this, visit https://programmablesearchengine.google.com, create a new search engine, and copy the Search Engine ID from the settings.

### Hunter.io

**HUNTER_API_KEY**: Your Hunter.io API key for email finding. To obtain this, visit https://hunter.io/api-keys after signing up for an account.

### ActiveCampaign

**AC_API_URL**: Your ActiveCampaign API base URL (e.g., `https://YOUR_ACCOUNT.api-us1.com`). Find this in your ActiveCampaign account under Settings > Developer.

**AC_API_TOKEN**: Your ActiveCampaign API key. Generate this in Settings > Developer > API Access.

**AC_LIST_ID**: The ID of the ActiveCampaign list where leads will be posted. To find this, navigate to Lists in ActiveCampaign, click on your "Prospects" list, and look for the ID in the URL (e.g., `/admin/main.php?action=list_edit&id=4` means the ID is 4).

### Resend

**RESEND_API_KEY**: Your Resend API key for sending email notifications. To obtain this, visit https://resend.com/api-keys after signing up for an account.

### Database

**DATABASE_URL**: MySQL connection string. This is automatically provided by Railway when you add a MySQL database to your project. You do not need to configure this manually.

---

## Database Setup

After your application is deployed, you need to initialize the database schema and import your ICP data.

### Step 1: Run Database Migrations

Railway does not automatically run database migrations on deployment. You need to trigger this manually the first time.

In your Railway project dashboard, click on your web service. Navigate to the **Deployments** tab and click on the most recent successful deployment. Scroll down to the **Deployment Logs** section and look for a line that says "Server running on http://localhost:3000/".

Open the **Shell** tab (next to Deployments) and run the following command:

```bash
pnpm db:push
```

This will create all necessary database tables (users, icp_data, execution_logs, leads, notification_recipients, settings, etc.).

### Step 2: Import ICP Data

Your ICP data needs to be imported into the database. In the Railway shell, run the following command:

```bash
pnpm exec tsx import-icp-data.ts
```

This will import the 20 ICP data items (Industry, Company_Size, Region, Tech_Stack, Role) with their weights.

### Step 3: Add Notification Recipient

Add your email address as a notification recipient by running this SQL command in the Railway shell:

```bash
pnpm exec tsx -e "
import { drizzle } from 'drizzle-orm/mysql2';
import { notificationRecipients } from './drizzle/schema';
const db = drizzle(process.env.DATABASE_URL);
await db.insert(notificationRecipients).values({
  email: 'steve@goaimysite.com',
  isActive: true,
}).onDuplicateKeyUpdate({ set: { isActive: true } });
console.log('✓ Added notification recipient');
process.exit(0);
"
```

---

## Post-Deployment Configuration

After deployment, you need to configure a few additional settings.

### Verify Domain for Resend

To send emails from your own domain (instead of Resend's test domain), you need to verify domain ownership.

Log in to your Resend dashboard at https://resend.com/domains. Click **Add Domain** and enter your domain (e.g., `goaimysite.com`). Resend will provide DNS records (TXT, MX, CNAME) that you need to add to your domain's DNS settings. Add these records through your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare). Wait for DNS propagation (usually 5-30 minutes) and click **Verify** in Resend.

Once verified, emails will be sent from `noreply@goaimysite.com` instead of `noreply@resend.dev`.

### Set Up Daily Scheduler

The Prospecting Engine includes a built-in scheduler that runs daily at 7:00 AM GMT. This is automatically initialized when the server starts—no additional configuration is needed.

To verify the scheduler is running, check your deployment logs in Railway. You should see a line that says "[Scheduler] Daily prospecting scheduled for 7:00 AM GMT".

### Configure Timezone (Optional)

If you want to change the daily run time from 7:00 AM GMT to a different time or timezone, you need to modify the scheduler configuration.

In your code repository, edit `server/scheduler.ts` and find the line:

```typescript
cron.schedule('0 7 * * *', async () => {
```

Change `'0 7 * * *'` to your desired time in cron format. For example, `'0 9 * * *'` runs at 9:00 AM GMT, or `'30 14 * * *'` runs at 2:30 PM GMT.

Commit and push the change to GitHub. Railway will automatically redeploy with the new schedule.

---

## Verification

After deployment, verify that everything is working correctly.

### Step 1: Access the Dashboard

Open your Railway-generated URL (e.g., `https://prospecting-engine-production.up.railway.app`) in a web browser. You should see the Prospecting Engine login page. Log in with your Manus OAuth account (the same account used to build the application).

### Step 2: Check ICP Data

Navigate to **ICP Management** in the sidebar. You should see 20 ICP data items organized by attribute (Industry, Company_Size, Region, Tech_Stack, Role). If the page shows "No ICP data found", return to the Database Setup section and run the import script.

### Step 3: Run a Test Campaign

Click **Dashboard** in the sidebar, then click the **Run Now** button. The system will execute a prospecting campaign with a target of 100 leads. Monitor the **Recent Executions** section for progress.

A successful test run should show:
- Domains Found: 5-100 (depending on how restrictive your ICP is)
- Emails Found: 5-200 (Hunter.io finds up to 2 emails per domain)
- Leads Posted: 5-100 (new leads posted to ActiveCampaign)
- Duplicates Skipped: 0 (on first run)

### Step 4: Verify ActiveCampaign

Log in to your ActiveCampaign account at https://stevehoman2.activehosted.com. Navigate to **Contacts** and filter by the "Prospects" list (ID 4). You should see new contacts added with email addresses, domains, and timestamps matching your test run.

### Step 5: Check Email Notifications

Within 1-2 minutes of the test run completing, you should receive an email at steve@goaimysite.com with the subject "✅ Prospecting Run #XXXXX Completed Successfully". The email will contain a summary of results (domains found, emails found, leads posted).

If you do not receive the email, check your spam folder or verify that the `RESEND_API_KEY` environment variable is configured correctly in Railway.

---

## Troubleshooting

This section addresses common deployment issues.

### Build Fails with "Module not found" Error

**Problem:** Railway deployment fails during the build step with errors like "Cannot find module 'axios'" or "Cannot find module 'resend'".

**Solution:** This usually means dependencies were not installed correctly. In your Railway project, navigate to the **Settings** tab and check the **Build Command**. It should be `pnpm install && pnpm build`. If it is different, update it and redeploy.

### Database Connection Fails

**Problem:** The application starts but shows errors like "Database not available" or "Connection refused" in the logs.

**Solution:** Verify that the MySQL database is running in your Railway project. In the Railway dashboard, you should see both a web service (your application) and a MySQL database. If the database shows a red X or "Failed" status, delete it and create a new one. Ensure the `DATABASE_URL` environment variable is automatically populated—you should see it in the Variables tab of your web service.

### Application Starts But Shows Blank Page

**Problem:** The Railway URL loads but shows a blank white page or "Cannot GET /" error.

**Solution:** This usually means the frontend build failed or the server is not serving static files correctly. Check the deployment logs for errors during the `pnpm build` step. Ensure the `server/_core/index.ts` file includes the line `app.use(express.static(path.join(__dirname, '../../client/dist')))` to serve the built frontend.

### Scheduler Not Running

**Problem:** The daily prospecting campaign does not run automatically at 7:00 AM GMT.

**Solution:** Verify that the scheduler initialized correctly by checking the deployment logs. You should see "[Scheduler] Daily prospecting scheduled for 7:00 AM GMT" near the end of the logs. If this line is missing, the scheduler may have failed to initialize. Check for errors in `server/scheduler.ts` and ensure `node-cron` is installed (`pnpm add node-cron`).

### API Rate Limit Errors

**Problem:** Prospecting runs fail with errors like "Google Custom Search quota exceeded" or "Hunter.io rate limit reached".

**Solution:** Check your API usage in the respective dashboards. Google Custom Search free tier allows 100 queries/day. Hunter.io limits depend on your plan (free tier is 25 searches/month). If you are hitting limits, reduce the **Daily Target Leads** setting in the application, or upgrade to paid API plans with higher quotas.

### Email Notifications Not Sending

**Problem:** Prospecting runs complete successfully, but no email notifications are received.

**Solution:** Verify that the `RESEND_API_KEY` environment variable is set in Railway. Check the deployment logs for lines starting with "[Email]". If you see "[Email] RESEND_API_KEY not configured, logging notification instead", the API key is missing. Add it in the Variables tab and redeploy. If the key is configured but emails still are not arriving, check your Resend dashboard at https://resend.com/emails for delivery status and error messages.

---

## Maintenance and Updates

After deployment, you may need to update the application or modify configuration.

### Updating Code

To deploy code changes, commit and push to your GitHub repository:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

Railway will automatically detect the push and trigger a new deployment. Monitor the Deployments tab to ensure the update succeeds.

### Scaling

Railway automatically scales your application based on traffic. For the Prospecting Engine, the default settings (512MB RAM, 1 vCPU) are sufficient for up to 1,000 leads/day. If you need to process more leads or run multiple A/B tests simultaneously, you can increase resources in the Railway Settings tab under **Resources**.

### Backups

Railway automatically backs up your MySQL database daily. To manually create a backup, navigate to the MySQL database in your Railway project, click the three-dot menu, and select **Backup**. You can restore from backups in the same menu.

### Monitoring

Railway provides built-in monitoring in the **Metrics** tab of your web service. You can view CPU usage, memory usage, request count, and response times. Set up alerts in the **Settings** tab to receive notifications if your application goes down or exceeds resource limits.

---

## Cost Estimate

Railway offers a free tier with $5/month of usage credit. After that, you pay for actual resource usage.

### Typical Monthly Cost

For the Prospecting Engine running daily with 100 leads/day, expect the following costs. The **web service** (512MB RAM, 1 vCPU) costs approximately $5-7/month. The **MySQL database** (1GB storage) costs approximately $3-5/month. **Total estimated cost**: $8-12/month.

This assumes the free tier credit is exhausted. If you are a new Railway user, the first month may be covered by the free $5 credit.

### External Service Costs

In addition to Railway, you will incur costs for external APIs. **Google Custom Search** is free for up to 100 queries/day. **Hunter.io** free tier includes 25 searches/month; paid plans start at $49/month for 500 searches. **Resend** free tier includes 3,000 emails/month; paid plans start at $20/month for 50,000 emails. **ActiveCampaign** pricing depends on your existing plan (no additional cost for API usage).

---

## Support

If you encounter issues not covered in this guide, you can access Railway's documentation at https://docs.railway.app for general deployment help. You can also visit Railway's Discord community at https://discord.gg/railway for real-time support. For Prospecting Engine-specific issues, refer to the USER_GUIDE.md and TESTING_GUIDE.md files in your project repository.

---

**End of Railway Deployment Guide**
