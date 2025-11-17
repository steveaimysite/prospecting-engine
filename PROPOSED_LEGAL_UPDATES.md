# Proposed Legal Updates for GoAimMySite

**Document Purpose:** Proposed amendments to Terms & Conditions and Privacy Policy to cover the Prospecting Engine's data collection and processing activities.

**Date:** November 16, 2025  
**Prepared by:** Manus AI  
**For:** GoAimMySite / Steve Homan

---

## Executive Summary

The existing GoAimMySite Terms & Conditions and Privacy Policy adequately cover the AI-powered SEO analysis service but **do not explicitly address the Prospecting Engine's automated lead generation activities**. The Prospecting Engine collects and processes personal data (names, email addresses, job titles, LinkedIn profiles) from third-party sources (Hunter.io, Google Search) and posts this data to ActiveCampaign for marketing purposes.

While the current legal framework provides a solid GDPR foundation, **three specific additions are recommended** to ensure full transparency and compliance for the prospecting activities.

---

## Analysis of Current Coverage

### What's Already Covered ✅

The existing legal documents provide strong coverage for:

**Data Protection Framework:**
- UK GDPR/UK DPA 2018 and EU GDPR compliance stated explicitly
- Data Processing Addendum (DPA) included with clear processor/controller roles
- International transfer safeguards (SCCs/IDTA) documented
- Security measures, breach notification, and data subject rights addressed
- Sub-processor disclosure (Wix, Stripe, HubSpot) with change notification process

**GDPR Rights:**
- Access, rectification, erasure, portability, restriction, objection all mentioned
- Right to withdraw consent included
- Right to lodge complaint with ICO or local regulator stated

**Data Retention:**
- General retention policy stated ("as long as necessary for Services, legal compliance, or until you request deletion")
- Deletion on termination covered

### What's Missing for Prospecting Engine ⚠️

The current documents **do not explicitly cover**:

1. **Third-Party Data Collection:** No mention of collecting personal data from external sources (Hunter.io, Google Search) rather than directly from data subjects
2. **Automated Lead Generation:** No disclosure of automated prospecting activities or the specific types of PII collected (names, emails, job titles, LinkedIn profiles)
3. **Marketing Purpose:** While "marketing campaigns" are mentioned, there's no specific disclosure that collected data will be used for outbound prospecting/sales outreach
4. **ActiveCampaign as Sub-Processor:** ActiveCampaign is not listed in the current sub-processor list
5. **Legitimate Interest Basis:** The lawful basis for processing third-party sourced data for marketing purposes needs explicit articulation
6. **Data Subject Rights for Third-Party Sourced Data:** How individuals whose data was collected from Hunter.io can exercise their rights

---

## Recommended Updates

### 1. Privacy Policy - Section 2: Data We Collect

**Current Text:**
> **2. Data We Collect**
> 
> - Account & Billing Data: Name, email, company, billing info (via Stripe).
> - Website Inputs: URLs, metadata, content you submit for analysis.
> - Marketing & Support: Email engagement via HubSpot, support chats/emails.
> - Technical: IP, browser info, cookies.

**Proposed Addition:**

> **2. Data We Collect**
> 
> - Account & Billing Data: Name, email, company, billing info (via Stripe).
> - Website Inputs: URLs, metadata, content you submit for analysis.
> - Marketing & Support: Email engagement via HubSpot, support chats/emails.
> - Technical: IP, browser info, cookies.
> - **Prospecting Data (for business customers using our Prospecting Engine service):** We collect publicly available business contact information from third-party data providers (including Hunter.io and Google Search) to identify potential leads matching your Ideal Customer Profile (ICP). This may include: business email addresses, first and last names, job titles, company domains, department, seniority level, LinkedIn profile URLs, and email verification status. This data is collected on behalf of our business customers and processed in accordance with the Data Processing Addendum.

**Rationale:** This addition provides transparency about third-party data collection while clarifying that it's done on behalf of business customers (controller/processor relationship).

---

### 2. Privacy Policy - Section 3: How We Use Data

