import axios from 'axios';

const AC_API_URL = 'https://stevehoman2.api-us1.com';
const AC_API_TOKEN = '10ca4b4414320efdf4b92751ef46306f7322ceab56650a4a1da595deaaf665ede727df77';

async function listActiveCampaignFields() {
  try {
    console.log('Fetching ActiveCampaign custom fields...\n');
    
    const response = await axios.get(`${AC_API_URL}/api/3/fields`, {
      headers: {
        'Api-Token': AC_API_TOKEN,
      },
    });

    console.log('Available Custom Fields in ActiveCampaign:');
    console.log('==========================================\n');
    
    if (response.data.fields && response.data.fields.length > 0) {
      response.data.fields.forEach((field: any) => {
        console.log(`Field ID: ${field.id}`);
        console.log(`  Title: ${field.title}`);
        console.log(`  Type: ${field.type}`);
        console.log(`  Personalization Tag: %${field.perstag}%`);
        console.log('');
      });
      
      console.log(`\nTotal fields: ${response.data.fields.length}`);
    } else {
      console.log('No custom fields found');
    }
    
    console.log('\n\nStandard Contact Fields (always available):');
    console.log('- email (required)');
    console.log('- firstName');
    console.log('- lastName');
    console.log('- phone');
    
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

listActiveCampaignFields();
