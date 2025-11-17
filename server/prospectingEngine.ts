import axios from 'axios';
import { getAllIcpData, createExecutionLog, updateExecutionLog, isEmailAlreadyProcessed, addLead } from './db';
import { sendDailyReport } from './emailService';
import { incrementGoogleSearch, incrementHunterSearch, canProceedWithProspecting } from './rateLimitService';

interface GoogleSearchResult {
  items?: Array<{
    link: string;
    title: string;
  }>;
}

interface HunterEmailResult {
  data?: {
    organization?: string;
    emails?: Array<{
      value: string;
      type: string;
      confidence: number;
      first_name?: string;
      last_name?: string;
      position?: string;
      seniority?: string;
      department?: string;
      linkedin?: string | null;
      twitter?: string | null;
      phone_number?: string | null;
      verification?: {
        date: string;
        status: string;
      };
    }>;
  };
}

interface ProspectingResult {
  success: boolean;
  domainsFound: number;
  emailsFound: number;
  leadsPosted: number;
  duplicatesSkipped: number;
  error?: string;
  executionLogId?: number;
}

/**
 * Build Google Custom Search query from ICP data
 */
function buildSearchQuery(icpData: Array<{ attribute: string; value: string; weight: string }>): string {
  // Group by attribute
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

  // Build query parts
  const queryParts: string[] = [];
  
  for (const [attribute, values] of Object.entries(grouped)) {
    if (values.length > 0) {
      // Sort by weight descending and take top values
      const sortedValues = values.sort((a, b) => b.weight - a.weight);
      const valueStrings = sortedValues.map(v => `"${v.value}"`).join(' OR ');
      queryParts.push(`(${valueStrings})`);
    }
  }

  return queryParts.join(' AND ');
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Search Google Custom Search API
 */
async function searchGoogle(query: string, apiKey: string, searchEngineId: string, maxResults: number = 100): Promise<string[]> {
  const domains = new Set<string>();
  const resultsPerPage = 10; // Google CSE returns max 10 per request
  const maxPages = Math.ceil(maxResults / resultsPerPage);

  try {
    for (let page = 0; page < maxPages; page++) {
      const startIndex = page * resultsPerPage + 1;
      const response = await axios.get<GoogleSearchResult>('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: apiKey,
          cx: searchEngineId,
          q: query,
          start: startIndex,
        },
      });

      if (response.data.items) {
        response.data.items.forEach(item => {
          const domain = extractDomain(item.link);
          if (domain) {
            domains.add(domain);
          }
        });
      }

      // Stop if we have enough domains
      if (domains.size >= maxResults) {
        break;
      }
    }
  } catch (error: any) {
    console.error('[Google Search] Error:', error.response?.data || error.message);
    throw new Error(`Google Search failed: ${error.response?.data?.error?.message || error.message}`);
  }

  return Array.from(domains).slice(0, maxResults);
}

/**
 * Find emails for a domain using Hunter.io
 */
interface EmailData {
  email: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  seniority?: string;
  department?: string;
  linkedin?: string;
  confidence?: number;
  verificationStatus?: string;
}

async function findEmailsForDomain(domain: string, apiKey: string, maxEmails: number = 2): Promise<EmailData[]> {
  try {
    const response = await axios.get<HunterEmailResult>('https://api.hunter.io/v2/domain-search', {
      params: {
        domain,
        api_key: apiKey,
        limit: maxEmails,
      },
    });

    if (response.data.data?.emails) {
      // Filter for personal emails (not generic like info@, support@)
      const personalEmails = response.data.data.emails
        .filter(email => email.type !== 'generic')
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxEmails)
        .map(email => ({
          email: email.value,
          firstName: email.first_name,
          lastName: email.last_name,
          position: email.position,
          seniority: email.seniority,
          department: email.department,
          linkedin: email.linkedin || undefined,
          confidence: email.confidence,
          verificationStatus: email.verification?.status,
        }));
      
      return personalEmails;
    }

    return [];
  } catch (error: any) {
    console.error(`[Hunter] Error for domain ${domain}:`, error.response?.data || error.message);
    return [];
  }
}

/**
 * Post lead to ActiveCampaign
 */
