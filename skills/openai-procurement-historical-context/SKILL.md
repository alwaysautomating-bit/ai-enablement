---
name: openai-procurement-historical-context
description: Gather historical and ambient context that could change procurement outcomes for a project build. Use when an agent needs to assemble prior project lessons, seasonal constraints, labor availability, legislation, permitting shifts, regional market conditions, freight patterns, or similar external factors that may affect vendor choices, material timing, or project execution.
---

# OpenAI Procurement Historical Context

Build the external and historical backdrop around a project so the team does not reason from the current schedule alone.

Read [./references/context-factors.md](./references/context-factors.md) before finalizing the scan.

## Workflow

1. Define the comparison frame:
   - project type
   - geography
   - timeline
   - trade packages or systems in scope
2. Gather historical context from:
   - similar past projects
   - regional construction cycles
   - labor and workforce constraints
   - weather or seasonal windows
   - legislation, code, tariff, or permitting changes
   - vendor history and known supply disruptions
3. Separate durable signals from temporary noise.
4. Translate each context item into project relevance:
   - what it affects
   - when it matters
   - whether it increases cost, delay, or approval friction
5. Mark whether each point is:
   - observed historical pattern
   - current external condition
   - tentative inference requiring verification
6. End with the context items that should alter current planning assumptions.

## Review Rules

- Prioritize factors that would change ordering dates, supplier pool, labor sequencing, or acceptance paths.
- Do not dump generic market commentary into the output.
- Anchor every insight to the specific project or package it could affect.
- Include dates for current laws, labor conditions, and external constraints whenever available.
- If the evidence is weak or anecdotal, label it that way.

## Output

Return:

- `comparison_frame`
- `historical_patterns`
- `current_external_conditions`
- `seasonal_or_regulatory_factors`
- `project_relevance`
- `planning_assumptions_to_revisit`
- `open_verification_items`
