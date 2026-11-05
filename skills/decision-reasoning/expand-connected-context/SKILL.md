---
name: expand-connected-context
description: Identify entities, workflows, events, dependencies, constraints, and environmental conditions connected to a signal or state so downstream reasoning can evaluate the broader operational situation.
---

# Expand Connected Context

Map the surrounding operational context that is relevant to a decision.

## Core question

What else is connected or changed?

## Responsibilities

- traverse relevant relationships
- identify upstream causes and downstream effects
- detect related concurrent events
- identify constraints and dependencies
- distinguish direct, indirect, and merely correlated connections
- limit expansion to decision-relevant context

## Required output

```yaml
connected_context:
  focal_object: string
  direct_connections:
    - entity_or_event: string
      relationship: string
      relevance: high | medium | low
      source_refs: []
  upstream_dependencies: []
  downstream_impacts: []
  concurrent_changes: []
  constraints: []
  excluded_connections:
    - item: string
      reason_not_relevant: string
  context_summary: string
  confidence: number
```

## Boundary

This skill maps relevant surrounding context.

It does not decide whether those connections materially matter.
