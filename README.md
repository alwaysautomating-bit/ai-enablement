# AI Enablement Workspace

A governed, connected AI workspace that organizes work around recognizable jobs instead of a
blank chat box. The workspace expands with organizational trust while keeping review,
permissions, provenance, and approval structural.

## Current Slice

The first runnable slice is an L0 Research Assistant prototype:

- Role-curated work menu
- Guided research brief
- Persistent mock organization context
- Optional connector orientation
- Explicit read-only permission review
- Source selection and quality signals
- Draft generation and second-pass flags
- Human review and requested changes
- Explicit approval with a locked approval record
- Responsive operational shell derived from the earlier Icarus prototype

Context Capture (`/context`) reconstructs operational context from email and chat, verified
against a synthetic corpus: `npm run context:eval`. See the setup guide for Codex and Claude.

AI generation and external connectors are intentionally mocked in the Research Assistant slice. The product
workflow is being proven before live credentials, external write access, or unattended
execution are introduced.

## Run Locally

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo walkthrough

1. `npm run demo:reset` clears earlier questions, reviews, and runs (a backup goes to `output/demo-backups/`).
2. Open `/context`, pick the first example question, tick `#construction-ops`, `#finance-approvals`, and
   all sample mail, confirm the permission review, and run it.
3. Confirm, correct, or dismiss suggestions; confirmed items become the dated timeline.

By default the demo replays a recorded model response, so it costs nothing and gives the same results
every time, whatever question is typed. Set `CONTEXT_EXTRACTOR=openai` (with `OPENAI_EXTRACTION_MODEL`)
or `anthropic` in `.env` to use a live model. SAME runs from `../SAME/.venv` (override with `SAME_PYTHON`).

## Validate

```powershell
npm run lint
npm run build
```

## Product Documentation

- [Project](./PROJECT_09-29-2026.md)
- [Backlog](./BACKLOG_09-29-2026.md)
- [Build log](./BUILD_LOG_09-29-2026.md)
- [Decisions](./DECISIONS_09-29-2026.md)
- [Framework](./docs/FRAMEWORK_L0_L1_L2.md)
- [Feature catalog](./docs/FEATURE_CATALOG.md)
- [Context Capture roadmap](./docs/CONTEXT_CAPTURE_ROADMAP.md)
- [Using Context Capture from Codex and Claude](./docs/CONTEXT_MCP_SETUP.md)
- [PORK integration plan](./docs/PORK_INTEGRATION_PLAN.md)
- [Vocabulary-Earned Doctrine](./docs/VOCABULARY_EARNED_DOCTRINE.md)

## Constraints

- L0 connections are read-only.
- Technical education is optional; permission review is mandatory.
- Generated output remains a draft until a person explicitly approves it.
- Internal terms are revealed only after the user has expressed or used the concept.
- Privacy Scrubber is a planned isolated service and is not represented as a compliance
  guarantee.
