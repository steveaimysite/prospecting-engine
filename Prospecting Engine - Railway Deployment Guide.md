# Prospecting Engine - Railway Deployment Guide

This guide provides step-by-step instructions for deploying the Prospecting Engine to Railway.app.

## Prerequisites

Before deploying, ensure you have the following ready:

**API Credentials:**
- Google API Key (for Custom Search)
- Google Search Engine ID
- Hunter.io API Key
- ActiveCampaign API URL and Token
- ActiveCampaign List ID (default: 4)

**Accounts:**
- Railway.app account (free tier available)
- GitHub account (for repository hosting)

## Deployment Steps

### Step 1: Push Code to GitHub

First, create a new GitHub repository and push your code:

```bash
cd /path/to/prospecting-engine
git init
git add .
git commit -m "Initial commit: Prospecting Engine"
git remote add origin https://github.com/yourusername/prospecting-engine.git
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to [Railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `prospecting-engine` repository
5. Railway will automatically detect the configuration

### Step 3: Add Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add MySQL"**
2. Railway will provision a MySQL database and automatically set the `DATABASE_URL` environment variable
3. Wait for the database to be ready (status will show "Active")

### Step 4: Configure Environment Variables

In your Railway project dashboard:

1. Click on your service (the one with your code)
2. Go to the **"Variables"** tab
3. Add the following environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `GOOGLE_API_KEY` | Your Google API key | For Custom Search API |
| `SEARCH_ENGINE_ID` | Your Search Engine ID | Google Custom Search Engine ID |
| `HUNTER_API_KEY` | Your Hunter.io key | For email finding |
| `AC_API_URL` | `https://youraccountname.api-us1.com` | ActiveCampaign API URL |
| `AC_API_TOKEN` | Your AC token | ActiveCampaign API token |
| `AC_LIST_ID` | `4` | ActiveCampaign list ID for prospects |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port (optional) |

**Note:** The `DATABASE_URL` is automatically set by Railway when you add the MySQL database.

### Step 5: Run Database Migrations

After the first deployment, you need to run database migrations:

1. In Railway dashboard, go to your service
2. Click **"Settings"** → **"Deploy"**
3. Under **"Custom Start Command"**, temporarily set: `pnpm db:push && pnpm start`
4. Save and redeploy
5. After successful migration, you can remove `pnpm db:push &&` from the start command

**Alternative:** Use Railway's CLI to run migrations:

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

### Step 6: Verify Deployment

1. Once deployed, Railway will provide a public URL (e.g., `https://prospecting-engine-production.up.railway.app`)
2. Visit the URL to access your application
3. Log in using Manus OAuth
4. Navigate to **Settings** to verify API configuration
5. Go to **ICP Management** and click **"Sync from Google Sheets"** to import your ICP data

### Step 7: Test the Prospecting Engine

1. From the **Dashboard**, click **"Run Now"** to trigger a manual prospecting run
2. Monitor the execution in **Execution Logs**
3. Verify that leads are posted to ActiveCampaign list ID 4
4. Check that email notifications are logged (configure email service for production)

## Scheduler Configuration

The application automatically runs daily at **7:00 AM GMT**. The scheduler initializes when the server starts and requires no additional configuration.

To verify the scheduler is running:
- Check Railway logs for: `[Scheduler] Scheduler initialized successfully`
- The scheduler will execute automatically at the configured time

## Email Notifications

The application uses **Resend** for production email notifications. Resend is the recommended email service for Railway.app deployments with excellent deliverability and a generous free tier.

### Why Resend?

- **Free Tier**: 3,000 emails/month, 100 emails/day (perfect for daily reports)
- **No Credit Card Required**: Start immediately with free tier
- **Excellent Deliverability**: Built by the team behind React Email
- **Simple API**: Clean, modern API with great documentation
- **Railway Integration**: Works seamlessly with Railway deployments

### Setup Resend

