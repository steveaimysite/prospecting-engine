# ICP Data Structure Analysis

## Google Sheet Structure
- **Sheet Name**: ICP_Data
- **Columns**: Attribute (A), Value (B), Weight (C)

## Data Rows Identified:

| Row | Attribute | Value | Weight |
|-----|-----------|-------|--------|
| 2 | Industry | SaaS | 1 |
| 3 | Industry | Marketing Agencies | 0.9 |
| 4 | Company_Size | 11-50 | 1 |
| 5 | Company_Size | 51-200 | 0.8 |
| 6 | Region | North America | 0 |
| 7 | Region | UK | 1 |
| 8 | Tech_Stack | HubSpot | 1 |
| 9 | Tech_Stack | Webflow | 0.8 |
| 10 | Role | Founder | 1 |
| 11 | Role | Marketing Director | 0.9 |
| 12 | Industry | E-commerce | 1 |
| 13 | Industry | Creative Industries | 1 |
| 14 | Industry | Health and Wellness | 1 |
| 15 | Industry | Real Estate | 1 |
| 16 | Industry | Education | 0 |
| 17 | Industry | Restaurants and Hospitality | 0 |
| 18 | Industry | Consulting and Legal Services | 1 |
| 19 | Industry | Nonprofits | 0.5 |
| 20 | Industry | Executive Recruitment | 1 |
| 21 | Industry | Startups | 1 |

## Search Query Logic:
- Weight 0 = Exclude from search
- Weight 0.1-0.9 = Include with preference (higher weight = higher priority)
- Weight 1 = Must include

## Attribute Categories:
1. **Industry**: Business sector/vertical
2. **Company_Size**: Employee count ranges
3. **Region**: Geographic location
4. **Tech_Stack**: Technology platforms used
5. **Role**: Job title/position

## Query Construction Strategy:
- Group by attribute type
- For each attribute, include values with weight > 0
- Prioritize weight = 1 values
- Build Boolean search query for Google Custom Search
- Example: "(SaaS OR Marketing Agencies) AND (11-50 OR 51-200) AND UK AND (HubSpot OR Webflow)"
