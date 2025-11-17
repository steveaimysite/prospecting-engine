import axios from 'axios';
import { getAllLeads, getAllIcpData } from './db';

interface ContactEngagement {
  email: string;
  openRate: number;
  clickRate: number;
  lastActivity: Date | null;
  tags: string[];
  score: number; // ActiveCampaign contact score
}

interface IcpPerformance {
  attribute: string;
  value: string;
  avgEngagement: number;
  contactCount: number;
  recommendation: 'increase' | 'decrease' | 'maintain';
}

interface EngagementAnalysis {
  totalContacts: number;
  avgOpenRate: number;
  avgClickRate: number;
  topPerformingIcps: IcpPerformance[];
  lowPerformingIcps: IcpPerformance[];
  recommendations: string[];
}

/**
 * Fetch contact engagement data from ActiveCampaign
 */
export async function fetchContactEngagement(
  acApiUrl: string,
  acApiToken: string,
  acListId: string
): Promise<ContactEngagement[]> {
  try {
    const engagements: ContactEngagement[] = [];
    
    // Fetch contacts from the list
    const contactsResponse = await axios.get(
      `${acApiUrl}/api/3/contacts`,
      {
        headers: {
          'Api-Token': acApiToken,
        },
        params: {
          'filters[listid]': acListId,
          limit: 100, // Adjust as needed
        },
      }
    );

    const contacts = contactsResponse.data.contacts || [];

    for (const contact of contacts) {
      // Fetch contact's campaign stats
      const statsResponse = await axios.get(
        `${acApiUrl}/api/3/contacts/${contact.id}/contactAutomations`,
        {
          headers: {
            'Api-Token': acApiToken,
          },
        }
      );

      // Calculate engagement metrics
      const campaigns = statsResponse.data.contactAutomations || [];
      let totalOpens = 0;
      let totalClicks = 0;
      let totalSent = campaigns.length || 1;

      for (const campaign of campaigns) {
        // Note: ActiveCampaign API structure may vary
        // Adjust based on actual API response
        totalOpens += parseInt(campaign.opens || '0');
        totalClicks += parseInt(campaign.clicks || '0');
      }

      engagements.push({
        email: contact.email,
        openRate: totalSent > 0 ? (totalOpens / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicks / totalSent) * 100 : 0,
        lastActivity: contact.udate ? new Date(contact.udate) : null,
        tags: contact.tags || [],
        score: parseInt(contact.score || '0'),
      });

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return engagements;
  } catch (error: any) {
    console.error('[AC Analytics] Failed to fetch engagement data:', error.message);
    throw new Error(`ActiveCampaign API error: ${error.message}`);
  }
}

/**
 * Analyze ICP performance based on engagement data
 */
export async function analyzeIcpPerformance(
  engagements: ContactEngagement[]
): Promise<EngagementAnalysis> {
  try {
    // Get all leads and ICP data
    const leads = await getAllLeads();
    const icpData = await getAllIcpData();

    // Create a map of email to engagement
    const engagementMap = new Map<string, ContactEngagement>();
    engagements.forEach(e => engagementMap.set(e.email.toLowerCase(), e));

    // Calculate overall metrics
    const totalContacts = engagements.length;
    const avgOpenRate = engagements.reduce((sum, e) => sum + e.openRate, 0) / (totalContacts || 1);
    const avgClickRate = engagements.reduce((sum, e) => sum + e.clickRate, 0) / (totalContacts || 1);

    // Group leads by ICP attributes (this is simplified - in reality, you'd need to track
    // which ICP attributes were used to find each lead)
    // For now, we'll analyze based on domain patterns and make recommendations

    const icpPerformance: IcpPerformance[] = [];
    const recommendations: string[] = [];

    // Group ICP data by attribute
    const attributeGroups = icpData.reduce((acc, icp) => {
      if (!acc[icp.attribute]) {
        acc[icp.attribute] = [];
      }
      acc[icp.attribute].push(icp);
      return acc;
    }, {} as Record<string, typeof icpData>);

    // Analyze each attribute group
    for (const [attribute, values] of Object.entries(attributeGroups)) {
      for (const icp of values) {
        // Find leads that might match this ICP value (simplified matching)
        const matchingLeads = leads.filter(lead => {
          const engagement = engagementMap.get(lead.email.toLowerCase());
          return engagement !== undefined;
        });

        if (matchingLeads.length > 0) {
          // Calculate average engagement for this ICP
          const avgEngagement = matchingLeads.reduce((sum, lead) => {
            const engagement = engagementMap.get(lead.email.toLowerCase());
            return sum + (engagement ? (engagement.openRate + engagement.clickRate) / 2 : 0);
          }, 0) / matchingLeads.length;

          // Determine recommendation
          let recommendation: 'increase' | 'decrease' | 'maintain' = 'maintain';
          if (avgEngagement > (avgOpenRate + avgClickRate) / 2 * 1.2) {
            recommendation = 'increase';
          } else if (avgEngagement < (avgOpenRate + avgClickRate) / 2 * 0.8) {
            recommendation = 'decrease';
          }

          icpPerformance.push({
            attribute,
            value: icp.value,
            avgEngagement,
            contactCount: matchingLeads.length,
            recommendation,
          });
        }
      }
    }

    // Sort by engagement
    icpPerformance.sort((a, b) => b.avgEngagement - a.avgEngagement);

    const topPerformingIcps = icpPerformance.slice(0, 5);
    const lowPerformingIcps = icpPerformance.slice(-5).reverse();

    // Generate recommendations
    if (topPerformingIcps.length > 0) {
      recommendations.push(
        `Top performing ICP: "${topPerformingIcps[0].attribute}: ${topPerformingIcps[0].value}" ` +
        `with ${topPerformingIcps[0].avgEngagement.toFixed(1)}% avg engagement. Consider increasing its weight.`
      );
    }

    if (lowPerformingIcps.length > 0) {
      recommendations.push(
        `Low performing ICP: "${lowPerformingIcps[0].attribute}: ${lowPerformingIcps[0].value}" ` +
        `with ${lowPerformingIcps[0].avgEngagement.toFixed(1)}% avg engagement. Consider decreasing its weight.`
      );
    }

    if (avgOpenRate < 20) {
      recommendations.push(
        'Overall open rate is below 20%. Consider refining your ICP criteria to target more engaged audiences.'
      );
    }

    if (avgClickRate < 5) {
      recommendations.push(
        'Overall click rate is below 5%. Review your messaging strategy and ICP targeting.'
      );
    }

    return {
      totalContacts,
      avgOpenRate,
      avgClickRate,
      topPerformingIcps,
      lowPerformingIcps,
      recommendations,
    };
  } catch (error: any) {
    console.error('[ICP Analysis] Failed to analyze performance:', error.message);
    throw error;
  }
}

/**
 * Auto-optimize ICP weights based on engagement analysis
 */
export async function suggestIcpOptimizations(
  analysis: EngagementAnalysis
): Promise<Array<{ attribute: string; value: string; currentWeight: string; suggestedWeight: string; reason: string }>> {
  const icpData = await getAllIcpData();
  const suggestions: Array<{ attribute: string; value: string; currentWeight: string; suggestedWeight: string; reason: string }> = [];

  for (const perf of analysis.topPerformingIcps) {
    const currentIcp = icpData.find(
      icp => icp.attribute === perf.attribute && icp.value === perf.value
    );

    if (currentIcp && perf.recommendation === 'increase') {
      const currentWeight = parseFloat(currentIcp.weight);
      const suggestedWeight = Math.min(10, currentWeight * 1.2).toFixed(1);

      suggestions.push({
        attribute: perf.attribute,
        value: perf.value,
        currentWeight: currentIcp.weight,
        suggestedWeight,
        reason: `High engagement (${perf.avgEngagement.toFixed(1)}%) - increase weight to find more similar leads`,
      });
    }
  }

  for (const perf of analysis.lowPerformingIcps) {
    const currentIcp = icpData.find(
      icp => icp.attribute === perf.attribute && icp.value === perf.value
    );

    if (currentIcp && perf.recommendation === 'decrease') {
      const currentWeight = parseFloat(currentIcp.weight);
      const suggestedWeight = Math.max(0, currentWeight * 0.8).toFixed(1);

      suggestions.push({
        attribute: perf.attribute,
        value: perf.value,
        currentWeight: currentIcp.weight,
        suggestedWeight,
        reason: `Low engagement (${perf.avgEngagement.toFixed(1)}%) - decrease weight to deprioritize`,
      });
    }
  }

  return suggestions;
}

/**
 * Run full engagement analysis and return insights
 */
export async function runEngagementAnalysis(): Promise<{
  analysis: EngagementAnalysis;
  suggestions: Array<{ attribute: string; value: string; currentWeight: string; suggestedWeight: string; reason: string }>;
}> {
  const acApiUrl = process.env.AC_API_URL;
  const acApiToken = process.env.AC_API_TOKEN;
  const acListId = process.env.AC_LIST_ID;

  if (!acApiUrl || !acApiToken || !acListId) {
    throw new Error('ActiveCampaign credentials not configured');
  }

  console.log('[Engagement Analysis] Fetching contact engagement data...');
  const engagements = await fetchContactEngagement(acApiUrl, acApiToken, acListId);

  console.log('[Engagement Analysis] Analyzing ICP performance...');
  const analysis = await analyzeIcpPerformance(engagements);

  console.log('[Engagement Analysis] Generating optimization suggestions...');
  const suggestions = await suggestIcpOptimizations(analysis);

  return { analysis, suggestions };
}
