---
name: openai-procurement-lookahead
description: Prepare procurement and construction look-ahead meeting briefings without making purchasing decisions. Use when an agent needs to assemble a 3-month or 6-month meeting packet from schedules, specs, submittals, RFIs, change orders, quotes, vendor status, contract requirements, and unresolved decisions so the team enters the room with the current reality already organized.
---

# OpenAI Procurement Lookahead

Assemble the decision surface for an upcoming planning meeting. Do not choose vendors or approve purchases unless the user explicitly asks for recommendations.

Read [./references/meeting-brief-template.md](./references/meeting-brief-template.md) before drafting the final packet.

## Workflow

1. Confirm the meeting date and planning horizon:
   - next 3 months
   - next 6 months
   - both, if the request is broad
2. Gather only procurement-relevant evidence:
   - project schedule and milestone look-aheads
   - spec sections and approved selections
   - submittal logs and approval states
   - vendor quotes, lead times, and quote expirations
   - purchase status, change orders, RFIs, and owner decisions
   - contract clauses that affect ordering, substitutions, freight, or approvals
3. Normalize every finding into:
   - affected item or package
   - required-on-site or decision-by date
   - current status
   - dependency or blocker
   - evidence source and as-of date
4. Sort the packet around decisions, not around documents.
5. Separate facts from inferences:
   - facts = what the source shows
   - inference = why that fact creates risk for the horizon
6. Call out missing information explicitly instead of filling gaps with guesswork.

## Review Rules

- Prioritize items that can slip the schedule if the team waits another week.
- Treat long-lead items, expiring quotes, unresolved approvals, and blocked submittals as first-order risks.
- Prefer concise bullets with dates over narrative summaries.
- Include the evidence date for vendor availability, pricing, and lead times.
- Escalate authority gaps such as "owner decision required" or "approver unclear."
- If sources disagree, show the conflict instead of averaging it away.

## Output

Return:

- `meeting_horizon`
- `decisions_required_now`
- `items_approaching_risk`
- `research_completed`
- `missing_context`
- `contracts_or_approvals_to_check`
- `source_freshness_notes`
