# Prospecting Engine Testing Guide

This guide provides comprehensive instructions for testing all features of the Prospecting Engine, including frontend functionality, backend integrations, and end-to-end workflows.

---

## Table of Contents

1. [Frontend Testing](#frontend-testing)
2. [ActiveCampaign Integration Testing](#activecampaign-integration-testing)
3. [API Integration Testing](#api-integration-testing)
4. [ICP Learning & Analytics Testing](#icp-learning--analytics-testing)
5. [GDPR Compliance Testing](#gdpr-compliance-testing)
6. [Scheduled Tasks Testing](#scheduled-tasks-testing)
7. [Rate Limit Monitoring Testing](#rate-limit-monitoring-testing)

---

## Frontend Testing

### Dashboard Access

**Test**: Verify dashboard loads and displays correct data

1. Navigate to the application URL
2. Log in with your Manus account
3. Verify the dashboard displays:
   - Total Runs counter
   - Total Leads counter
   - Last Run timestamp
   - Latest Result count
   - Recent Executions table (empty if no runs yet)

**Expected Result**: Dashboard loads without errors, all widgets display "0" or "Never" for initial state.

---

### ICP Management

**Test**: Sync ICP data from Google Sheets

1. Navigate to **ICP Management** page (via sidebar)
2. Click **"Sync from Google Sheets"** button
3. Wait for sync to complete

**Expected Result**: 
- Success toast notification appears
- ICP data table populates with attributes from your Google Sheet
- Each row shows: Attribute, Value, Weight

**Test**: Preview search query

1. After syncing ICP data, click **"Preview Search Query"** button
2. Review the generated search query in the dialog

**Expected Result**:
- Dialog shows the exact Google search query
- Query includes weighted ICP attributes
- Higher-weighted attributes appear more prominently

**Test**: Edit ICP weights

1. Click edit icon on any ICP row
2. Modify the weight value
3. Save changes

**Expected Result**:
- Weight updates successfully
- Toast confirmation appears
- Preview query reflects the new weights

---

### Manual Prospecting Run

**Test**: Trigger prospecting manually

1. From Dashboard, click **"Run Now"** button
2. Confirm the action
3. Monitor the execution

**Expected Result**:
- Execution starts immediately
- Dashboard updates with new execution log entry
- Status shows "running" then "completed" or "failed"
- Metrics populate: domains found, emails found, leads posted

---

### Execution Logs

**Test**: View execution history

1. Navigate to **Execution Logs** page
2. Review the list of past runs

**Expected Result**:
- Table shows all executions with:
  - Start time
  - Status (completed/failed/running)
  - Domains found
  - Emails found
  - Leads posted
  - Duplicates skipped
  - Error messages (if failed)

---

### Settings Management

**Test**: Add notification recipient

1. Navigate to **Settings** page
2. In "Email Notifications" section, enter a new email address
3. Click **"Add Recipient"**

**Expected Result**:
- Email appears in recipients list
- Toggle switch shows "Active" state
- Toast confirmation appears

**Test**: Toggle recipient status

1. Click toggle switch next to a recipient
2. Verify status changes

**Expected Result**:
- Toggle updates immediately
- Inactive recipients won't receive emails

---

## ActiveCampaign Integration Testing

### Verify Lead Posting

**Test**: Confirm leads are posted to ActiveCampaign

1. Run a manual prospecting execution
2. Wait for completion
3. Log in to your ActiveCampaign account
4. Navigate to **Contacts** → **Lists** → **Prospects** (List ID 4)

**Expected Result**:
- New contacts appear in the Prospects list
- Contact details include:
  - Email address
  - First name (if found by Hunter.io)
  - Last name (if found by Hunter.io)
  - Tags or custom fields (if configured)

**Verification Steps**:

```bash
# Check execution log for posted count
# Dashboard should show "Leads Posted: X"

# In ActiveCampaign:
# 1. Go to Contacts > Lists
# 2. Select "Prospects" list
# 3. Sort by "Date Added" (descending)
# 4. Verify recent contacts match execution timestamp
```

---

### Test Deduplication

**Test**: Verify duplicate leads are not re-posted

1. Run a prospecting execution
2. Note the leads posted count
3. Run another execution immediately
4. Compare results

**Expected Result**:
- Second run shows "Duplicates Skipped: X" where X > 0
- ActiveCampaign does not contain duplicate contacts
- Dashboard "Total Leads" shows unique count, not cumulative

---

## API Integration Testing

### Google Custom Search

**Test**: Verify Google search returns relevant domains

1. Check execution logs for "Search Query" field
2. Copy the search query
3. Manually search on Google using the same query
4. Compare results with "Domains Found" in execution log

**Expected Result**:
- Domains found should match top Google search results
- Domains should be relevant to ICP criteria

**Troubleshooting**:

If no domains are found:
- Verify `GOOGLE_API_KEY` is valid
- Verify `SEARCH_ENGINE_ID` is correct
- Check Google Custom Search Console for quota limits
- Review search query - it may be too specific

---

### Hunter.io Email Finding

**Test**: Verify Hunter.io finds valid emails

1. Pick a domain from execution log
2. Manually search the domain on [Hunter.io](https://hunter.io)
3. Compare results

**Expected Result**:
- Emails found should match Hunter.io results
- Up to 2 emails per domain
- Emails should be valid format (name@domain.com)

**Troubleshooting**:

If no emails are found:
- Verify `HUNTER_API_KEY` is valid
- Check Hunter.io dashboard for remaining credits
- Some domains may not have public emails

---

## ICP Learning & Analytics Testing

### Run Engagement Analysis

**Test**: Analyze ICP performance based on ActiveCampaign engagement

**Prerequisites**:
- At least 10 leads posted to ActiveCampaign
- Leads have been in ActiveCampaign for at least 24 hours (to accumulate engagement data)

**Steps**:

1. Use the manual trigger endpoint or wait for weekly summary
2. Check logs for analysis results

**Using API (Advanced)**:

```bash
# Call the ICP analytics endpoint
curl -X POST https://your-app-url.railway.app/api/trpc/icpAnalytics.analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{}'
```

**Expected Result**:
- Analysis returns:
  - Total leads analyzed
  - Average engagement score
  - Top performing ICP attributes
  - Underperforming ICP attributes
  - Recommendations for weight adjustments

**Interpreting Results**:

- **High engagement (> 60)**: ICP is well-targeted, consider increasing weights
- **Low engagement (< 30)**: ICP needs refinement, consider decreasing weights
- **Recommendations**: Follow AI suggestions to optimize ICP over time

---

### Weekly Summary Email

**Test**: Verify weekly summary is sent

**Manual Trigger** (for immediate testing):

1. Use the manual trigger endpoint:

```bash
curl -X POST https://your-app-url.railway.app/api/trpc/manual.sendWeeklySummary \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{}'
```

2. Check your email inbox (steve@goaimysite.com or configured recipients)

**Expected Result**:
- Email received within 1-2 minutes
- Subject: "📊 Weekly Prospecting Summary: X leads posted"
- Email contains:
  - Total runs this week
  - Total leads posted
  - Success rate percentage
  - Average leads per run
  - Top performing ICP attributes (if enough data)
  - AI-powered recommendations

**Automated Schedule**:
- Weekly summaries are sent every **Monday at 9:00 AM GMT**
- No action needed, just verify email arrives on schedule

---

## GDPR Compliance Testing

### Data Retention

**Test**: Verify data retention policies are configured

1. Check database for retention policies:

```sql
SELECT * FROM data_retention_policy;
```

**Expected Result**:

| entityType      | retentionDays | lastCleanupAt |
|-----------------|---------------|---------------|
| lead            | 730           | (timestamp)   |
| execution_log   | 365           | (timestamp)   |
| audit_log       | 2555          | (timestamp)   |

---

### Right to be Forgotten

**Test**: Delete personal data for a specific email

**Steps**:

1. Post a test lead to ActiveCampaign
2. Note the email address
3. Use the GDPR deletion endpoint:

```bash
curl -X POST https://your-app-url.railway.app/api/trpc/gdpr.deleteData \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"email": "test@example.com"}'
```

4. Verify the lead is removed from database:

```sql
SELECT * FROM leads WHERE email = 'test@example.com';
```

**Expected Result**:
- Query returns no results
- Audit log contains deletion record

---

### Subject Access Request

**Test**: Export all data for a specific email

```bash
curl -X POST https://your-app-url.railway.app/api/trpc/gdpr.exportData \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"email": "test@example.com"}'
```

**Expected Result**:
- JSON response contains all data associated with the email
- Includes: email, domain, posted date, execution ID

---

### Audit Logging

**Test**: Verify all data operations are logged

1. Perform various operations (create lead, export data, delete data)
2. Check audit logs:

```sql
SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 10;
```

**Expected Result**:
- Each operation has a corresponding audit log entry
- Entries include: action, entityType, entityId, userId, ipAddress, timestamp

---

## Scheduled Tasks Testing

### Daily Prospecting Run

**Schedule**: Every day at **7:00 AM GMT**

**Test**: Verify scheduled run executes

1. Wait for scheduled time (or adjust cron expression for testing)
2. Check execution logs at 7:05 AM GMT
3. Verify new execution entry exists

**Expected Result**:
- Execution appears in logs with source "scheduled"
- Leads are posted to ActiveCampaign
- Email notification is sent to recipients

**Check Server Logs**:

```bash
# On Railway, view logs:
# Dashboard > Your Project > Logs

# Look for:
[Scheduler] Starting scheduled prospecting run at 2025-XX-XXTXX:XX:XX.XXXZ
[Prospecting] Starting prospecting run...
[Scheduler] Completed successfully: X leads posted
```

---

### GDPR Data Cleanup

**Schedule**: Every day at **2:00 AM GMT**

**Test**: Verify old data is cleaned up

1. Insert test data with old timestamps:

```sql
INSERT INTO leads (email, domain, postedAt) 
VALUES ('old@example.com', 'example.com', '2020-01-01');
```

2. Wait for scheduled cleanup or trigger manually
3. Verify old data is deleted

**Expected Result**:
- Data older than retention period is removed
- Audit logs remain for 7 years
- Execution logs remain for 1 year
- Leads remain for 2 years

---

### Weekly Summary

**Schedule**: Every **Monday at 9:00 AM GMT**

**Test**: Covered in [Weekly Summary Email](#weekly-summary-email) section above.

---

## Rate Limit Monitoring Testing

### Check Rate Limit Status

**Test**: View current API usage

1. Navigate to Dashboard
2. Check rate limit widget (if implemented in frontend)
3. Or use API endpoint:

```bash
curl https://your-app-url.railway.app/api/trpc/rateLimit.status \
  -H "Cookie: your-session-cookie"
```

**Expected Result**:

```json
{
  "google": {
    "service": "Google Custom Search",
    "used": 15,
    "limit": 100,
    "remaining": 85,
    "percentage": 15,
    "status": "healthy"
  },
  "hunter": {
    "service": "Hunter.io",
    "used": 45,
    "limit": 500,
    "remaining": 455,
    "percentage": 9,
    "status": "healthy"
  }
}
```

---

### Test Rate Limit Prevention

**Test**: Verify prospecting stops when quota is exceeded

1. Manually set rate limit counters to near-limit values (for testing)
2. Attempt to run prospecting
3. Verify execution is blocked

**Expected Result**:
- Execution fails with error: "Insufficient Google Custom Search quota" or similar
- Email notification is sent about rate limit issue
- No API calls are made

---

## Lead Export Testing

**Test**: Export all leads to CSV

1. Navigate to Dashboard or Leads page
2. Click **"Export Leads"** button
3. Download the CSV file

**Expected Result**:
- CSV file downloads successfully
- Contains columns: ID, Email, Domain, Posted At, Execution ID, Search Query, ICP Snapshot
- All leads are included
- Data is properly formatted

**Manual API Test**:

```bash
curl https://your-app-url.railway.app/api/trpc/leads.exportAll \
  -H "Cookie: your-session-cookie" \
  > leads.json
```

---

## End-to-End Testing Checklist

Use this checklist to verify the complete workflow:

- [ ] **Setup**: API keys configured in Railway environment variables
- [ ] **Setup**: Resend API key configured for email notifications
- [ ] **Setup**: Notification recipient added (steve@goaimysite.com)
- [ ] **ICP Sync**: Google Sheets data synced successfully
- [ ] **Preview**: Search query preview shows correct weighted query
- [ ] **Manual Run**: Prospecting run completes successfully
- [ ] **ActiveCampaign**: Leads appear in Prospects list (ID 4)
- [ ] **Deduplication**: Second run skips duplicates
- [ ] **Email Notification**: Daily report email received
- [ ] **Execution Logs**: All runs logged with correct metrics
- [ ] **Scheduled Run**: 7 AM GMT run executes automatically
- [ ] **Weekly Summary**: Monday 9 AM GMT summary email received
- [ ] **ICP Analytics**: Engagement analysis returns insights
- [ ] **Rate Limits**: Status shows current usage
- [ ] **GDPR**: Data export works for test email
- [ ] **GDPR**: Data deletion works for test email
- [ ] **Audit Logs**: All operations logged
- [ ] **Lead Export**: CSV download works

---

## Troubleshooting Common Issues

### No Domains Found

**Possible Causes**:
- Invalid Google API key
- Incorrect Search Engine ID
- Search query too specific
- Google Custom Search quota exceeded

**Solutions**:
1. Verify API credentials in Railway settings
2. Check Google Custom Search Console for errors
3. Review search query preview - simplify ICP criteria
4. Check rate limit status

---

### No Emails Found

**Possible Causes**:
- Invalid Hunter.io API key
- Hunter.io quota exceeded
- Domains don't have public emails

**Solutions**:
1. Verify Hunter.io API key
2. Check Hunter.io dashboard for remaining credits
3. Test domains manually on Hunter.io website

---

### Leads Not Appearing in ActiveCampaign

**Possible Causes**:
- Invalid ActiveCampaign API credentials
- Incorrect list ID
- API rate limiting

**Solutions**:
1. Verify `AC_API_URL`, `AC_API_TOKEN`, `AC_LIST_ID` in Railway
2. Check ActiveCampaign API logs for errors
3. Verify list ID 4 exists in your ActiveCampaign account

---

### Emails Not Sending

**Possible Causes**:
- Invalid Resend API key
- No active notification recipients
- Email service rate limiting

**Solutions**:
1. Verify `RESEND_API_KEY` in Railway settings
2. Check notification recipients are active in Settings
3. Review Resend dashboard for delivery logs
4. Check spam folder

---

## Performance Testing

### Load Testing

**Test**: Verify system handles 100+ leads per run

1. Set target leads to 100
2. Run prospecting
3. Monitor execution time and success rate

**Expected Result**:
- Execution completes within 10-15 minutes
- All API calls succeed
- No timeout errors
- Memory usage remains stable

---

### Database Performance

**Test**: Query performance with large datasets

1. After 1000+ leads, run analytics
2. Check query execution time

**Expected Result**:
- Queries complete within 2-3 seconds
- No database connection errors
- Indexes are utilized (check EXPLAIN output)

---

## Security Testing

### Authentication

**Test**: Verify protected routes require authentication

1. Log out of the application
2. Attempt to access `/api/trpc/prospecting.run` directly

**Expected Result**:
- Request is rejected with 401 Unauthorized
- User is redirected to login

---

### API Key Security

**Test**: Verify API keys are not exposed

1. Inspect frontend source code
2. Check network requests in browser DevTools

**Expected Result**:
- No API keys visible in frontend code
- All API calls go through backend
- Environment variables not exposed to client

---

## Conclusion

This testing guide covers all major features and integrations of the Prospecting Engine. Regular testing ensures the system operates reliably and meets GDPR compliance requirements.

For production deployment, automate these tests using a CI/CD pipeline and monitor the application continuously using Railway logs and metrics.

**Support**: For issues not covered in this guide, check the deployment guide or contact the development team.
