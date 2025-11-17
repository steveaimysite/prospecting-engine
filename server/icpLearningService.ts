import axios from 'axios';
import { getAllLeads } from './db';

interface ContactEngagement {
  email: string;
  openRate: number;
  clickRate: number;
  engagementScore: number; // Combined metric
}

interface IcpAttributePerformance {
  attribute: string;
  value: string;
  currentWeight: number;
  leadsGenerated: number;
  avgEngagement: number;
  suggestedWeight: number;
  recommendation: 'increase' | 'decrease' | 'maintain';
  reason: string;
}

interface LearningInsights {
  totalLeadsAnalyzed: number;
  avgEngagement: number;
  attributePerformance: IcpAttributePerformance[];
  topPerformers: IcpAttributePerformance[];
  underPerformers: IcpAttributePerformance[];
  recommendations: string[];
}

/**
 * Fetch simplified engagement metrics from ActiveCampaign
 * Uses contact score as a proxy for engagement
 */
export async function fetchContactEngagement(
  acApiUrl: string,
  acApiToken: string,
  emails: string[]
): Promise<Map<string, ContactEngagement>> {
  const engagementMap = new Map<string, ContactEngagement>();

  try {
    // Batch fetch contacts
    for (const email of emails) {
      try {
        const response = await axios.get(
          `${acApiUrl}/api/3/contacts`,
          {
            headers: {
              'Api-Token': acApiToken,
            },
            params: {
              'filters[email]': email,
            },
          }
        );

        const contact = response.data.contacts?.[0];
        if (contact) {
          // Use contact score as engagement proxy (0-100)
          const score = parseInt(contact.score || '0');
          
          // Estimate open/click rates from score
          // This is a simplified approach - actual rates would require campaign data
          const openRate = Math.min(100, score * 0.8);
          const clickRate = Math.min(100, score * 0.3);

          engagementMap.set(email.toLowerCase(), {
            email,
            openRate,
            clickRate,
            engagementScore: score,
          });
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.warn(`[ICP Learning] Failed to fetch engagement for ${email}:`, error.message);
        // Continue with other emails
      }
    }

    return engagementMap;
  } catch (error: any) {
    console.error('[ICP Learning] Failed to fetch engagement data:', error.message);
    throw error;
  }
}

/**
 * Analyze ICP performance with accurate attribution
 */
export async function analyzeIcpPerformance(
  acApiUrl: string,
  acApiToken: string
): Promise<LearningInsights> {
  // Get all leads with ICP snapshots
  const leads = await getAllLeads();
  
  if (leads.length === 0) {
    throw new Error('No leads found for analysis');
  }

  console.log(`[ICP Learning] Analyzing ${leads.length} leads...`);

  // Fetch engagement data
  const emails = leads.map(l => l.email);
  const engagementMap = await fetchContactEngagement(acApiUrl, acApiToken, emails);

  console.log(`[ICP Learning] Retrieved engagement data for ${engagementMap.size} contacts`);

  // Parse ICP snapshots and correlate with engagement
  const attributeStats = new Map<string, {
    totalEngagement: number;
    count: number;
    currentWeight: number;
    attribute: string;
    value: string;
  }>();

  for (const lead of leads) {
    const engagement = engagementMap.get(lead.email.toLowerCase());
    if (!engagement || !lead.icpSnapshot) continue;

    try {
      const icpSnapshot = JSON.parse(lead.icpSnapshot);
      
      for (const icp of icpSnapshot) {
        const key = `${icp.attribute}::${icp.value}`;
        
        if (!attributeStats.has(key)) {
          attributeStats.set(key, {
            totalEngagement: 0,
            count: 0,
            currentWeight: parseFloat(icp.weight),
            attribute: icp.attribute,
            value: icp.value,
          });
        }

        const stats = attributeStats.get(key)!;
        stats.totalEngagement += engagement.engagementScore;
        stats.count += 1;
      }
    } catch (error) {
      console.warn(`[ICP Learning] Failed to parse ICP snapshot for ${lead.email}`);
    }
  }

  // Calculate performance metrics
  const attributePerformance: IcpAttributePerformance[] = [];
  let totalEngagement = 0;
  let totalCount = 0;

  attributeStats.forEach((stats, key) => {
    const avgEngagement = stats.totalEngagement / stats.count;
    totalEngagement += stats.totalEngagement;
    totalCount += stats.count;

    attributePerformance.push({
      attribute: stats.attribute,
      value: stats.value,
      currentWeight: stats.currentWeight,
      leadsGenerated: stats.count,
      avgEngagement,
      suggestedWeight: stats.currentWeight, // Will be calculated below
      recommendation: 'maintain',
      reason: '',
    });
  });

  const overallAvgEngagement = totalEngagement / totalCount;

  // Generate recommendations
  for (const perf of attributePerformance) {
    const performanceRatio = perf.avgEngagement / overallAvgEngagement;

    if (performanceRatio > 1.2) {
      // High performer - increase weight
      perf.suggestedWeight = Math.min(10, perf.currentWeight * 1.3);
      perf.recommendation = 'increase';
      perf.reason = `${(performanceRatio * 100 - 100).toFixed(0)}% above average engagement`;
    } else if (performanceRatio < 0.8) {
      // Low performer - decrease weight
      perf.suggestedWeight = Math.max(0, perf.currentWeight * 0.7);
      perf.recommendation = 'decrease';
      perf.reason = `${(100 - performanceRatio * 100).toFixed(0)}% below average engagement`;
    } else {
      // Average performer - maintain
      perf.suggestedWeight = perf.currentWeight;
      perf.recommendation = 'maintain';
      perf.reason = 'Performing at expected level';
    }

    perf.suggestedWeight = Math.round(perf.suggestedWeight * 10) / 10;
  }

  // Sort by engagement
  attributePerformance.sort((a, b) => b.avgEngagement - a.avgEngagement);

  const topPerformers = attributePerformance
    .filter(p => p.recommendation === 'increase')
    .slice(0, 5);

  const underPerformers = attributePerformance
    .filter(p => p.recommendation === 'decrease')
    .slice(0, 5);

  // Generate actionable recommendations
  const recommendations: string[] = [];

  if (topPerformers.length > 0) {
    const top = topPerformers[0];
    recommendations.push(
      `🎯 Top performer: "${top.attribute}: ${top.value}" (${top.avgEngagement.toFixed(1)} engagement score). ` +
      `Increase weight from ${top.currentWeight} to ${top.suggestedWeight}.`
    );
  }

  if (underPerformers.length > 0) {
    const bottom = underPerformers[0];
    recommendations.push(
      `⚠️ Underperformer: "${bottom.attribute}: ${bottom.value}" (${bottom.avgEngagement.toFixed(1)} engagement score). ` +
      `Decrease weight from ${bottom.currentWeight} to ${bottom.suggestedWeight}.`
    );
  }

  if (overallAvgEngagement < 30) {
    recommendations.push(
      '📉 Overall engagement is low (< 30). Consider revising your ICP criteria or messaging strategy.'
    );
  } else if (overallAvgEngagement > 60) {
    recommendations.push(
      '📈 Excellent engagement (> 60)! Your ICP targeting is working well. Consider scaling up lead volume.'
    );
  }

  return {
    totalLeadsAnalyzed: leads.length,
    avgEngagement: overallAvgEngagement,
    attributePerformance,
    topPerformers,
    underPerformers,
    recommendations,
  };
}

/**
 * Auto-apply ICP optimizations (optional - requires confirmation)
 */
export async function applyIcpOptimizations(
  optimizations: IcpAttributePerformance[]
): Promise<void> {
  // This would update the ICP data in the database
  // Implementation depends on whether you want auto-apply or manual review
  console.log('[ICP Learning] Optimization suggestions generated:', optimizations.length);
  // TODO: Implement auto-update logic if desired
}
