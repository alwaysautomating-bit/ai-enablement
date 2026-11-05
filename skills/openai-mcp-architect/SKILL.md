---
name: openai-mcp-architect
description: Design how an OpenAI system should connect to external tools and systems. Use when deciding between connectors, hosted MCP, private MCP, custom remote MCP, function tools, local shell, or secure remote access patterns, especially when trust boundaries and approvals matter.
---

# OpenAI MCP Architect

Design the connection model before choosing the implementation surface.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) for MCP, connector, approvals, and Codex security references.

## Workflow

1. Identify the external system and what the model must actually do.
2. Decide whether the need is:
   - live read access
   - write or mutate access
   - transactional workflow
   - broad SaaS integration
   - custom internal capability
3. Choose the connection type:
   - connector
   - hosted or remote MCP
   - private MCP
   - plain function tool
   - local shell or Codex-only access
4. Define the trust boundary:
   - what data leaves the host
   - what actions require approval
   - what is allow-listed
   - what is logged

## Decision Rules

- Prefer an official connector when it already exposes the needed service cleanly.
- Prefer MCP when the system exposes multiple related tools or rich context.
- Prefer a function tool when the capability is narrow and application-owned.
- Prefer private or company-controlled MCP for internal systems and sensitive operations.
- Separate read-only and write-capable tool surfaces whenever possible.

## Output

Return:

- `connection_recommendation`
- `why_not_the_other_options`
- `tool_surface`
- `approval_model`
- `trust_boundaries`
- `security_controls`
- `operational_notes`
