# ActiveCampaign Field Mapping

**Prospecting Engine** | **Version 1.0** | **Last Updated: November 16, 2025**

---

## Overview

This document describes how data from Hunter.io is mapped to ActiveCampaign contact fields when leads are posted to the Prospects list (ID 4).

---

## Guaranteed Fields

These fields are **always populated** for every lead posted to ActiveCampaign:

| Hunter.io Field | ActiveCampaign Field | Field ID | Description |
|----------------|---------------------|----------|-------------|
| `value` | **Email** | Standard | Contact email address (required) |
| `first_name` | **First Name** | Standard | Contact's first name |
| `last_name` | **Last Name** | Standard | Contact's last name |
| Domain (from search) | **Domain** | 6 | Company domain (e.g., stripe.com) |

---

## Optional Fields

These fields are populated **when available** from Hunter.io data:

| Hunter.io Field | ActiveCampaign Field | Field ID | Description |
|----------------|---------------------|----------|-------------|
| `position` | **Job Title** | 11 | Contact's job title/position |
| `department` | **Department** | 12 | Department (marketing, sales, management, etc.) |
| `seniority` | **Seniority** | 13 | Seniority level (executive, senior, junior) |
| `linkedin` | **LinkedIn Profile** | 14 | Full LinkedIn profile URL |
| `confidence` | **Email Confidence Score** | 17 | Hunter.io confidence score (0-100) |
| `verification.status` | **Email Verification Status** | 18 | Email verification status (valid, invalid, accept_all) |

---

## Field Availability

Based on Hunter.io's API response patterns:

**High Availability (80%+ of leads):**
- First Name
- Last Name
- Job Title
- Domain

**Medium Availability (50-80% of leads):**
- Department
- Seniority
- Email Confidence Score
- Email Verification Status

**Low Availability (20-50% of leads):**
- LinkedIn Profile

**Not Currently Mapped:**
- Twitter Handle (Field ID 15) - Hunter.io rarely provides this
- Phone Number - Hunter.io rarely provides this
- Company Name - Could be derived from domain but not currently mapped

---

## Example Mapping

Here's an example of how a Hunter.io response is mapped to ActiveCampaign:

**Hunter.io Response:**
```json
{
  "value": "joel@stripe.com",
  "first_name": "Joel",
  "last_name": "Karacozoff",
  "position": "Partnerships Director",
  "seniority": "executive",
  "department": "management",
  "linkedin": "https://www.linkedin.com/in/joelkaracozoff",
  "confidence": 94,
  "verification": {
    "status": "valid"
  }
}
```

**ActiveCampaign Contact:**
- **Email:** joel@stripe.com
- **First Name:** Joel
- **Last Name:** Karacozoff
- **Domain:** stripe.com
- **Job Title:** Partnerships Director
- **Seniority:** executive
- **Department:** management
- **LinkedIn Profile:** https://www.linkedin.com/in/joelkaracozoff
- **Email Confidence Score:** 94
- **Email Verification Status:** valid

---

## Missing Fields

If a field is not available from Hunter.io, it will be left empty in ActiveCampaign. The system does not attempt to fill in missing data or use placeholder values.

---

## Custom Field Management

To add or modify custom fields in ActiveCampaign:

1. Log in to your ActiveCampaign account
2. Navigate to **Settings** → **Manage Fields**
3. Create or edit custom fields as needed
4. Note the **Field ID** (visible in the URL when editing a field)
5. Update the field mapping in `server/prospectingEngine.ts` if needed

---

## Troubleshooting

**Problem:** Fields appear empty in ActiveCampaign even though Hunter.io found the data.

**Solution:** Check that the field IDs in the code match your ActiveCampaign field IDs. Run the test script to verify:

```bash
pnpm exec tsx test-ac-fields.ts
```

**Problem:** "Preferred Language" field is being populated instead of "Domain".

**Solution:** This was the original bug. It has been fixed—Domain now correctly maps to Field ID 6. If you still see this issue, verify that Field ID 6 exists in your ActiveCampaign account and is named "Domain".

---

## Future Enhancements

Potential improvements to field mapping:

1. **Company Name Extraction:** Parse the domain to extract a human-readable company name (e.g., "stripe.com" → "Stripe")
2. **Phone Number Enrichment:** Use a secondary API to find phone numbers when Hunter.io doesn't provide them
3. **Social Media Profiles:** Add Twitter/X handle mapping when available from Hunter.io
4. **Custom Field Auto-Creation:** Automatically create missing custom fields in ActiveCampaign via API

---

**End of Field Mapping Documentation**
