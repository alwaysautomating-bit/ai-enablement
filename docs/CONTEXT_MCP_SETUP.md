# Using Context Capture from Codex and Claude

Status: Local development (sample data)
Last updated: 2026-09-29

The AI Enablement Workspace stays the system of record. Codex and Claude Code connect to its
MCP server with a personal token, read people-reviewed context with provenance, and can
start a bounded capture. Review, sharing, and any write to external systems stay in the
workspace; there are no MCP tools for them.

## 1. Prepare the database

```bash
npm run db:migrate
```

## 2. Create a personal token

```bash
npm run context:token -- --user user_laura --name "Claude Code"
```

The token is printed once; only its hash is stored. Add `--read-only` for a token that can
search but not start captures. Sample users: `user_laura`, `user_marcus`.

Set it in your environment as `AIEW_CLIENT_TOKEN`.

## 3a. Claude Code

The repository's `.mcp.json` registers `ai-enablement-context`. Start Claude Code from the
repository with `AIEW_CLIENT_TOKEN` set and approve the project server when prompted.

Skills: copy or symlink `skills/context-capture` and `skills/operational-context` into
`.claude/skills/` (project) or `~/.claude/skills/` (personal).

## 3b. Codex

Add to `~/.codex/config.toml` (adjust the path if the repository moves):

```toml
[mcp_servers.ai_enablement_context]
command = "node"
args = [
  "C:/Projects/AIEnablementWorkspace/node_modules/tsx/dist/cli.mjs",
  "C:/Projects/AIEnablementWorkspace/scripts/mcp-server.mts",
]
env = { AIEW_CLIENT_TOKEN = "<your token>" }
```

The server moves to the repository root itself, so it works from any directory.

Skills: copy `skills/context-capture` and `skills/operational-context` into your Codex
skills directory (`~/.codex/skills/`).

## 4. Check it

```bash
npm run context:mcp-smoke -- --user user_laura
```

This starts the server as a separate process, lists its tools, runs one search, and revokes
the temporary token.

## Tools

| Tool | What it does |
|---|---|
| `search_context` | Confirmed context with provenance; `include_unreviewed` adds your own labelled candidates |
| `get_entity_timeline` | One entity's relationships over time, operational vs. communication time |
| `get_evidence` | One cited source message, if you may see it |
| `list_captures` / `get_capture_summary` | Your captures and what they found |
| `list_sources` | Your read-only connections and the places a capture may look |
| `start_capture` | Start a bounded capture; results await review in the workspace |

## Model used for captures

`CONTEXT_EXTRACTOR` chooses `anthropic`, `openai`, or `recorded` (sample data only). The
OpenAI implementation needs `OPENAI_EXTRACTION_MODEL` (for example `gpt-5.5`) and reads
`OPENAI_API_KEY` or `OPEN_AI_KEY`. The Anthropic implementation defaults to `claude-opus-5`
(`CONTEXT_ANTHROPIC_MODEL` to change) with refusal fallbacks enabled.
