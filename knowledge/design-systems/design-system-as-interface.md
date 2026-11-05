---
id: knowledge.design-system-as-interface
type: knowledge
title: Design System as a Human-and-Machine Interface
description: Treat a design-system document as a source-grounded contract connecting product meaning, visual intent, machine-readable tokens, and generated interfaces.
tags: [pork, design-systems, design-md, interface-contract, source-grounding]
portable: true
status: canonical-draft
source_files:
  - https://github.com/google-labs-code/stitch-skills
  - https://stitch.withgoogle.com/docs/design-md/get-instructions
---

# Design System as a Human-and-Machine Interface

A useful design-system document is not a mood board and not a token dump. It is a bimodal interface:

- structured values let tools apply colors, typography, spacing, shape, and other tokens consistently;
- semantic prose explains atmosphere, hierarchy, component behavior, layout principles, and the reasons behind the choices.

The document should survive a change of design tool. Tool-specific upload mechanics belong in adapters; the design intent and source evidence belong in the durable document.

## Source-of-truth order

When extracting a design system from an existing product, use evidence in this order:

1. explicit theme and token files
2. global styles, framework configuration, and shared component primitives
3. repeated patterns in shipped components
4. rendered screens and screenshots
5. README and product documentation for terminology and product emphasis
6. isolated overrides and one-off visual exceptions

Read both intent and reality. A theme file expresses the intended system; shipped components reveal where the implementation diverged. Record meaningful divergence instead of silently averaging it away.

## Three extraction layers

1. **Product content:** names, labels, values, states, and terminology come from the product sources. Do not invent filler content when real content exists.
2. **Visual identity:** extract colors, typography, spacing, geometry, elevation, component states, responsive behavior, and accessibility constraints.
3. **Information architecture:** infer the product's native shape from its data and workflows. A timeline, graph, catalog, queue, or pipeline should organize the interface more strongly than a generic page template.

## Semantic precision

Pair human meaning with exact values:

- descriptive color name + exact value + functional role
- typographic character + family + scale + weight + line height
- physical shape description + radius value
- spatial principle + token or measurement
- component intent + default, interactive, disabled, loading, empty, and error states

Natural language without exact values drifts. Exact values without semantic roles are difficult to extend. Preserve both.

## Extraction workflow

1. Establish the product purpose, dominant workflow, and authoritative source directories.
2. Detect the framework and styling stack.
3. inventory token, theme, global style, and component sources.
4. Extract and deduplicate values by functional role.
5. Describe the atmosphere and hierarchy only after the evidence is collected.
6. Document components, layout, responsive behavior, and accessibility.
7. Separate confirmed rules, repeated conventions, and inferred intent.
8. Produce machine-readable tokens plus human-readable rationale.
9. Validate the document against representative screens and source files.
10. Require human review before uploading, applying, or replacing a live design system.

## Failure modes

- generating a fashionable design language before reading the product
- treating scattered values as equally authoritative
- inventing product copy or placeholder data
- documenting only the happy state of a component
- using vague adjectives without measurable values
- producing tokens with no explanation of their functional roles
- uploading a generated design system before the owner reviews the summary
- treating an external generator's accepted schema as the universal design-system schema

## Human-review boundary

An agent may extract, reconcile, and draft the design-system contract. A human owner confirms brand intent, resolves ambiguous or conflicting patterns, approves material token changes, and authorizes any upload or application to a live design project.
