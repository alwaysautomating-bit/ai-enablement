---
name: slack-ops
description: Convert Slack conversations into operational context, timelines, evidence, and organizational memory. Use after searching Slack when the goal is understanding what happened rather than simply retrieving messages.
---

# Slack Operational Context

This skill transforms Slack conversations into structured operational context.

Slack is **not** the system of record.

Slack is an operational context source that captures decisions, clarifications, exceptions, discussions, early warning signals, and institutional knowledge that often never reaches formal systems.

Its purpose is to enrich operational understanding while preserving evidence provenance and respecting permissions.

## When to Use

Apply this skill after relevant Slack messages have been located.

Use it when a user asks questions such as:

* Why did this happen?
* What led to this decision?
* What changed?
* Who approved this?
* What should I know before acting?
* What risks were discussed?
* What is the current operational state?

The goal is understanding - not summarization.

## Operational Objectives

Transform conversations into:

* operational events
* timeline entries
* candidate entities
* relationships
* evidence
* unresolved questions
* decisions
* action items
* risk signals

Do not simply summarize conversations.

Reconstruct operational reality.

## Extract Candidate Entities

Identify references to:

* Projects
* Vendors
* Contractors
* Employees
* Customers
* Assets
* Properties
* Equipment
* Materials
* Documents
* Invoices
* Purchase Orders
* Change Orders
* RFIs
* Permits
* Accounts
* Trusts
* Legal entities

Normalize names where possible.

Use SAME when identity ambiguity exists.

Never silently merge entities.

## Detect Operational Events

Look for events such as:

* Decision
* Approval
* Rejection
* Delay
* Escalation
* Assignment
* Issue
* Risk
* Incident
* Meeting outcome
* Vendor communication
* Compliance concern
* Payment discussion
* Schedule change
* Document request

Every event should include:

* approximate timestamp
* participants
* supporting evidence
* confidence

## Timeline Reconstruction

Instead of returning disconnected messages, reconstruct an operational timeline.

Example:

```text
June 3
Vendor reports delivery delay.

June 4
Project manager approves alternate supplier.

June 5
Purchasing creates replacement PO.

June 6
Materials delivered.

Issue resolved.
```

Preserve uncertainty when ordering cannot be confirmed.

## Decision Extraction

For each significant discussion determine:

* What decision was made?
* Who made it?
* Was consensus reached?
* Is approval documented?
* Is additional review required?

If no decision exists, state that explicitly.

## Action Item Extraction

Identify:

* assigned work
* owners
* deadlines
* blockers
* dependencies

Separate completed actions from outstanding work.

## Risk Detection

Surface operational risks including:

* schedule slips
* vendor issues
* compliance concerns
* missing documentation
* payment delays
* conflicting instructions
* unresolved blockers

Do not exaggerate risk.

Distinguish confirmed risks from speculation.

## Evidence Weighting

Slack is contextual evidence.

Default guidance:

Strong

* Executive announcement
* Formal approval posted by authorized approver
* Message linking official signed documentation

Medium

* Project manager confirmation
* Team lead direction
* Cross-team agreement

Weak

* Brainstorming
* Opinions
* Informal discussion
* Early speculation

When stronger evidence exists elsewhere, defer to the stronger source.

## Cross-Source Linking

Whenever possible connect Slack discussions to:

* Email
* Documents
* PDFs
* SharePoint
* Google Drive
* Asana
* Jira
* ERP records
* Vendor records
* Invoices
* Change Orders
* Contracts
* Calendar events

Slack should enrich existing operational records rather than replace them.

## Operational Memory

Convert durable findings into operational memory.

Capture:

* what happened
* why it happened
* who participated
* what evidence supports it
* what remains uncertain
* what should happen next

Avoid preserving transient conversation that has no operational value.

## Runtime Context

Slack contributes context - not authority.

Runtime reasoning should combine Slack with stronger operational systems before producing recommendations.

## Agent Behavior

After reconstruction, agents should be able to answer questions such as:

* Why is this project delayed?
* When did this issue first appear?
* Who approved this decision?
* What evidence supports that conclusion?
* Which questions remain unresolved?
* What changed since the previous review?

If evidence is incomplete, explain the uncertainty instead of guessing.

## Compliance

Always preserve provenance.

Record:

* source channel
* thread
* author
* timestamps
* referenced documents
* linked operational entities

Never present Slack discussion as authoritative unless supported by stronger evidence.

## Agent Action Logging

When this skill produces recommendations, log:

* retrieved conversations
* extracted entities
* operational events
* reasoning modules used
* evidence sources
* confidence
* human review requirement
* resulting state change

These logs become part of the operational audit trail.

## Relationship to Icarus

Slack is one operational sensor within Icarus.

Slack feeds:

* Operational Memory
* Context Reconstruction
* Timeline Assembly
* SAME
* Evidence Weighting
* Best Available Explanation (BAE)
* Runtime Intelligence

It complements - not replaces - documents, email, ERP systems, and other systems of record.

## Core Principle

Slack answers:

"What were people saying?"

Icarus answers:

"What actually happened, why did it happen, what evidence supports that conclusion, and what should happen next?"
