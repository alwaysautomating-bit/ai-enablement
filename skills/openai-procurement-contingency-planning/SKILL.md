---
name: openai-procurement-contingency-planning
description: Build procurement contingency plans from initial decisions about vendors, materials, substitutions, capacities, and dates. Use when an agent needs to model what happens if a supplier slips, a quote expires, a material becomes unavailable, an approval stalls, or a milestone moves, then organize practical fallback paths without pretending certainty.
---

# OpenAI Procurement Contingency Planning

Turn procurement uncertainty into explicit branches, triggers, and fallback actions. Do not present a single plan as guaranteed.

Read [./references/scenario-template.md](./references/scenario-template.md) before producing a final scenario set.

## Workflow

1. Identify the base plan:
   - selected vendor or preferred path
   - key dates
   - material assumptions
   - approval dependencies
2. Surface the fragile assumptions:
   - lead time
   - pricing validity
   - production capacity
   - shipping method
   - substitution acceptance
   - labor or install readiness
3. For each fragile assumption, write:
   - trigger condition
   - earliest warning signal
   - consequence if no action is taken
   - fallback option
   - decision owner
4. Distinguish between:
   - preventative actions
   - branch decisions
   - emergency actions
5. Rank contingencies by schedule threat first, then cost, then administrative friction.
6. State what evidence would retire the contingency or move it from watchlist to active response.

## Review Rules

- Prefer a small number of concrete branches over a giant risk register.
- Every contingency should tie back to a date, dependency, or acceptance condition.
- If a fallback is not contract-compliant, mark it as conditional instead of viable.
- Note when the contingency requires owner approval, design-team approval, or revised pricing.
- Be explicit about what is unknown.

## Output

Return:

- `base_plan`
- `fragile_assumptions`
- `trigger_conditions`
- `scenario_branches`
- `preventative_actions_now`
- `evidence_needed_next`
- `items_requiring_human_approval`
