import axios from 'axios';

const HUNTER_API_KEY = '0709057b74ecfdf2eadd6ad42f2c9ee625830a94';
const TEST_DOMAIN = 'stripe.com'; // Test with a known company

async function testHunterResponse() {
  try {
    console.log(`Testing Hunter.io API for domain: ${TEST_DOMAIN}\n`);
    
    const response = await axios.get('https://api.hunter.io/v2/domain-search', {
      params: {
        domain: TEST_DOMAIN,
        api_key: HUNTER_API_KEY,
        limit: 2,
      },
    });

    console.log('Full Hunter.io Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n\n=== Available Fields Per Email ===\n');
    if (response.data.data?.emails && response.data.data.emails.length > 0) {
      const firstEmail = response.data.data.emails[0];
      console.log('Fields in first email result:');
      Object.keys(firstEmail).forEach(key => {
        console.log(`  - ${key}: ${JSON.stringify(firstEmail[key])}`);
      });
    } else {
      console.log('No emails found for this domain');
    }
    
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testHunterResponse();
