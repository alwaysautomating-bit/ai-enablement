---
name: openai-secure-mcp-tunnel
description: Design private MCP connectivity with Secure MCP Tunnel. Use when an MCP server is on-prem, private, or behind a firewall and still needs to be reachable from ChatGPT, Codex, the Responses API, or another supported OpenAI surface without exposing inbound ports to the public internet.
---

# OpenAI Secure MCP Tunnel

Design private MCP access around outbound-only connectivity and explicit trust boundaries.

Read [the OpenAI documentation skill](../openai-docs/SKILL.md) when MCP, connectors, approvals, or Codex remote-security guidance matters.

## Workflow

1. Confirm the MCP server is private, on-prem, or otherwise not internet-exposed.
2. Confirm the host can already reach the MCP server locally.
3. Choose Secure MCP Tunnel when the requirement is:
   - no inbound firewall opening
   - private network retention
   - supported OpenAI surfaces still need normal MCP access
4. Design:
   - tunnel-client placement
   - outbound network policy
   - approval boundaries
   - logging and audit
   - failure recovery

## Decision Rules

- Use Secure MCP Tunnel when the MCP server must remain private and inbound exposure is unacceptable.
- Run `tunnel-client` inside the network that can already reach the MCP server.
- Treat the tunnel as an outbound HTTPS path to OpenAI that pulls queued work and forwards it locally.
- Separate read-only and mutating tools where possible before exposing them through the tunnel.
- Keep approval requirements explicit for high-risk or write-capable tools.

## Security Model

- The MCP server stays private.
- OpenAI products talk to an OpenAI-hosted MCP endpoint.
- The tunnel client polls for work, forwards requests locally, and returns results through the same tunnel.
- No public inbound port is required.

## Output

Return:

- `should_use_secure_mcp_tunnel`
- `why_this_fits`
- `tunnel_topology`
- `trust_boundaries`
- `approval_requirements`
- `network_and_logging_requirements`
- `failure_modes`
