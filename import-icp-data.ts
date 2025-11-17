import { drizzle } from "drizzle-orm/mysql2";
import { icpData } from "./drizzle/schema";
import * as fs from "fs";

const db = drizzle(process.env.DATABASE_URL!);

const csvData = `Attribute,Value,Weight
Industry,SaaS,1
Industry,Marketing Agencies,0.9
Company_Size,11-50,1
Company_Size,51-200,0.8
Region,North America,0
Region,UK,1
Tech_Stack,HubSpot,1
Tech_Stack,Webflow,0.8
Role,Founder,1
Role,Marketing Director,0.9
Industry,E-commerce,1
Industry,Creative Industries,1
Industry,Health and Wellness,1
Industry,Real Estate,1
Industry,Education,0
Industry,Restaurants and Hospitality,0
Industry,Consulting and Legal Services,1
Industry,Nonprofits,0.5
Industry,Executive Recruitment,1
Industry,Startups,1`;

async function importData() {
  try {
    const lines = csvData.split('\n').slice(1); // Skip header
    const items = lines.map(line => {
      const [attribute, value, weight] = line.split(',');
      return {
        attribute: attribute.trim(),
        value: value.trim(),
        weight: weight.trim(),
      };
    });

    console.log(`Importing ${items.length} ICP data items...`);

    for (const item of items) {
      await db.insert(icpData).values(item).onDuplicateKeyUpdate({
        set: { weight: item.weight }
      });
    }

    console.log('✓ ICP data imported successfully');
  } catch (error: any) {
    console.error('✗ Import failed:', error.message);
  }
  process.exit(0);
}

importData();
