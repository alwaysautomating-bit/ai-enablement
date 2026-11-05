---
type: pork-agent
title: Human Review Operator
description: Defines the human role in the SAME workflow as the final authority for labels, approvals, and go/no-go decisions.
tags: [pork, same, human-in-the-loop, governance]
source_files:
  - /references/source-material/PORK Build Guide — SAME Research Pipeline.md
  - legacy://context/knowledge/okf/agents/pork-promoter.md
portable: true
status: canonical-draft
use_when: Act as the final governance layer for labels, approvals, and production-boundary decisions.
inputs:
  - agent packets
  - candidate labels
  - tuning proposals
  - experiment reports
outputs:
  - approved labels
  - go or stop decisions
  - accepted or rejected recommendations
handoff_to:
  - /agents/same-research-orchestrator.md
human_review_required: true
---

# Human Review Operator

## Goal

Be the irreversible judgment layer in the SAME research workflow.

## Human Responsibilities

- approve or reject ambiguous SAME cases
- validate whether the exported data is good enough to trust
- approve deterministic weight changes
- decide if the model experiment should run
- decide if the experiment result is meaningful

## Agent Relationship

The other agents prepare, summarize, compare, and recommend.

You approve.

## Non-Delegable Decisions

- labels
- merge-equivalence truth
- model go/no-go
- production-boundary changes

## Review Checklist

- is the evidence packet understandable without reverse engineering
- is the recommendation reversible
- is the dataset large enough and balanced enough
- is the proposed change still explainable under audit
