---
id: knowledge.permission-classes
type: knowledge
title: Permission Classes and Scoped Approval
description: Scope capability approval to an exact composition version and the specific effects it may perform.
tags: [pork, governance, permissions, approval]
portable: true
status: canonical-draft
source_files:
  - C:/Projects/AIEnablementWorkspace/docs/PORK_INTEGRATION_PLAN.md
  - C:/Projects/PORK-context-capture/doctrine/governance/permission-classes.md
---

# Permission Classes and Scoped Approval

An approval is scoped to **capability + version + permission class**. It is never approval of a capability or version in the abstract.

A version is the PORK revision plus the content hash of the assembled capability. A permission class is one kind of effect the capability may have in a consuming runtime. Passing an evaluation for one class says nothing about any other class: permission to retrieve authorized evidence does not authorize extraction, persistence, confirmation, writes, or automation.

## Classes

| Class | Effect | Who may hold it |
| --- | --- | --- |
| `retrieve_authorized_evidence` | Read source evidence the requesting person may already see | Capability, after approval |
| `reconstruct_conversations` | Group, order, and link retrieved messages | Capability, after approval |
| `extract_candidate_assertions` | Propose candidate operational context from evidence | Capability, after approval |
| `run_semantic_stabilization` | Send candidates to an authorized stabilization service | Capability, after approval |
| `persist_candidates` | Store candidates, evidence pointers, and provenance for review | Capability, after approval |
| `confirm_operational_facts` | Turn a candidate into confirmed operational context | Human reviewer only |
| `broaden_visibility` | Let more people see something than could see its sources | Human reviewer only |
| `send_email` | Send or draft outbound email | Separate write approval |
| `post_chat_message` | Post or edit chat messages | Separate write approval |
| `execute_downstream_action` | Change an external system or trigger automation | Separate execution approval |

## Rules

1. An approval names the capability, exact revision and content hash, and every granted class. Unnamed classes are denied.
2. A changed revision or content hash requires a new approval. Dirty content cannot be approved for live use.
3. An approval may grant only classes exercised by the passing evaluation.
4. Confirmation and visibility widening remain human-only even when other classes are approved.
5. Fixture-only evaluations may exercise classes without granting access to live sources.
6. A runtime that cannot verify every required class for the exact version must fail closed.
7. Approval and revocation records identify the reviewer as a verifiable principal.

This extends [Recommendation, Permission, and Execution](recommendation-permission-execution.md): permission to do one thing is not permission to do another.
