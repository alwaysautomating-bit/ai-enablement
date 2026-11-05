# PORK Integration Plan

Status: Connected to current PORK capability ontology; fixture-only validation in progress
Date: 2026-10-20
Repositories:
- AI Enablement Workspace (this repository)
- PORK (`C:\Projects\PORK`; canonical capability source)
- SAME (`C:\Projects\SAME`)

## 1. The Job

The workspace should stop inventing its own reasoning instructions and evaluations. It
should use PORK's governed doctrine, skills, agents, and evaluations. PORK, in turn, should
gain a real place where its agents can be tested safely and then used against real work.

## 2. Three Systems, Three Jobs

| System | Owns | Never owns |
|---|---|---|
| **PORK** | How to reason: doctrine, canonical skills, capability contracts, agent roles, curricula (agent school), evaluations, rubrics, review records | Any organization's data, connections, or confirmed facts |
| **AI Enablement Workspace** | Where work happens: people, read-only connections, permissions, evidence, human review, confirmed operational memory, the MCP surface | Canonical reasoning instructions (it consumes pinned PORK versions) |
| **SAME** | Semantic stabilization: identity, canonical entities and relationships, temporal and direction checks ([plan](file:///C:/Projects/SAME/docs/SEMANTIC_STABILIZATION_PLAN.md)) | Truth, review decisions, consumer data |

These map onto PORK's own rule, *recommendation is not permission, and permission is not
execution*: PORK recommends how to reason, the workspace enforces permission and review, and
execution beyond read-only stays behind L1/L2 gates.

## 3. What Already Lines Up

| PORK today | Workspace today | Fit |
|---|---|---|
| `tool.evidence-retrieval` — "retrieve authorized source evidence with stable provenance identifiers" (status `interface-required`) | MCP `get_evidence`: permission-checked, stable evidence and source-message ids | The workspace can be PORK's first **executable** implementation |
| `tool.operational-memory-search` — "search reviewed operational memory" (`interface-required`) | MCP `search_context`: confirmed facts only by default, labelled candidates, provenance | Same |
| `tool.relationship-traversal` — "traverse authorized entity, event, dependency, and ownership relationships" (`interface-required`) | MCP `get_entity_timeline`: permission-filtered temporal relationships | Same |
| Capabilities: Operational Memory, Slack Operational Sensing (`communication_is_not_confirmation`), Operational Event Reconstruction, Context-to-Decision | Context Capture: email/chat → candidates → human review → confirmed context | Context Capture is a concrete runtime for these packs |
| Evaluations `partial-event-ordering/three-clocks`, `chronology-collapse` | The operational-versus-communication time split, verified on synthetic data | Same doctrine, independently arrived at |
| Evaluation runner: fixture, expected outputs, guardrails, structural score, append-only semantic review, `human_required` approval | Context Capture evaluation: synthetic corpus, gold labels, 14 deterministic checks | The workspace's harness can be a PORK runtime adapter |
| `pork-runtime-run.schema.json`, with Founder OS as the first adapter | None | The workspace becomes the second runtime consumer. The PORK backlog says the envelope should become a versioned contract "after one more runtime consumer exists". |
| Agent roles + curricula + school (agent school) | Fixture adapters, scratch databases, the same MCP tools with no live data | The workspace supplies the **test ground** for agent school runs |

## 4. Integration Shape

```text
            PORK (git)                                AI Enablement Workspace
 ┌──────────────────────────────┐   pinned pack   ┌───────────────────────────────────┐
 │ skills · capabilities ·      │ ──────────────▶ │ vendor/pork/  (generated, locked) │
 │ agents · curricula · evals   │  pork:sync      │  └ jobs & extraction compose from │
 │ tool interface contracts     │                 │    pinned skills; version on runs │
 │                              │ ◀────────────── │                                   │
 │ tools/*.yaml implemented_by  │  conformance    │ MCP tools implement PORK contracts│
 │                              │  tests          │                                   │
 │ evaluation runner · reviews  │ ◀────────────── │ School sandbox (fixtures only)    │
 │ (append-only, human approval)│  runtime-run    │  runs agents · scores · envelopes │
 │                              │  envelope       │                                   │
 │ promote-pork (reviewed)      │ ◀─ lessons ──── │ never: org data or confirmed facts│
 └──────────────────────────────┘                 └───────────────────────────────────┘
```

Four flows, each one-directional and reviewable:

1. **Consume (PORK → workspace).** A pinned, generated snapshot of selected capability packs.
2. **Implement (workspace → PORK tool contracts).** Workspace MCP tools conform to PORK's
   tool interfaces; PORK records who implements them.
3. **School (both).** PORK agents run in the workspace's fixture-only sandbox; results are
   recorded in PORK with the runtime envelope and human approval.
4. **Promote (workspace → PORK).** Portable lessons, fixtures, and rubrics go back through
   PORK's promotion review. Organization data never does.

## 5. Flow 1 — Consuming PORK

**Pinned, generated, never edited.** Current PORK uses `capabilities/` and `knowledge/`;
the retired `stacks/` and `doctrine/` layout must not be restored.

- `npm run pork:sync` calls `python scripts/pork_librarian.py <capability> --format json` for
  the capabilities listed in `pork.config.json`. It writes `vendor/pork/<capability>.json`
  plus `pork.lock.json` containing the PORK commit, capability id, and a content hash per
  pack. Following PORK's own rule, vendored packs are generated output and are never edited.
- It runs at sync time, not request time, so the hosted workspace needs no Python and never
  reads a moving `main`.
- Provenance: `FrameworkVersion` and each capture record `porkCommit`, `porkCapabilityId`,
  and `porkPackHash`. A reviewer can see which version of the doctrine produced a candidate.

**First capabilities to consume:**

| Workspace use | PORK asset |
|---|---|
| Context Capture extraction instructions | `skill-pack.slack-operational-sensing`, `detect-operational-event`, `reconstruct-partial-event-order`, `collapse-chronology`, `entity-resolution` |
| Current-state answers over confirmed context (the `operational-context` skill) | `capability.operational-memory` (`reconstruct-current-state`, `retrieve-historical-knowledge`) |
| Later: decision packets for the Research Assistant | `context-to-decision` |

**Migration rule:** the current extraction prompt passes the synthetic evaluation. Replace it
with PORK-composed instructions only when the composed version passes the same evaluation.
Moving to canonical doctrine must not cost quality silently.

**Skills ownership:** PORK's rule is that every canonical `SKILL.md` lives in PORK. The
workspace's two skills (`skills/context-capture`, `skills/operational-context`) should be
promoted into PORK in a tool-contract form that names PORK tool ids, not workspace-specific
calls. The workspace then ships generated copies.

## 6. Flow 2 — Workspace as a PORK Tool Implementation

PORK tool files currently declare only id, title, status, and description. This needs:

1. **In PORK:** add `interface:` (input and output JSON Schema) and `guarantees:` (for
   example `authorized_only`, `stable_provenance_ids`, `reviewed_only_by_default`) to
   `evidence-retrieval`, `operational-memory-search`, and `relationship-traversal`. Add an
   `implementations:` list, for example:
   `{ runtime: ai-enablement-workspace, transport: mcp, tool: search_context, verified_at, conformance: <result id> }`.
2. **In the workspace:** make the MCP tools conform. Either expose PORK-named aliases
   (`evidence_retrieval` → `get_evidence`, and so on) or document a one-to-one mapping.
   Conformance tests run PORK's contract fixtures against the MCP server over the in-memory
   transport already used by the evaluation.
3. **PORK workbench:** show *defined and validated* versus *directly executable via
   ai-enablement-workspace (MCP), verified <date>*. This addresses the product boundary PORK
   already names.

Permission guarantees stay the workspace's job. The contract states them; the workspace
enforces them. PORK never receives the data.

## 7. Flow 3 — Agent School Test Runs in the Workspace

**The problem:** PORK can assemble an agent (role + capabilities + tools + curriculum) and
structurally score a response. It cannot give the agent a realistic, safe world to act in.

**The workspace provides the sandbox:**

- A school principal and scratch database per run (the evaluation harness already creates
  one), fixture-only source grants, and the same MCP tools the agent will use in real work.
  The same doors are opened on synthetic rooms, so behavior tested equals behavior used.
- Hard lock: a school run can only use `FIXTURE_*` grants. Live grants are refused, the way
  the recorded extractor already refuses live sources.

**Run loop:**

```text
PORK agent role + curriculum + pinned packs
      │  evaluate.py prepare <evaluation-id>      → run packet
      ▼
Workspace school sandbox (fixtures, scratch DB, MCP tools)
      │  agent works through Codex / Claude / in-app model
      │  workspace deterministic checks (gold-based, 14+ checks)
      ▼
pork-runtime-run envelope { evaluation_id, capability, run_id, trace_id, agent{id,version,runtime:"ai-enablement-workspace"} }
      │  evaluate.py score        → structural result
      │  evaluate.py review       → agent recommendation (semantic)
      │  human review             → approval (human_required)
      ▼
PORK results + reviews (append-only)
```

**Registering the existing evaluation in PORK:**
`evaluation.context-capture.turner-ap` points to the synthetic corpus and gold labels. It uses
the `evidence-grounded-decision` rubric, or a new `operational-context-fidelity` rubric
covering provenance, chronology separation, trap handling, and permission boundaries, with
`human_required` approval. Its fixture is synthetic, which satisfies PORK's promotion rule.

**Second domain:** PORK already holds fixtures in other domains (vendor change, financial
intelligence, investigative timelines). A non-AP corpus built from one of these guards the
workspace against tuning to one story. This is the same requirement as in the SAME plan.

## 8. Flow 4 — Gate to the Real World

An agent or capability version may run against **live** sources in the workspace only when
PORK records a passing, human-approved result for that exact `porkPackHash` and agent
version.

- The workspace admin view shows: *"Operational Memory v<hash> — passed
  evaluation.context-capture.turner-ap, approved by <person> on <date>."*
- Enabling it is an audited admin action. It maps to the workspace's rule that frameworks and
  connectors are admin-approved.
- A changed pack hash (PORK updated) invalidates the gate until re-evaluated. This is the
  workspace's "material edit invalidates approval" rule applied to doctrine.
- Tier rules still apply on top: school approval never grants L1 write access or L2
  automation.

## 9. Flow 5 — Returning What Was Learned

Through PORK's `promote-pork` skill and review, only portable knowledge:

- Lessons, for example: "extractors create derived entities (thing + activity); stabilize
  before graph insertion"; "communication time ≠ operational time"; "strict envelope
  intersection limits sharing".
- Synthetic fixtures, gold labels, and rubrics.
- Canonical versions of the workspace skills (§5).

Never: confirmed facts, entity names from real organizations, evidence, or review decisions
about real people. SAME training signals flow to SAME, not PORK.

## 10. Phases

**K0 — Decisions (below).** No code.

**K1 — Pinned consumption.**
- `pork.config.json`, `npm run pork:sync`, `vendor/pork/`, `pork.lock.json`.
- PORK provenance fields on framework versions and captures, shown in the review screen on
  demand.

Exit: the lock verifies, and the provenance appears on a capture.

**K2 — Tool contracts.**
- In PORK: interface schemas and an `implementations` list for the three tools.
- In the workspace: MCP conformance tests, plus aliases or a mapping.
- PORK workbench: executable-versus-defined status.

Exit: PORK marks three tools as executable through the workspace, backed by a passing
conformance result.

**K3 — School sandbox and runtime adapter.**
- In the workspace: a school-run command that emits a `pork-runtime-run` envelope.
- In PORK: register `evaluation.context-capture.turner-ap` and its rubric.
- Record the first run with an agent semantic review and your human approval.

Exit: one end-to-end school run recorded in PORK.

**K4 — Composed extraction.** Replace the handwritten extraction prompt with PORK-composed
skills, pinned by hash.

Exit: the composed version passes the synthetic evaluation in both domains.

**K5 — Real-world gate.**
- Admin enablement bound to an approved pack hash; invalidated when the hash changes.
- Required before live Gmail and Slack use any PORK-composed capability.

**K6 — Promotion loop.** Promote the first lessons and the workspace skills into PORK
through review.

## 11. Decisions Needed

1. **PORK version semantics** (already on PORK's backlog). Pin by commit and content hash
   now, or tag releases first? Recommend commit + hash now, with releases later.
2. **Where canonical skills live.** Recommend PORK holds the canonical Context Capture
   skills and the workspace ships generated copies.
3. **Tool naming.** Rename the workspace MCP tools to PORK ids, or keep the current names
   with aliases or a mapping? Recommend aliases, so Codex and Claude configurations already
   in use keep working.
4. **Who approves school runs.** PORK's `human_required` needs a verified human reviewer
   identity (on PORK's backlog). Until then, only you approve school runs.
5. **Which runs gate live use.** Recommend that no PORK-composed capability touches live
   Gmail or Slack without a K5 approval. The current handwritten extraction continues under
   the existing Phase 5/6 plan until K4 lands.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Three systems blur together | Section 2 table as doctrine in all three repositories; each flow is one-directional |
| PORK assets are `canonical-draft` and tools are interface-only | Consume only packs that pass workspace evaluation; executable status only after conformance |
| Doctrine drift after PORK updates | Hash-pinned lock; gate invalidation on change; re-evaluate before re-enabling |
| Organization data leaking into PORK | Promotion limited to synthetic and portable assets; PORK promotion review; school runs use fixtures only |
| Structural scoring mistaken for quality | Workspace deterministic checks + PORK semantic review + human approval, all required |
| Python dependency in a TypeScript app | PORK runs only at sync time and in school runs, never at request time |
