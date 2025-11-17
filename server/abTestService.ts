/**
 * A/B Testing Service
 * Manages A/B tests for ICP variations
 */

import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { abTests, abTestVariants, icpData, InsertAbTest, InsertAbTestVariant } from '../drizzle/schema';

/**
 * Get all A/B tests with their variants
 */
export async function getAllTests() {
  const db = await getDb();
  if (!db) return [];

  const tests = await db.select().from(abTests).orderBy(abTests.createdAt);
  
  // Fetch variants for each test
  const testsWithVariants = await Promise.all(
    tests.map(async (test) => {
      const variants = await db!.select().from(abTestVariants).where(eq(abTestVariants.testId, test.id));
      return { ...test, variants };
    })
  );

  return testsWithVariants;
}

/**
 * Create a new A/B test with two variants
 */
export async function createTest(params: {
  name: string;
  description?: string;
  variantAName: string;
  variantBName: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get current ICP configuration
  const currentIcp = await db.select().from(icpData);
  const icpSnapshot = JSON.stringify(currentIcp);

  // Create the test
  const testResult = await db.insert(abTests).values({
    name: params.name,
    description: params.description,
    status: 'draft',
  });

  const testId = Number((testResult as any).insertId);

  // Create two variants with the same ICP configuration
  await db.insert(abTestVariants).values([
    {
      testId,
      name: params.variantAName,
      icpSnapshot,
    },
    {
      testId,
      name: params.variantBName,
      icpSnapshot,
    },
  ]);

  return { success: true, testId };
}

/**
 * Start an A/B test
 */
export async function startTest(testId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(abTests)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(abTests.id, testId));

  return { success: true };
}

/**
 * Stop an A/B test and determine winner
 */
export async function stopTest(testId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get variants to determine winner
  const variants = await db.select().from(abTestVariants).where(eq(abTestVariants.testId, testId));

  let winningVariantId: number | null = null;

  if (variants.length >= 2) {
    // Winner is the variant with highest average engagement
    const sorted = variants.sort((a, b) => parseFloat(b.avgEngagement || '0') - parseFloat(a.avgEngagement || '0'));
    winningVariantId = sorted[0].id;
  }

  await db
    .update(abTests)
    .set({ 
      status: 'completed', 
      completedAt: new Date(),
      winningVariantId,
    })
    .where(eq(abTests.id, testId));

  return { success: true, winningVariantId };
}

/**
 * Update variant stats after a prospecting run
 */
export async function updateVariantStats(variantId: number, leadsPosted: number, avgEngagement: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const variant = await db.select().from(abTestVariants).where(eq(abTestVariants.id, variantId)).limit(1);
  
  if (variant.length === 0) return;

  const current = variant[0];
  const newExecutionCount = current.executionCount + 1;
  const newTotalLeads = current.totalLeads + leadsPosted;
  
  // Calculate new average engagement (weighted average)
  const currentAvg = parseFloat(current.avgEngagement || '0');
  const newAvg = ((currentAvg * current.executionCount) + avgEngagement) / newExecutionCount;

  await db
    .update(abTestVariants)
    .set({
      executionCount: newExecutionCount,
      totalLeads: newTotalLeads,
      avgEngagement: newAvg.toFixed(2),
    })
    .where(eq(abTestVariants.id, variantId));
}
