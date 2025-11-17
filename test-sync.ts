import { syncIcpDataFromSheets } from './prospecting-engine/server/prospectingEngine';

const SHEET_ID = "1EHMijNDykLjmRLmU5MCxik6Hhr9Kpf2m8cRR-U-99P8";

async function test() {
  try {
    console.log('Starting Google Sheets sync...');
    await syncIcpDataFromSheets(SHEET_ID);
    console.log('✓ Sync completed successfully');
  } catch (error: any) {
    console.error('✗ Sync failed:', error.message);
    console.error('Full error:', error);
  }
  process.exit(0);
}

test();
