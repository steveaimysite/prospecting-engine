# GDPR Compliance Documentation

## Prospecting Engine - Data Protection & Privacy

This document outlines how the Prospecting Engine complies with the General Data Protection Regulation (GDPR) and other international data protection laws.

---

## Table of Contents

1. [Overview](#overview)
2. [Data We Process](#data-we-process)
3. [Legal Basis for Processing](#legal-basis-for-processing)
4. [Data Subject Rights](#data-subject-rights)
5. [Technical & Organizational Measures](#technical--organizational-measures)
6. [Data Retention & Deletion](#data-retention--deletion)
7. [Data Transfers](#data-transfers)
8. [Breach Notification](#breach-notification)
9. [Compliance Checklist](#compliance-checklist)

---

## Overview

The Prospecting Engine is designed with privacy by design and by default principles. The application processes personal data for B2B lead generation purposes and implements comprehensive safeguards to protect data subjects' rights.

**Data Controller**: The organization deploying this application (you)  
**Data Processor**: Third-party services (ActiveCampaign, Hunter.io, Google)  
**Data Protection Officer**: Should be designated by the controller

---

## Data We Process

### Personal Data Categories

The application processes the following categories of personal data:

| Data Category | Data Fields | Purpose | Source |
|---------------|-------------|---------|--------|
| **Contact Information** | Email address, First name, Last name | Lead generation and outreach | Hunter.io API |
| **Professional Information** | Company domain, Job title (if available) | B2B targeting | Google Custom Search, Hunter.io |
| **Technical Data** | IP address (audit logs only) | Security and audit trail | Application logs |
| **Engagement Data** | ActiveCampaign contact score, Open rates, Click rates | ICP optimization | ActiveCampaign API |

### Special Categories of Data

The application **does not process** special categories of personal data as defined in GDPR Article 9 (racial origin, political opinions, religious beliefs, health data, etc.).

---

## Legal Basis for Processing

### Legitimate Interests (Article 6(1)(f))

The primary legal basis for processing is **legitimate interests**:

**Our Legitimate Interest**: B2B lead generation and business development

**Balancing Test**:
- **Necessity**: Processing is necessary to identify and contact potential business clients
- **Proportionality**: Only minimal data required for contact is collected
- **Data Subject Expectations**: B2B professionals reasonably expect their publicly available business contact information may be used for business outreach
- **Safeguards**: Right to object, opt-out mechanisms, data minimization

**Alternative Legal Bases** (depending on jurisdiction and use case):
- **Consent** (Article 6(1)(a)): If explicitly obtained before processing
- **Contract** (Article 6(1)(b)): If processing is necessary for pre-contractual steps

---

## Data Subject Rights

The application implements technical measures to facilitate the exercise of data subject rights under GDPR Chapter III.

### Right of Access (Article 15)

**Implementation**: Subject Access Request (SAR) endpoint

**How to Exercise**:
1. Navigate to Settings > GDPR Compliance
2. Enter email address
3. Click "Export My Data"
4. Receive JSON export with all personal data

**API Endpoint**: `/api/trpc/gdpr.exportData`

**Response Time**: Immediate (automated)

---

### Right to Erasure / Right to be Forgotten (Article 17)

**Implementation**: Data deletion endpoint with audit logging

**How to Exercise**:
1. Navigate to Settings > GDPR Compliance
2. Enter email address
3. Click "Delete My Data"
4. Confirm deletion

**What Gets Deleted**:
- Email address from leads table
- Associated execution logs (optional, configurable)
- All personally identifiable information

**What Is Retained**:
- Anonymized statistics (aggregated counts)
- Audit log of the deletion request (legal requirement)

**API Endpoint**: `/api/trpc/gdpr.deleteData`

**Response Time**: Immediate (automated)

---

### Right to Rectification (Article 16)

**Implementation**: Data is sourced from public databases (Hunter.io) and ActiveCampaign

**How to Exercise**:
- For leads in ActiveCampaign: Update directly in ActiveCampaign interface
- For leads in our database: Contact data controller to manually update

**Note**: Our database is a cache; corrections should be made at the source (ActiveCampaign).

---

### Right to Restriction of Processing (Article 18)

**Implementation**: Opt-out mechanism via ActiveCampaign

**How to Exercise**:
- Unsubscribe from emails sent via ActiveCampaign
- ActiveCampaign automatically marks contact as "unsubscribed"
- Future prospecting runs will not re-add unsubscribed contacts (if configured)

---

### Right to Data Portability (Article 20)

**Implementation**: Export functionality provides data in machine-readable JSON format

**Covered by**: Subject Access Request endpoint (same as Right of Access)

---

### Right to Object (Article 21)

**Implementation**: Opt-out via ActiveCampaign unsubscribe + deletion request

**How to Exercise**:
1. Unsubscribe from ActiveCampaign emails
2. Request deletion via GDPR endpoint (see Right to Erasure above)

---

## Technical & Organizational Measures

### Security Measures (Article 32)

#### Encryption

**Data in Transit**:
- All API communications use HTTPS/TLS 1.2+
- Railway.app enforces HTTPS by default
- No unencrypted HTTP traffic

**Data at Rest**:
- Railway MySQL databases are encrypted at rest
- Encryption standard: AES-256
- Managed by Railway infrastructure

#### Access Control

**Authentication**:
- Manus OAuth for user authentication
- Session-based authentication with secure cookies
- HttpOnly and Secure cookie flags enabled

**Authorization**:
- Role-based access control (admin/user roles)
- Protected procedures require authentication
- API keys stored as environment variables (not in code)

**Audit Logging**:
- All data operations logged to `audit_logs` table
- Logs include: action, user, IP address, timestamp
- Logs retained for 7 years (legal requirement)

#### Data Minimization

**Principles Applied**:
- Only email, name, and domain collected
- No unnecessary data fields
- No tracking cookies or analytics on user behavior
- No third-party scripts on frontend

#### Pseudonymization

**Implementation**:
- User IDs are numeric, not email-based
- Execution logs use IDs to reference users
- Aggregated statistics do not include PII

---

### Organizational Measures

#### Staff Training

**Recommendation**: Train staff on:
- GDPR principles and data subject rights
- How to handle data access/deletion requests
- Incident response procedures

#### Data Processing Agreements (DPAs)

**Required DPAs** with third-party processors:
- **ActiveCampaign**: [Sign DPA](https://www.activecampaign.com/legal/dpa)
- **Hunter.io**: [Sign DPA](https://hunter.io/gdpr)
- **Railway.app**: [Review Terms](https://railway.app/legal/terms)
- **Resend**: [Review DPA](https://resend.com/legal/dpa)

**Action Item**: Ensure all DPAs are signed and stored securely.

---

## Data Retention & Deletion

### Retention Periods

The application implements automated data retention policies:

| Data Type | Retention Period | Legal Basis |
|-----------|------------------|-------------|
| **Leads** | 2 years | Business records retention |
| **Execution Logs** | 1 year | Operational necessity |
| **Audit Logs** | 7 years | Legal compliance (GDPR Article 30) |

### Automated Cleanup

**Schedule**: Daily at 2:00 AM GMT

**Process**:
1. Identify records older than retention period
2. Delete records from database
3. Log cleanup action in audit logs
4. Update `lastCleanupAt` timestamp

**Manual Trigger**: Available via admin panel or API endpoint

**Verification**:
```sql
SELECT * FROM data_retention_policy;
```

---

### Deletion Procedures

#### Automated Deletion

**Trigger**: Retention period expires

**Process**: Automated via cron job (see above)

#### Manual Deletion

**Trigger**: Data subject request (Right to be Forgotten)

**Process**:
1. User submits deletion request via GDPR endpoint
2. System validates email exists in database
3. System deletes all associated records
4. System logs deletion in audit logs
5. System confirms deletion to requester

**Audit Trail**: All deletions are logged with:
- Email address deleted
- Timestamp
- User who initiated deletion (if admin-triggered)
- IP address of requester

---

## Data Transfers

### Third-Party Services

The application transfers personal data to the following third-party services:

#### ActiveCampaign

**Location**: United States (US)  
**Transfer Mechanism**: Standard Contractual Clauses (SCCs)  
**Purpose**: Email marketing and CRM  
**Data Transferred**: Email, name, domain  
**Privacy Policy**: https://www.activecampaign.com/privacy-policy

#### Hunter.io

**Location**: France (EU)  
**Transfer Mechanism**: GDPR-compliant (EU-based)  
**Purpose**: Email discovery  
**Data Transferred**: Domain names (input), email addresses (output)  
**Privacy Policy**: https://hunter.io/privacy-policy

#### Google Custom Search

**Location**: United States (US)  
**Transfer Mechanism**: Google's GDPR commitments  
**Purpose**: Domain discovery  
**Data Transferred**: Search queries (no PII)  
**Privacy Policy**: https://policies.google.com/privacy

#### Railway.app (Hosting)

**Location**: United States (US)  
**Transfer Mechanism**: Standard Contractual Clauses  
**Purpose**: Application hosting and database  
**Data Transferred**: All application data  
**Privacy Policy**: https://railway.app/legal/privacy

#### Resend (Email Service)

**Location**: United States (US)  
**Transfer Mechanism**: Standard Contractual Clauses  
**Purpose**: Transactional emails  
**Data Transferred**: Notification recipient emails  
**Privacy Policy**: https://resend.com/legal/privacy

---

### Cross-Border Transfers

**EU to US Transfers**: Rely on Standard Contractual Clauses (SCCs) approved by the European Commission

**Adequacy Decisions**: None of the services are located in countries with adequacy decisions (as of 2025)

**Additional Safeguards**:
- Encryption in transit and at rest
- Access controls and authentication
- Regular security audits (by third-party providers)

---

## Breach Notification

### Breach Detection

**Monitoring**:
- Railway.app provides infrastructure monitoring
- Application logs track unauthorized access attempts
- Audit logs record all data operations

**Indicators of Breach**:
- Unauthorized API access
- Unusual data export volumes
- Failed authentication attempts
- Database access from unknown IPs

---

### Breach Response Procedure

**Within 72 Hours of Discovery**:

1. **Assess the Breach**:
   - Determine scope (how many data subjects affected)
   - Identify data categories compromised
   - Assess risk to data subjects

2. **Contain the Breach**:
   - Revoke compromised API keys
   - Reset authentication tokens
   - Block unauthorized access

3. **Notify Supervisory Authority** (if required):
   - Contact your local Data Protection Authority
   - Provide breach details, affected data subjects, mitigation steps

4. **Notify Data Subjects** (if high risk):
   - Send notification emails to affected individuals
   - Explain nature of breach and steps taken
   - Provide guidance on protective measures

5. **Document the Breach**:
   - Record in breach register
   - Include: date, scope, actions taken, notifications sent

---

### Breach Notification Template

**To Data Subjects**:

```
Subject: Important Security Notice - Data Breach Notification

Dear [Name],

We are writing to inform you of a security incident that may have affected your personal data.

What Happened:
[Brief description of the breach]

What Data Was Affected:
[List of data categories: email, name, etc.]

What We Are Doing:
[Steps taken to contain and remediate]

What You Can Do:
[Recommended actions for data subjects]

Contact Us:
[Contact information for questions]

We sincerely apologize for this incident and are committed to protecting your data.

[Your Organization]
```

---

## Compliance Checklist

Use this checklist to ensure ongoing GDPR compliance:

### Initial Setup

- [ ] Designate a Data Protection Officer (if required)
- [ ] Sign Data Processing Agreements with all third-party processors
- [ ] Configure data retention policies in application
- [ ] Add privacy policy to website
- [ ] Implement cookie consent (if using analytics)
- [ ] Train staff on GDPR procedures

### Ongoing Compliance

- [ ] Review data retention policies quarterly
- [ ] Audit third-party processors annually
- [ ] Update privacy policy when processing changes
- [ ] Respond to data subject requests within 30 days
- [ ] Maintain breach register
- [ ] Conduct Data Protection Impact Assessments (DPIAs) for high-risk processing

### Technical Compliance

- [x] Encryption in transit (HTTPS)
- [x] Encryption at rest (Railway MySQL)
- [x] Access controls and authentication
- [x] Audit logging for all data operations
- [x] Automated data retention and deletion
- [x] Subject Access Request (SAR) endpoint
- [x] Right to Erasure endpoint
- [x] Data export functionality

---

## Privacy Policy Template

**Required Disclosures** (to be added to your website):

### What Data We Collect

We collect business contact information (email addresses, names, company domains) from publicly available sources for B2B lead generation purposes.

### How We Use Your Data

We use your data to contact you about potential business opportunities. We may send you marketing emails via ActiveCampaign.

### Legal Basis

We process your data based on our legitimate interests in business development. You have the right to object at any time.

### Your Rights

You have the right to:
- Access your data
- Correct inaccurate data
- Delete your data
- Object to processing
- Restrict processing
- Data portability

To exercise these rights, contact [your email] or use our GDPR self-service portal.

### Data Retention

We retain your data for up to 2 years. You can request earlier deletion at any time.

### Third-Party Services

We share your data with:
- ActiveCampaign (email marketing)
- Hunter.io (email discovery)

These services are GDPR-compliant and have signed Data Processing Agreements.

### Contact Us

For privacy questions, contact:  
[Your Organization]  
[Email Address]  
[Physical Address]

---

## Conclusion

The Prospecting Engine is designed to comply with GDPR and international data protection laws. By implementing technical safeguards, respecting data subject rights, and maintaining transparent data practices, the application minimizes privacy risks while enabling effective B2B lead generation.

**Disclaimer**: This documentation provides guidance but does not constitute legal advice. Consult with a qualified data protection lawyer to ensure full compliance with applicable laws in your jurisdiction.

---

**Last Updated**: January 2025  
**Next Review**: July 2025
