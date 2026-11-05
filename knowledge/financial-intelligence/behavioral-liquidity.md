---
id: knowledge.behavioral-liquidity
type: knowledge
title: Behavioral Liquidity
status: canonical-draft
---

# Behavioral Liquidity Ontology

## Core Hierarchy

```text
atomic skills
    ->
reference models
    ->
planning models
    ->
capabilities
    ->
reports
```

## Definitions

### Atomic Skills

Atomic skills do one repeatable reasoning job.

They should be:

- narrow
- composable
- reusable across multiple families
- reusable across multiple planning models

Examples:

- event identification
- event classification
- recurrence detection
- approval threshold analysis

### Reference Models

Reference models store durable operating information consulted by skills and capabilities.

They should preserve client-specific reality that should not be rediscovered from scratch every time.

They should be:

- family-specific
- entity-aware
- calendar-aware
- source-of-wealth-aware
- operationally durable

Examples:

- family profile
- behavioral event map
- approval network
- affected entity map

### Planning Models

Planning models combine context and atomic skills into a usable analytical system.

They should answer structured planning questions, but they are not yet executive-facing capabilities.

Examples:

- behavioral event mapping
- calendar-based liquidity pressure modeling
- seasonal pressure modeling
- event cascade modeling

### Capabilities

Capabilities answer operational decisions.

They consume one or more planning models and reference models to answer a decision-level question for operators.

Examples:

- executive volatility management
- principal-driven liquidity analysis
- lifestyle event financial modeling

### Reports

Reports communicate findings.

They are human-facing outputs, not reasoning layers.

Examples:

- operator briefing
- seasonal pressure memo
- principal risk summary

## Governing Doctrine

Do not model this as generic UHNW behavior.

Behavior must be:

- client-specific
- family-specific
- entity-aware
- calendar-aware
- source-of-wealth-aware

Two families with similar wealth can require very different liquidity and operating responses because their behavior, industries, traditions, and decision styles differ.

This system models behavioral liquidity pressure, not just static wealth.

## Core Objects

### Family Profile

The family profile is the upstream operating context.

It establishes:

- who the principal and family are
- how they behave
- how decisions get made
- how liquidity is typically deployed
- what creates volatility
- what deserves escalation

### Behavioral Event Map

The behavioral event map is the canonical event-layer output.

It describes:

- what events exist
- when they happen
- who or what causes them
- which entities they affect
- what burdens they create
- how much confidence exists

## Core Build Sequence

1. Define the family profile reference model.
2. Identify candidate events.
3. Classify candidate events.
4. Materialize the behavioral event map.
5. Use the map in later planning models.

## Explicit Non-Goals For This Phase

Do not build reserve math yet.

Do not build Monte Carlo yet.

Do not start with behavioral reserve planning.

The goal of this phase is upstream structure:

- family profile reference
- event identification
- event classification
- canonical event map schema

## Source-Of-Wealth Guidance

Source of wealth is not background flavor.

It is a meaningful driver of event patterns, opportunity timing, approval behavior, and liquidity style.

### Venture-Capital Family

Typical patterns:

- opportunity-driven
- fast deployment
- capital calls
- SPVs
- founder events
- political events
- conference and retreat cycles
- high optionality reserve needs

### Oil-And-Gas Family

Typical patterns:

- asset-heavy
- land and ranch operations
- mineral rights
- equipment purchases
- drilling commitments
- estate planning
- seasonal and project-based liquidity needs

These patterns should inform event identification and event classification without overriding client-specific evidence.
