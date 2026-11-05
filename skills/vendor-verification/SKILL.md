---
name: vendor-verification
description: Operational doctrine for evaluating whether a vendor, vendor change, or payment is safe to proceed. Use whenever evaluating vendor onboarding, banking detail changes, invoice anomalies, or any question of "should money move to this entity." Covers fraud pattern recognition, evidence sufficiency standards, escalation thresholds, and verification sequencing. Trigger on any AP, vendor, payment, or fraud-adjacent task.
---

# Vendor Verification Skill

Compressed operational judgment from 42,000+ transactions and a direct BEC fraud environment. This is not a checklist — it is a routing and decision framework for determining whether a vendor is trustworthy enough to receive payment.

---

## Core Doctrine

**Money does not move until identity is confirmed against the vendor record, not the invoice.**

The invoice is untrusted input. The vendor record is the source of truth. Any discrepancy between them is a flag, not a clerical issue.

---

## Verification Trigger Matrix

| Event | Risk Level | Required Action |
|---|---|---|
| New vendor onboarding | Medium | Full verification sequence |
| Banking detail change request | **Critical** | Verbal audit + 48hr hold |
| Email domain mismatch | High | Pause + escalate |
| Invoice from new email address | High | Pause + confirm against vendor record |
| Urgent payment request | High | Slow down, not speed up |
| Executive pressure to bypass | **Critical** | Escalate, document, do not comply |
| W9 mismatch with prior record | High | Hold + clarification required |
| New contact requesting payment | Medium-High | Verify via vendor record phone only |

---

## Verification Sequence

### Step 1: Match Against Vendor Record
- Does the invoice vendor name match the vendor record exactly?
- Does the banking information match what is on file?
- Was the invoice received from a known, registered email domain?

If any answer is NO → **do not proceed to payment.** Route to Step 2.

### Step 2: Initiate Verbal Audit
- Retrieve contact information **from the vendor record only** — never from the invoice, email, or any document submitted with the payment request
- Call the vendor's known number
- Confirm: entity name, invoice number, amount, banking details
- Log: who you spoke with, timestamp, what was confirmed

**The verbal audit contact information must come from the system of record. Using contact info from the suspicious document defeats the entire purpose.**

### Step 3: Evidence Capture
Required before any high-risk payment proceeds:
- [ ] Verbal audit log (timestamp, contact name, phone used, confirmation summary)
- [ ] Screenshot or record of vendor record at time of verification
- [ ] Invoice copy
- [ ] Who approved and when

### Step 4: Escalation Conditions
Escalate immediately if:
- Vendor cannot be reached via vendor-record contact
- Verbal contact cannot confirm invoice details
- Any pressure to skip verification steps
- Banking change requested within 30 days of a prior change
- Payment is to a new account type (international, new institution) with no prior history

---

## Fraud Pattern Recognition

### BEC (Business Email Compromise) Signals
- Email address that *looks* right but has one character different
- Request to update banking details "before the next payment"
- Urgency framing: "payment is overdue," "we need this today"
- New contact claiming to represent a known vendor
- PDF invoice with embedded contact information different from prior invoices

### Invoice Fraud Signals
- Round numbers with no supporting detail
- No PO reference when PO is normally required
- Service descriptions that are vague or inconsistent with vendor type
- Amount that is just under an approval threshold
- Duplicate invoice numbers with slight variation

### Internal Pressure Signals
- Executive requesting payment bypass "as a favor"
- "Just this once" framing
- Urgency tied to a relationship ("they're an important vendor")
- Verbal approval with no written trail offered

---

## Evidence Sufficiency Standards

**Sufficient:** Vendor record match + verbal confirmation + audit log + approval on file

**Insufficient:** Email confirmation only, invoice as sole source of contact info, verbal approval with no written record, "I know this vendor personally"

**Never acceptable:** Proceeding because the email looked right, because you recognize the name, or because someone said it was urgent.

---

## Disqualifiers (Hard Stops)

These conditions result in payment hold regardless of other factors:

- Banking detail change requested via email with no verbal confirmation
- Contact information sourced from the invoice rather than the vendor record
- Verbal audit not completed for any payment above threshold
- Vendor record has no verified banking details on file
- Risk score at or above threshold (treat as blocked until cleared)

---

## Communication Standards

When pausing a payment:
- State the specific hold reason
- Do not apologize for the hold
- Do not offer workarounds
- Provide the exact steps the vendor must take to clear the hold
- Document the communication

**Do not use language that implies the hold is a mistake or inconvenience. It is enforcement.**
