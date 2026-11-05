---
name: openai-tooling-architect
description: Design how tools should be exposed to an OpenAI agent. Use when a system has too many tools, unclear namespaces, duplicate capabilities, or a question about what should be immediate, deferred, searchable, namespaced, MCP-based, or hidden behind tool search.
---

# OpenAI Tooling Architect

Optimize the tool surface for focus, cost, and reliability.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) for current tool search, MCP, shell, and built-in tool references.

## Workflow

1. Inventory the candidate tools.
2. Group them by job:
   - universal and frequently used
   - specialist but predictable
   - large catalog or long tail
3. Decide exposure:
   - immediate tool
   - namespaced tool
   - MCP surface
   - deferred loading
   - tool search
4. Remove duplicates and overlaps.
5. Define approval requirements and failure handling.

## Decision Rules

- Keep the immediate tool set small.
- Expose universal tools directly only if they are broadly useful across requests.
- Use namespaces or MCP for coherent tool families.
- Use tool search when the catalog is too large to load up front.
- Do not expose two tools that solve the same job unless they have clearly different trust or cost profiles.
- Prefer specialized tools over general shell access when a safe high-level tool already exists.

## Output

Return:

- `immediate_tools`
- `deferred_tools`
- `tool_search_candidates`
- `namespace_or_mcp_plan`
- `approval_requirements`
- `rationale`
