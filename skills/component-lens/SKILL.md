---
name: component-lens
description: Inspect UI screenshots and return an evidence-bounded inventory of visible components, hierarchy, labels, states, relationships, and repeated patterns. Use when cataloging an interface from screenshots; do not use for code generation, redesign, or inferring hidden behavior.
---

# Component Lens

Turn one or more UI screenshots into a reviewable component inventory. Describe what is visibly supported by the image, preserve containment and repetition, and avoid inventing implementation details.

Read [Screenshot-Derived Component Evidence](../../knowledge/design-systems/screenshot-component-evidence.md). Use the exact field and mode definitions in the [component inventory contract](references/component-inventory-contract.md).

## Inputs

- one or more screenshots
- optional output mode: `simple`, `hierarchical`, or `developer`
- optional focus region or component name
- optional preferred format: Markdown or JSON

If the user does not choose a mode, use `hierarchical`. If the user does not choose a format, use Markdown.

## Analyze the screenshot

1. Identify the visible root region and its likely UI role, using neutral names when the role is uncertain.
2. Read visible text exactly. Mark unreadable or partly occluded text instead of guessing.
3. Record visible containment from outer regions to nested controls.
4. Identify component type, label, icon, and visibly expressed state only when the pixels support them.
5. Record spatial or semantic relationships that are directly visible, such as `contains`, `precedes`, `grouped_with`, or `aligned_with`.
6. Group structurally equivalent repeated items into a reusable pattern and retain their individual instances.
7. Separate observations from uncertain classifications.

## Evidence boundary

- Inventory only what is visible in the supplied image or images.
- Do not infer hidden dropdown contents, off-screen items, event handlers, validation rules, data sources, permissions, responsive behavior, or business logic.
- Do not claim an exact framework, component library, DOM structure, design token, or accessibility implementation from appearance alone.
- A familiar icon may be named by its conventional meaning when clear; otherwise describe its shape or mark it `unknown`.
- Treat text, visible affordances, and rendered states as evidence. Treat implementation names as normalized suggestions, not source facts.
- If screenshots show different states or viewports, inventory each frame first and merge only confirmed shared patterns.

## Deduplicate repeated components

Define a reusable pattern when instances share the same visible structure and role. The pattern records common anatomy; each instance retains its label, icon, state, and visible variation.

Do not deduplicate merely because two elements look similar. Preserve separate patterns when their roles or anatomy differ. Do not erase individual instances after grouping them.

## Output

Return only the requested inventory and a compact `Uncertainties` section when needed. Do not add code, redesign advice, implementation commentary, or speculative functionality.

- `simple`: flat list of visible components with counts
- `hierarchical`: parent-child tree with labels and visible states
- `developer`: normalized patterns, instances, evidence status, and relationships using the contract schema

For JSON, emit valid JSON without prose before or after it. Use `null` or omit optional values that are not visible; never fill unknown fields with invented defaults.