**Current Text:**
> **3. How We Use Data**
> 
> - Provide and improve Services (analysis, recommendations).
> - Process payments and manage subscriptions.
> - Send operational emails and—if opted-in—marketing campaigns.
> - Analyse usage (aggregated/anonymised) to improve features.

**Proposed Addition:**

> **3. How We Use Data**
> 
> - Provide and improve Services (analysis, recommendations).
> - Process payments and manage subscriptions.
> - Send operational emails and—if opted-in—marketing campaigns.
> - Analyse usage (aggregated/anonymised) to improve features.
> - **Automated Lead Generation:** For business customers using the Prospecting Engine, we process publicly available contact data to identify and qualify potential leads, post qualified leads to the customer's CRM (ActiveCampaign), track lead engagement metrics, and provide AI-powered recommendations to optimize targeting criteria. We act as a data processor for this activity; our customers are the data controllers responsible for their use of the leads and for providing appropriate privacy notices to contacted individuals.

**Rationale:** Clarifies the purpose of prospecting data processing and establishes the controller/processor relationship explicitly.

---

### 3. Privacy Policy - Section 4: Lawful Bases (UK/EU GDPR)

**Current Text:**
> **4. Lawful Bases (UK/EU GDPR)**
> 
> - Contract performance (service delivery).
> - Legitimate interests (product improvement, limited marketing).
> - Consent (marketing emails where required).
> - Legal obligations (tax/audit).

**Proposed Addition:**

> **4. Lawful Bases (UK/EU GDPR)**
> 
> - Contract performance (service delivery).
> - Legitimate interests (product improvement, limited marketing **; for Prospecting Engine: processing publicly available business contact data for B2B marketing purposes, where we have balanced this interest against the rights and freedoms of data subjects**).
> - Consent (marketing emails where required).
> - Legal obligations (tax/audit).
> 
> **Note on Prospecting Data:** When we collect business contact information from third-party sources for the Prospecting Engine, we rely on our customers' legitimate interests in B2B marketing and sales prospecting. We only process publicly available professional contact information (not personal/consumer data), implement deduplication to avoid repeat contact, honor opt-out requests, and maintain data retention limits (90 days for lead data, 2 years for engagement analytics). **If you are a business professional whose contact information was collected through our Prospecting Engine and you wish to exercise your data subject rights (access, erasure, objection), please contact us at support@goaimysite.com with "Prospecting Data Request" in the subject line.**

**Rationale:** Articulates the legitimate interest basis for B2B prospecting, demonstrates the balancing test, and provides a clear mechanism for data subjects to exercise their rights.

---

### 4. Privacy Policy - Section 5: Sharing

**Current Text:**
> **5. Sharing**
> 
> - Processors: Wix (hosting/forms), Stripe (payments), HubSpot (CRM/emails), analytics providers, IT/security vendors.
> - Legal/Corporate Events: If required by law or during a merger/acquisition.

**Proposed Update:**

> **5. Sharing**
> 
> - Processors: Wix (hosting/forms), Stripe (payments), HubSpot (CRM/emails), **ActiveCampaign (CRM for Prospecting Engine customers), Hunter.io (business contact data provider), Google Custom Search (domain discovery),** analytics providers, IT/security vendors.
> - Legal/Corporate Events: If required by law or during a merger/acquisition.

**Rationale:** Adds the missing sub-processors used by the Prospecting Engine to maintain transparency and DPA compliance.

---

### 5. Privacy Policy - Section 7: Retention

**Current Text:**
> **7. Retention**
> 
> Keep data as long as necessary for Services, legal compliance, or until you request deletion.

**Proposed Addition:**

> **7. Retention**
> 
> Keep data as long as necessary for Services, legal compliance, or until you request deletion. **Specific retention periods for Prospecting Engine data: Lead contact information (email, name, domain) is retained for 90 days from collection date and automatically deleted thereafter unless legal obligations require longer retention. Engagement analytics and ICP performance data (aggregated and pseudonymized) are retained for 2 years to enable AI-powered optimization. Execution logs (non-personal metadata about prospecting runs) are retained for 1 year for operational purposes.**