1. **Sign up for Resend**:
   - Go to [resend.com](https://resend.com)
   - Create a free account
   - Verify your email address

2. **Get your API key**:
   - In Resend dashboard, go to **API Keys**
   - Click **Create API Key**
   - Give it a name (e.g., "Prospecting Engine Production")
   - Copy the API key (starts with `re_`)

3. **Configure domain (optional but recommended)**:
   - For production, add your domain in Resend dashboard
   - Add DNS records as instructed by Resend
   - Verify domain ownership
   - This allows sending from `noreply@yourdomain.com` instead of `onboarding@resend.dev`

4. **Add environment variables to Railway**:
   - `RESEND_API_KEY`: Your Resend API key (required)
   - `FROM_EMAIL`: Your sender email (optional, defaults to `onboarding@resend.dev`)

### Email Features

The application sends beautifully formatted HTML emails with:
- **Success notifications**: Green-themed emails with detailed statistics
- **Failure alerts**: Red-themed emails with error details
- **Metrics included**: Domains found, emails found, leads posted, duplicates skipped
- **Execution details**: Start time, completion time, duration
- **Responsive design**: Looks great on desktop and mobile

### Testing Without Resend

If `RESEND_API_KEY` is not configured, the application will:
- Log email content to console instead of sending
- Continue functioning normally
- Show what would have been sent in the Railway logs

This is useful for development and testing.

## Monitoring and Logs

### View Application Logs

In Railway dashboard:
1. Click on your service
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. View real-time logs in the **"Logs"** section

### Monitor Prospecting Runs

Use the built-in dashboard:
- **Dashboard**: Overview of runs and statistics
- **Execution Logs**: Detailed history of each run
- **Settings**: Manage notification recipients

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Verify `DATABASE_URL` is set correctly in Railway
2. Ensure the MySQL database is running (check Railway dashboard)
3. Run migrations: `railway run pnpm db:push`

### API Rate Limits

If you encounter rate limit errors:
- **Google Custom Search**: Free tier allows 100 queries/day
- **Hunter.io**: Check your plan limits
- **ActiveCampaign**: Monitor API usage in your AC dashboard

The application includes error handling that will log rate limit issues and send notifications.

### Scheduler Not Running

If scheduled runs aren't executing:
1. Check Railway logs for scheduler initialization message
2. Verify the server is running continuously (not sleeping)
3. Railway's free tier keeps services active; paid plans guarantee uptime

### Missing ICP Data

If prospecting runs fail with "No ICP data found":
1. Go to **ICP Management** in the dashboard
2. Click **"Sync from Google Sheets"**
3. Verify the Google Sheets link is accessible with your API key

## Scaling Considerations

### Increasing Lead Volume

To scale from 100 to 1000+ leads per day:

1. **Upgrade API Plans:**
   - Google Custom Search: Consider paid tier for higher quotas
   - Hunter.io: Upgrade to higher plan for more requests
   - ActiveCampaign: Ensure your plan supports the volume

2. **Optimize Performance:**
   - The application uses batch processing and rate limiting
   - Adjust delays in `server/prospectingEngine.ts` if needed
   - Consider implementing a job queue for very high volumes

3. **Railway Resources:**
   - Free tier is sufficient for 100 leads/day
   - For 1000+ leads, consider upgrading to Railway's paid plan for better performance

## Maintenance

### Updating ICP Weights

You can update ICP weights in two ways:

1. **Via Dashboard:**
   - Go to **ICP Management**
   - Click on any weight value to edit
   - Changes take effect immediately

2. **Via Google Sheets:**
   - Update the Google Sheet directly
   - Click **"Sync from Google Sheets"** in the dashboard
   - This will replace all ICP data with the sheet contents

### Managing Notification Recipients

1. Go to **Settings** in the dashboard
2. Add new email addresses in the "Email Notifications" section
3. Toggle recipients on/off without deleting them
4. steve@goaimysite.com is configured by default

## Key Features

### Lead Deduplication

The application automatically tracks all leads posted to ActiveCampaign and prevents duplicates:

- **Automatic Tracking**: Every successfully posted lead is recorded in the database
- **Email-Based Deduplication**: Uses email address as the unique identifier
- **Skip Duplicates**: Before posting, checks if email was already processed
- **Statistics**: Dashboard shows "Unique leads tracked" count
- **Email Reports**: Daily notifications include "Duplicates Skipped" count

This ensures you never post the same lead twice to ActiveCampaign, even across multiple prospecting runs.

### Search Query Preview

Before running prospecting, you can preview the exact Google search query:

1. Go to **ICP Management** in the dashboard
2. Click **"Preview Search Query"** button
3. View the generated query with explanations
4. Understand how your ICP weights translate to search terms

This helps you:
- Validate your ICP configuration before running
- Understand which attributes are being prioritized
- Fine-tune weights to get better results
- Debug search issues

### Dashboard Statistics

The dashboard provides real-time insights:
- **Total Runs**: Number of prospecting executions
- **Total Leads**: Unique leads tracked (deduplication count)
- **Last Run**: Timestamp of most recent execution
- **Latest Result**: Leads posted in last run
- **Recent Executions**: Detailed log of recent runs with metrics

## Security Best Practices

1. **Environment Variables:** Never commit API keys to Git
2. **Database Access:** Railway provides secure database connections
3. **Authentication:** The app uses Manus OAuth for secure access
4. **API Keys:** Rotate keys periodically for security

## Support and Updates

For issues or questions:
- Check Railway logs for error messages
- Review execution logs in the dashboard
- Verify API credentials are correct
- Ensure all environment variables are set

## Cost Estimate

**Railway.app:**
- Free tier: $0/month (sufficient for testing and low volume)
- Paid tier: ~$5-10/month (recommended for production)

**API Services:**
- Google Custom Search: Free tier (100 queries/day) or $5/1000 queries
- Hunter.io: Plans start at $49/month
- ActiveCampaign: Based on your existing plan
- Resend: Free tier (3,000 emails/month) or $20/month for 50,000 emails

Total estimated cost: $50-70/month for production use at 100 leads/day (Resend free tier is sufficient).
