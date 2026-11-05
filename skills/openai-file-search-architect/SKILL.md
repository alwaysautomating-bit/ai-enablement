---
name: openai-file-search-architect
description: Design file-search and vector-store architecture for OpenAI systems. Use when the goal is to create a company knowledge base, project memory layer, or "company brain" that agents can search with citations, especially when deciding how to separate vector stores by purpose instead of dumping everything into one pile.
---

# OpenAI File Search Architect

Treat file search as the retrieval layer over an organized knowledge base, not as a giant miscellaneous document bucket.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) when current file-search, retrieval, metadata filtering, or supported-file guidance matters.

## Mental Model

- vector store = organized knowledge base
- file search = retrieval layer
- agent = worker that uses retrieved context
- skill = process and decision rules for what to do with that context
- shell = execution layer when files need to be created or updated
- MCP = live systems of record

## Workflow

1. Identify the main knowledge domains.
2. Split vector stores by purpose, not by convenience.
3. For each store, define:
   - intended agents
   - document types
   - freshness expectations
   - metadata fields
   - source precedence
4. Define which store each workflow should search first.
5. Require citation-backed answers and explicit assumptions when support is missing.

## Design Rules

- Do not make one giant vector-store pile unless the corpus is truly uniform.
- Separate stable doctrine from project-specific context.
- Separate live systems of record from uploaded reference files.
- Use file search first for document-grounded reasoning before building custom retrieval infrastructure.
- Use metadata filtering when agents should search only a narrow slice of the corpus.
- If the answer is not supported by retrieved context, label it as an assumption.

## Good Starter Store Pattern

- core operating doctrine
- guardrails and compliance context
- project-specific context
- source conversations and decision logs

## Output

Return:

- `recommended_vector_stores`
- `what_goes_in_each_store`
- `metadata_strategy`
- `agent_to_store_mapping`
- `search_order_rules`
- `citation_and_assumption_policy`
- `freshness_and_maintenance_notes`
