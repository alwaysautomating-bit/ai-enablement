---
id: knowledge.screenshot-component-evidence
type: knowledge
title: Screenshot-Derived Component Evidence
description: Bound component inventories to what rendered screenshots visibly establish while preserving hierarchy, repetition, and uncertainty.
tags: [pork, design-systems, screenshots, components, evidence-grounding]
portable: true
status: canonical-draft
source_files:
  - user-provided Component Lens product brief and reference screenshot, 2026-10-27
---

# Screenshot-Derived Component Evidence

A screenshot is strong evidence for rendered appearance and weak evidence for implementation. It can establish visible regions, text, icons, containment, ordering, repetition, and visibly expressed states. It cannot establish hidden content, event handling, data flow, permissions, DOM semantics, framework choice, or responsive behavior outside the captured frame.

## Observation and normalization

Keep two layers distinct:

1. **Observation** records what the pixels directly show: a bounded panel, the text `Inputs`, a chevron pointing downward, and four indented rows.
2. **Normalization** assigns a useful platform-neutral interpretation: `Popover`, expanded `AccordionItem`, and four `MenuItem` instances.

Normalization makes an inventory useful to developers, but it remains an interpretation rather than proof of the source implementation.

## Hierarchy

Infer parent-child structure from visible containment, indentation, alignment, dividers, and repetition. Preserve display order. When containment is ambiguous, keep elements as siblings and record the uncertainty instead of forcing a tree.

## Repeated patterns

Deduplication should produce both a reusable pattern and a complete instance list. The pattern captures shared visible anatomy and role. Instances retain labels, icons, states, and variations. Grouping repeated rows must never make visible instances disappear from the inventory.

## State

Record a state only when it has a visible signal. Examples include an expanded section with revealed children, a checked box, a selected tab, or a visibly disabled control. A control's mere presence does not prove that it is interactive or enabled.

## Uncertainty

Use uncertainty as structured output, not as filler commentary. Mark partly obscured text, ambiguous icons, uncertain roles, and unclear containment close to the affected component. Do not convert absence of evidence into a negative claim about the product.

## Output discipline

A component inventory is not a redesign, implementation plan, accessibility audit, or code generator. Those can consume the inventory later, but adding them during extraction weakens the evidence boundary and makes the output harder to verify.