**Rationale:** Provides specific, transparent retention periods that align with the GDPR principle of storage limitation and the automated cleanup implemented in the Prospecting Engine.

---

### 6. Terms & Conditions - Appendix A (DPA) - Section 3: Sub-Processors

**Current Text:**
> **Sub-Processors:** Wix, Stripe, HubSpot, and infrastructure vendors act as authorised Sub-Processors. A current list is available on request. We will notify you of material Sub-Processor changes and allow objections for legitimate data-protection reasons.

**Proposed Update:**

> **Sub-Processors:** Wix, Stripe, HubSpot, **ActiveCampaign (for Prospecting Engine customers), Hunter.io (business contact data provider), Google LLC (Custom Search API),** and infrastructure vendors act as authorised Sub-Processors. A current list is available on request. We will notify you of material Sub-Processor changes and allow objections for legitimate data-protection reasons.

**Rationale:** Updates the DPA to reflect the actual sub-processors used for prospecting activities.

---

### 7. Terms & Conditions - New Section: Prospecting Engine Service

**Proposed New Section (insert after Section 9: AI/LLM Outputs & Accuracy):**

> **9A) Prospecting Engine Service (Business Customers Only)**
> 
> **Service Description:** The Prospecting Engine is an automated lead generation tool that identifies potential business contacts matching your specified Ideal Customer Profile (ICP) criteria. The Service collects publicly available professional contact information from third-party data sources, validates and enriches this data, and posts qualified leads to your designated CRM system.
> 
> **Data Controller Responsibilities:** When you use the Prospecting Engine, **you act as the data controller** for the lead contact information collected on your behalf. You are responsible for:
> 
> (a) Ensuring you have a lawful basis (typically legitimate interest for B2B marketing) to process the collected contact data for your intended marketing/sales purposes.
> 
> (b) Providing appropriate privacy notices to individuals you contact, including information about how you obtained their contact details and their right to object to processing.
> 
> (c) Honoring opt-out requests and maintaining your own suppression lists.
> 
> (d) Complying with applicable marketing laws (UK PECR, EU ePrivacy Directive, CAN-SPAM, CASL, etc.) when contacting leads.
> 
> (e) Using the collected data only for legitimate business-to-business marketing and sales purposes, not for consumer marketing or other incompatible purposes.
> 
> **Our Role as Processor:** We act as your data processor for Prospecting Engine activities. We will:
> 
> (a) Process lead data only in accordance with your instructions (via your ICP configuration and service settings).
> 
> (b) Implement appropriate technical and organizational measures to protect lead data (encryption, access controls, deduplication, automated retention limits).
> 
> (c) Assist you in responding to data subject rights requests related to prospecting data.
> 
> (d) Notify you of any personal data breaches affecting prospecting data.
> 
> (e) Delete or return prospecting data upon termination of the Service or at your request, subject to legal retention obligations.
> 
> **Data Quality & Accuracy:** Lead data is sourced from third-party providers (primarily Hunter.io) and is provided "as is." While we implement validation and confidence scoring, we do not guarantee the accuracy, completeness, or currency of contact information. You are responsible for verifying data quality and handling any complaints from contacted individuals.
> 
> **Prohibited Uses:** You may not use the Prospecting Engine to: (a) collect consumer (non-business) contact data; (b) target individuals in jurisdictions where B2B marketing is restricted; (c) send unsolicited bulk email (spam); (d) collect data for resale or list-building purposes; or (e) violate any applicable data protection or marketing laws.

**Rationale:** Creates a dedicated section that clearly delineates controller/processor responsibilities, sets expectations for lawful use, and protects GoAimMySite from liability for customers' misuse of the collected data.

---

## Implementation Recommendations

### Priority Level: **Medium-High**

While the existing legal framework provides baseline GDPR compliance, these updates are **strongly recommended** before actively marketing or scaling the Prospecting Engine service. The updates:

1. **Increase transparency** about data collection practices (GDPR Article 13/14 requirement)
2. **Clarify controller/processor roles** to limit liability
3. **Establish clear data subject rights mechanisms** for third-party sourced data
4. **Document legitimate interest balancing** for B2B prospecting
5. **Set customer expectations** about their compliance obligations

### Implementation Steps

1. **Review with Legal Counsel:** Have these proposed changes reviewed by a UK-qualified data protection solicitor or DPO before implementation.

2. **Update Website:** Publish the updated Terms & Conditions and Privacy Policy with a new "Last Updated" date.

3. **Notify Existing Customers:** If you have existing Prospecting Engine customers, send them notice of the material changes (required by Section 22 of your current Terms).

4. **Update Onboarding:** Ensure new Prospecting Engine customers explicitly accept the updated terms and understand their data controller responsibilities.

5. **Internal Training:** Brief your team on the controller/processor distinction and how to handle data subject rights requests related to prospecting data.

6. **Monitor Regulatory Guidance:** Keep informed of evolving guidance from the ICO and EDPB on B2B marketing and legitimate interests.

---

## Alternative Approach: Separate Prospecting Engine Terms

If you prefer to keep the main GoAimMySite legal documents focused on the SEO analysis service, you could create **separate Terms of Service and Privacy Notice specifically for the Prospecting Engine**. This approach:

**Advantages:**
- Cleaner separation between services
- Easier to tailor language for B2B prospecting context
- Simpler to update prospecting terms independently
- May reduce confusion for SEO-only customers

**Disadvantages:**
- More documents to maintain
- Need to ensure consistency between documents
- Customers using both services need to accept multiple terms

If you choose this approach, I can draft standalone Prospecting Engine legal documents.

---

## Data Subject Rights Handling Process

To operationalize the data subject rights mechanism mentioned in the proposed updates, implement this process:

### Incoming Request Handling

1. **Email to support@goaimysite.com** with subject "Prospecting Data Request"
2. **Verify identity:** Request additional information to confirm the requester is the data subject (e.g., confirm email address matches, ask for LinkedIn profile URL to match against records)
3. **Search database:** Query the `leads` table for the requester's email address
4. **Respond within 30 days** (GDPR requirement)

### Request Types

**Access Request (Article 15):**
- Provide copy of stored data: email, name, domain, job title, department, seniority, LinkedIn, confidence score, verification status
- Disclose source: "Collected from Hunter.io on [date]"
- Explain purpose: "Processed for B2B marketing lead generation on behalf of [Customer Name]"
- Provide copy of this privacy notice

**Erasure Request (Article 17 "Right to be Forgotten"):**
- Delete from `leads` table immediately
- Add to suppression list to prevent re-collection
- Notify the customer (controller) that the individual has objected
- Confirm deletion to requester within 30 days

**Objection to Processing (Article 21):**
- Treat same as erasure request
- Add to permanent suppression list
- Notify customer to remove from their CRM and suppression lists

### Suppression List Implementation

To honor erasure/objection requests permanently:

1. Create `suppressed_emails` table in database
2. Check against suppression list before posting any lead to ActiveCampaign
3. Maintain suppression list indefinitely (legal obligation to honor objections)
4. Provide customers with periodic suppression list exports so they can update their own CRMs

---

## Conclusion

The proposed updates provide comprehensive coverage for the Prospecting Engine's data processing activities while maintaining consistency with your existing legal framework. The additions are **minimal, targeted, and proportionate**—they address the specific gaps without requiring a complete rewrite of your legal documents.

**Key Takeaway:** The updates shift from general data protection language to **specific, transparent disclosure** of prospecting activities, which is essential for GDPR compliance and for managing customer expectations about their own compliance obligations as data controllers.

---

## Next Steps

1. **Review** these proposed changes
2. **Consult** with your legal counsel or DPO
3. **Decide** between integrated updates (recommended) or separate prospecting terms
4. **Implement** approved changes on website
5. **Notify** existing customers if material changes affect them
6. **Train** team on new data subject rights handling process

---

**Document prepared by:** Manus AI  
**Date:** November 16, 2025  
**Status:** Draft for Review  
**Contact:** steve@goaimysite.com