async function postToActiveCampaign(
  emailData: EmailData,
  domain: string,
  apiUrl: string,
  apiToken: string,
  listId: number
): Promise<boolean> {
  const { email, firstName, lastName, position, seniority, department, linkedin, confidence, verificationStatus } = emailData;
  try {
    // Build field values array with all available data
    const fieldValues: Array<{ field: string; value: string }> = [
      { field: '6', value: domain }, // Domain field
    ];
    
    // Add optional fields if available
    if (position) fieldValues.push({ field: '11', value: position }); // Job Title
    if (department) fieldValues.push({ field: '12', value: department }); // Department
    if (seniority) fieldValues.push({ field: '13', value: seniority }); // Seniority
    if (linkedin) fieldValues.push({ field: '14', value: linkedin }); // LinkedIn Profile
    if (confidence) fieldValues.push({ field: '17', value: confidence.toString() }); // Email Confidence Score
    if (verificationStatus) fieldValues.push({ field: '18', value: verificationStatus }); // Email Verification Status

    // First, create or update the contact
    const contactResponse = await axios.post(
      `${apiUrl}/api/3/contact/sync`,
      {
        contact: {
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          fieldValues,
        },
      },
      {
        headers: {
          'Api-Token': apiToken,
          'Content-Type': 'application/json',
        },
      }
    );

    const contactId = contactResponse.data.contact.id;

    // Add contact to list
    await axios.post(
      `${apiUrl}/api/3/contactLists`,
      {
        contactList: {
          list: listId,
          contact: contactId,
          status: 1, // Active status
        },
      },
      {
        headers: {
          'Api-Token': apiToken,
          'Content-Type': 'application/json',
        },
      }
    );

    return true;
  } catch (error: any) {
    console.error(`[ActiveCampaign] Error posting ${email}:`, error.response?.data || error.message);
    return false;
  }
}

/**
 * Main prospecting engine execution
 */
