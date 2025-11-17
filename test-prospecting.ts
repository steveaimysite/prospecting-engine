import { runProspectingEngine } from './server/prospectingEngine';

async function test() {
  try {
    console.log('Starting prospecting test with 5 lead target...');
    const result = await runProspectingEngine(5); // Small test batch
    console.log('\n✓ Prospecting completed!');
    console.log('Results:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('\n✗ Prospecting failed:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

test();
