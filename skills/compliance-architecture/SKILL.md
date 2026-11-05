---
name: compliance-architecture
description: Framework for designing systems so that compliance requirements are met through architecture, not workarounds — particularly around audit trails, regulatory scope management, data handling, and enforcement posture. Use when making architectural decisions that have compliance implications, when designing audit trail systems, when evaluating whether a product feature changes regulatory exposure, or when explaining compliance posture to customers or auditors. Trigger on audit trail design, regulatory scope questions, SOC 2, PCI, HIPAA, data handling, or any "will this hold up to scrutiny" architectural question.
---

# Compliance Architecture Skill

Compliance built on top of a system that wasn't designed for it is fragile, expensive, and full of gaps. Compliance built into the architecture of a system is durable, auditable, and often invisible to the operator because it doesn't require them to do anything extra.

**The goal is not to comply. The goal is to build systems where compliant behavior is the path of least resistance.**

---

## Architecture-First Compliance Principles

### Enforcement in the Backend, Always
Compliance rules must be enforced server-side, not client-side. A client-side validation can be bypassed by anyone with browser developer tools. A backend enforcement cannot.

This applies to:
- Approval requirements (backend verifies authorization before processing, not just UI gates)
- Threshold checks (backend rejects out-of-range values, not just flags them in UI)
- Audit logging (backend writes the log, not the client)
- Soft delete enforcement (backend prevents hard deletes, not just UI)

### Immutable Audit Trail
The audit trail is the compliance artifact. It must be:
- Append-only (no updates or deletes)
- Server-timestamped (not client-reported)
- Comprehensive (every state change, every approval, every exception)
- Linked (every log entry linked to the entity it describes)

An audit trail that can be edited is not an audit trail — it is a document.

### Soft Delete Only
Records in compliance-sensitive systems are never hard-deleted. Deletion events are logged. The record of "this was removed" must be preserved even if the content is suppressed.

This protects against:
- Accidental data loss
- Fraudulent record deletion
- Audit findings from missing records

### Decryption Failure = HOLD
When a system cannot verify or decrypt a critical piece of information, the correct behavior is to pause, not to proceed. Proceeding on a decryption failure means proceeding without the verification that justifies the action.

This principle prevents silent failures from becoming compliance events.

---

## Regulatory Scope Management

### The Scope Map
Before building any feature, map its regulatory implications:

| Feature | Potential Regulatory Trigger | Mitigation |
|---|---|---|
| Payment initiation | PCI DSS, money transmitter license | Keep product in verification layer only |
| Card data storage | PCI DSS Level 1 | Tokenize via payment processor, never store raw |
| Healthcare data | HIPAA | Separate data handling, BAA required |
| Biometric data | State biometric privacy laws (IL BIPA, TX CUBI) | Avoid unless core to product; explicit consent required |
| Financial advice | SEC regulations | Frame as information, not advice |
| Custody of funds | Banking regulations | Use regulated banking partners, not direct custody |

**The goal is minimum regulatory footprint.** Each regulatory regime you operate under adds audit burden, legal exposure, and operational complexity.

### PCI Scope Architecture
The most important compliance boundary for payment-adjacent products:

**In scope**: Systems that store, process, or transmit cardholder data
**Out of scope**: Systems that verify payment intent but do not touch cardholder data

To stay out of PCI scope:
- Never store, transmit, or process card numbers
- Use tokenized references from a PCI-compliant payment processor
- Ensure payment execution happens downstream, in the banking system
- Document the data flow to demonstrate what the product never touches

**SYNCD AP's out-of-PCI-scope posture is architectural, not incidental.** By keeping payment execution downstream, the product's entire compliance posture changes.

### SOC 2 Design Principles
SOC 2 Trust Service Criteria apply to security, availability, processing integrity, confidentiality, and privacy. Design to these from the start:

- **Security**: Access controls, encryption at rest and in transit, audit logging
- **Availability**: Uptime commitments, disaster recovery, incident response
- **Processing integrity**: System processes data accurately and completely
- **Confidentiality**: Sensitive data handling, access limitations
- **Privacy**: Data collection minimization, retention policies, deletion capability

---

## Audit Trail Architecture

### What Needs to Be Logged
Every consequential state change. Specifically:
- Entity creation (vendor, invoice, payment, user)
- Status changes (pending → approved, active → suspended)
- Approval events (who approved, when, from what state)
- Exception events (holds, overrides, escalations)
- Authentication events (login, logout, failed attempts, permission changes)
- Data changes (field updates, document replacements)
- Deletion events (even soft deletes)
- System actions (automated rules that fired, cron jobs that ran)

### Log Entry Schema (Minimum)
```
{
  id: uuid,
  timestamp: ISO8601 UTC (server-generated),
  actor_type: "user" | "system" | "integration",
  actor_id: uuid or system identifier,
  action: string (specific, not generic),
  entity_type: string,
  entity_id: uuid,
  before_state: JSON snapshot (for updates),
  after_state: JSON snapshot (for updates),
  metadata: { ip_address, session_id, request_id }
}
```

### Log Retention
- Operational logs: minimum 90 days in hot storage
- Compliance logs: minimum 7 years (matches IRS audit lookback in most contexts)
- Security logs: minimum 1 year
- Retention policy must be documented and enforced, not just intended

---

## Separation of Concerns in Compliance Design

### Who Can Do What
Access control is a compliance requirement, not just a convenience.

Define roles by what they can and cannot do:
- **Operator**: Can capture, can flag, cannot approve above threshold
- **Approver**: Can approve within their authorization level
- **Admin**: Can configure rules, cannot override audit trails
- **Auditor**: Read-only access to all records, cannot modify anything

No role should have both approval authority and the ability to modify audit logs.

### Four-Eyes Principle
For high-risk actions, two independent actors must review before the action proceeds. This is not optional for:
- Wires above threshold
- Banking detail changes
- Threshold overrides
- Vendor status changes that affect payment eligibility

---

## Compliance as a Feature

Compliance architecture is not overhead — it is a differentiator when selling to customers who have been burned.

**How to communicate compliance architecture as value:**
- "Our audit trail is immutable — you can show it to an auditor without concern."
- "We don't execute payments. We enforce the process that precedes payment. Your bank executes."
- "Every exception is logged, owned, and requires a release condition. Nothing disappears."
- "We were designed for the post-incident review, not built to pass it."

The customer who has survived an audit, a fraud event, or a compliance finding knows exactly what this means. That customer is your buyer.

---

## The Burden Shift Doctrine

When a system enforces verification correctly and the fraud happens anyway — because someone bypassed the system — the burden of responsibility shifts to the person who bypassed it.

This is not just ethical framing. It has legal implications.

A system that documented the flag, presented the warning, required the override, and logged the override actor — that system has done its job. The actor who overrode it owns the consequence.

**Design systems so that the enforcement record is clear before the decision point, not discovered after the event.**