export async function runProspectingEngine(
  targetLeads: number = 100,
  triggeredBy: string = 'scheduled'
): Promise<ProspectingResult> {
  const startTime = new Date();
  
  // Get API credentials from environment
  const googleApiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.SEARCH_ENGINE_ID;
  const hunterApiKey = process.env.HUNTER_API_KEY;
  const acApiUrl = process.env.AC_API_URL;
  const acApiToken = process.env.AC_API_TOKEN;
  const acListId = parseInt(process.env.AC_LIST_ID || '4');

  if (!googleApiKey || !searchEngineId || !hunterApiKey || !acApiUrl || !acApiToken) {
    throw new Error('Missing required API credentials in environment variables');
  }

  // Create execution log
  const executionLogId = await createExecutionLog({
    startedAt: startTime,
    status: 'running',
    triggeredBy,
  });

  try {
    // Step 1: Get ICP data
    const icpData = await getAllIcpData();
    if (icpData.length === 0) {
      throw new Error('No ICP data found. Please sync from Google Sheets first.');
    }

    // Create ICP snapshot for tracking
    const icpSnapshot = JSON.stringify(
      icpData.map(icp => ({
        attribute: icp.attribute,
        value: icp.value,
        weight: icp.weight,
      }))
    );

    // Step 2: Build search query
    const searchQuery = buildSearchQuery(icpData);
    console.log('[Prospecting] Search Query:', searchQuery);

    await updateExecutionLog(executionLogId, { searchQuery });

    // Step 3: Search Google for domains
    const domains = await searchGoogle(searchQuery, googleApiKey, searchEngineId, targetLeads);
    console.log(`[Prospecting] Found ${domains.length} domains`);

    await updateExecutionLog(executionLogId, { domainsFound: domains.length });

    // Step 4: Find emails for each domain
    const emailPromises = domains.map(domain => findEmailsForDomain(domain, hunterApiKey, 2));
    const emailResults = await Promise.all(emailPromises);
    incrementHunterSearch(domains.length); // Track Hunter API usage
    
    // Flatten and collect emails with their domains
    const emailDomainPairs: Array<{ emailData: EmailData; domain: string }> = [];
    emailResults.forEach((emails, index) => {
      emails.forEach(emailData => {
        emailDomainPairs.push({ emailData, domain: domains[index] });
      });
    });

    console.log(`[Prospecting] Found ${emailDomainPairs.length} emails`);

    await updateExecutionLog(executionLogId, { emailsFound: emailDomainPairs.length });

    // Step 5: Filter out duplicates and post to ActiveCampaign
    const uniqueLeads: Array<{ emailData: EmailData; domain: string }> = [];
    let duplicatesSkipped = 0;

    for (const { emailData, domain } of emailDomainPairs) {
      const isDuplicate = await isEmailAlreadyProcessed(emailData.email);
      if (isDuplicate) {
        duplicatesSkipped++;
        console.log(`[Prospecting] Skipping duplicate: ${emailData.email}`);
      } else {
        uniqueLeads.push({ emailData, domain });
      }
    }

    console.log(`[Prospecting] Found ${uniqueLeads.length} unique leads (${duplicatesSkipped} duplicates skipped)`);

    // Limit to target
    const leadsToPost = uniqueLeads.slice(0, targetLeads);
    let successCount = 0;

    for (const { emailData, domain } of leadsToPost) {
      const success = await postToActiveCampaign(emailData, domain, acApiUrl, acApiToken, acListId);
      if (success) {
        successCount++;
        // Record the lead in database for deduplication with ICP tracking
        await addLead({
          email: emailData.email,
          domain,
          executionLogId,
          searchQuery,
          icpSnapshot,
        });
      }
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[Prospecting] Posted ${successCount} leads to ActiveCampaign`);

    // Update execution log as completed
    const completedAt = new Date();
    await updateExecutionLog(executionLogId, {
      completedAt,
      status: 'completed',
      leadsPosted: successCount,
    });

    // Send email notification
    await sendDailyReport({
      executionLogId,
      status: 'completed',
      domainsFound: domains.length,
      emailsFound: emailDomainPairs.length,
      leadsPosted: successCount,
      duplicatesSkipped,
      startedAt: startTime,
      completedAt,
    });

    return {
      success: true,
      domainsFound: domains.length,
      emailsFound: emailDomainPairs.length,
      leadsPosted: successCount,
      duplicatesSkipped,
      executionLogId,
    };
  } catch (error: any) {
    console.error('[Prospecting] Error:', error);

    // Update execution log as failed
    const completedAt = new Date();
    await updateExecutionLog(executionLogId, {
      completedAt,
      status: 'failed',
      errorMessage: error.message,
    });

    // Send error notification
    await sendDailyReport({
      executionLogId,
      status: 'failed',
      domainsFound: 0,
      emailsFound: 0,
      leadsPosted: 0,
      error: error.message,
      startedAt: startTime,
      completedAt,
    });

    return {
      success: false,
      domainsFound: 0,
      emailsFound: 0,
      leadsPosted: 0,
      duplicatesSkipped: 0,
      error: error.message,
      executionLogId,
    };
  }
}

/**
 * Sync ICP data from Google Sheets
 */
export async function syncIcpDataFromSheets(sheetId: string): Promise<void> {
  const googleApiKey = process.env.GOOGLE_API_KEY;
  if (!googleApiKey) {
    throw new Error('GOOGLE_API_KEY not found in environment');
  }

  try {
    // Fetch data from Google Sheets API
    const range = 'ICP_Data!A2:C'; // Skip header row
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${googleApiKey}`;
    
    const response = await axios.get(url);
    const rows = response.data.values || [];

    // Transform to ICP data format
    const icpDataItems = rows
      .filter((row: any[]) => row.length >= 3 && row[0] && row[1] && row[2])
      .map((row: any[]) => ({
        attribute: row[0].trim(),
        value: row[1].trim(),
        weight: parseFloat(row[2]).toFixed(2),
      }));

    // Upsert to database
    const { upsertIcpData } = await import('./db');
    await upsertIcpData(icpDataItems);

    console.log(`[Sync] Synced ${icpDataItems.length} ICP data items from Google Sheets`);
  } catch (error: any) {
    console.error('[Sync] Error:', error.response?.data || error.message);
    throw new Error(`Failed to sync from Google Sheets: ${error.message}`);
  }
}
