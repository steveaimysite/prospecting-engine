/**
 * Rate Limit Monitoring Service
 * Tracks API usage and quota limits for Google Custom Search and Hunter.io
 */

interface RateLimitStatus {
  service: string;
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetDate: Date | null;
  status: 'healthy' | 'warning' | 'critical';
}

interface AllRateLimits {
  google: RateLimitStatus;
  hunter: RateLimitStatus;
  lastUpdated: Date;
}

// In-memory storage for rate limit tracking
// In production, this should be persisted to database
let googleSearchCount = 0;
let hunterSearchCount = 0;
let lastResetDate = new Date();

// Reset counters daily at midnight GMT
function checkAndResetCounters(): void {
  const now = new Date();
  const lastReset = new Date(lastResetDate);
  
  // Check if it's a new day
  if (now.getUTCDate() !== lastReset.getUTCDate() || 
      now.getUTCMonth() !== lastReset.getUTCMonth() ||
      now.getUTCFullYear() !== lastReset.getUTCFullYear()) {
    googleSearchCount = 0;
    hunterSearchCount = 0;
    lastResetDate = now;
    console.log('[Rate Limit] Counters reset for new day');
  }
}

/**
 * Increment Google Custom Search counter
 */
export function incrementGoogleSearch(count: number = 1): void {
  checkAndResetCounters();
  googleSearchCount += count;
}

/**
 * Increment Hunter.io search counter
 */
export function incrementHunterSearch(count: number = 1): void {
  checkAndResetCounters();
  hunterSearchCount += count;
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(): AllRateLimits {
  checkAndResetCounters();

  // Google Custom Search limits
  // Free tier: 100 queries/day
  // Paid: Custom based on billing
  const googleLimit = 100; // Adjust based on your plan
  const googleRemaining = Math.max(0, googleLimit - googleSearchCount);
  const googlePercentage = (googleSearchCount / googleLimit) * 100;
  
  let googleStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (googlePercentage >= 90) googleStatus = 'critical';
  else if (googlePercentage >= 70) googleStatus = 'warning';

  // Hunter.io limits
  // Varies by plan - default to 500/month for basic plan
  // This is simplified - actual tracking should be monthly
  const hunterLimit = 500;
  const hunterRemaining = Math.max(0, hunterLimit - hunterSearchCount);
  const hunterPercentage = (hunterSearchCount / hunterLimit) * 100;
  
  let hunterStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (hunterPercentage >= 90) hunterStatus = 'critical';
  else if (hunterPercentage >= 70) hunterStatus = 'warning';

  // Calculate next reset (midnight GMT)
  const nextReset = new Date();
  nextReset.setUTCHours(24, 0, 0, 0);

  return {
    google: {
      service: 'Google Custom Search',
      used: googleSearchCount,
      limit: googleLimit,
      remaining: googleRemaining,
      percentage: googlePercentage,
      resetDate: nextReset,
      status: googleStatus,
    },
    hunter: {
      service: 'Hunter.io',
      used: hunterSearchCount,
      limit: hunterLimit,
      remaining: hunterRemaining,
      percentage: hunterPercentage,
      resetDate: nextReset,
      status: hunterStatus,
    },
    lastUpdated: new Date(),
  };
}

/**
 * Check if we can proceed with prospecting based on rate limits
 */
export function canProceedWithProspecting(targetLeads: number): {
  canProceed: boolean;
  reason?: string;
  limits: AllRateLimits;
} {
  const limits = getRateLimitStatus();

  // Estimate API calls needed
  // Rough estimate: 1 Google search per 10 leads, 1 Hunter call per lead
  const estimatedGoogleCalls = Math.ceil(targetLeads / 10);
  const estimatedHunterCalls = targetLeads * 2; // Up to 2 emails per domain

  if (limits.google.remaining < estimatedGoogleCalls) {
    return {
      canProceed: false,
      reason: `Insufficient Google Custom Search quota. Need ~${estimatedGoogleCalls} calls, have ${limits.google.remaining} remaining.`,
      limits,
    };
  }

  if (limits.hunter.remaining < estimatedHunterCalls) {
    return {
      canProceed: false,
      reason: `Insufficient Hunter.io quota. Need ~${estimatedHunterCalls} calls, have ${limits.hunter.remaining} remaining.`,
      limits,
    };
  }

  return {
    canProceed: true,
    limits,
  };
}
