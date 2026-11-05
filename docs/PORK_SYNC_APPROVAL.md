# PORK One-Time Sync — Approved Snapshot

Generated: 2026-10-30T10:21:48.547Z
PORK revision: `5225fd6c7a276d9abe5f546aed1e02cfc0a76ced`
Source state: **uncommitted — review/sandbox only**

## Workspace implementation files

- `pork.config.json` — declares the catalog scope and suggested approval state.
- `scripts/pork-sync.mts` — creates the pinned catalog and approval inventory.
- `src/lib/context/pork.ts` — verifies and reads the pinned catalog.
- `src/app/library/page.tsx` — presents the synchronized enablement library.
- `src/app/library/approval/page.tsx` — presents the per-file approval inventory in the build.
- `src/components/enablement-workspace.tsx` — links Shared tools to the library.
- `src/app/globals.css` — styles the library view.

## Generated snapshot files

- `vendor/pork/catalog.json` — exact content plus hashes for the selected portable assets.
- `vendor/pork/context-capture.json` — assembled capability already consumed by Context Capture.
- `pork.lock.json` — source revision, hashes, counts, permission classes, and approval records.
- `docs/PORK_SYNC_APPROVAL.md` — this review list.

## Approved PORK source assets

### skills (122)

- `skills/analyst/SKILL.md`
- `skills/analyze-investigative-timeline/SKILL.md`
- `skills/anomaly-detection/SKILL.md`
- `skills/context-capture/answer-from-reviewed-context/SKILL.md`
- `skills/legal-provenance-query/SKILL.md`
- `skills/governance/assess-change-rigidity/SKILL.md`
- `skills/bayesian-core/SKILL.md`
- `skills/brand-review/SKILL.md`
- `skills/campaign-plan/SKILL.md`
- `skills/causal-vs-correlational/SKILL.md`
- `skills/decision-reasoning/classify-approval-status/SKILL.md`
- `skills/financial-intelligence/classify-behavioral-event/SKILL.md`
- `skills/decision-reasoning/classify-operational-event-type/SKILL.md`
- `skills/collapse-chronology/SKILL.md`
- `skills/compliance-architecture/SKILL.md`
- `skills/component-lens/SKILL.md`
- `skills/construction-draw-review/SKILL.md`
- `skills/infrastructure/containerize-service/SKILL.md`
- `skills/content-creation/SKILL.md`
- `skills/context-card-compiler/SKILL.md`
- `skills/defensible-pause/SKILL.md`
- `skills/governance/detect-accidental-ossification/SKILL.md`
- `skills/operational-events/detect-operational-event/SKILL.md`
- `skills/legal-provenance-quality-check/SKILL.md`
- `skills/doc/SKILL.md`
- `skills/draft-content/SKILL.md`
- `skills/email-sequence/SKILL.md`
- `skills/decision-reasoning/establish-relative-context/SKILL.md`
- `skills/decision-reasoning/evaluate-business-impact/SKILL.md`
- `skills/evidence-integrity/SKILL.md`
- `skills/evidence-weighting/SKILL.md`
- `skills/decision-reasoning/expand-connected-context/SKILL.md`
- `skills/decision-reasoning/explain-change/SKILL.md`
- `skills/context-capture/extract-candidate-operational-context/SKILL.md`
- `skills/context-capture/frame-bounded-capture/SKILL.md`
- `skills/fraud-hypothesis-testing/SKILL.md`
- `skills/legal-evidence-provenance-dossier/SKILL.md`
- `skills/human-hesitation-analysis/SKILL.md`
- `skills/financial-intelligence/identify-behavioral-event/SKILL.md`
- `skills/imagegen/SKILL.md`
- `skills/knowledge-synthesis/SKILL.md`
- `skills/legal-provenance-event-ledger/SKILL.md`
- `skills/okf-knowledge-sidecar/SKILL.md`
- `skills/openai-agent-architect/SKILL.md`
- `skills/openai-automation-architect/SKILL.md`
- `skills/openai-codex-cloud-delegation/SKILL.md`
- `skills/openai-codex-workflow/SKILL.md`
- `skills/openai-controlled-remediation/SKILL.md`
- `skills/openai-conversation-state/SKILL.md`
- `skills/openai-docs/SKILL.md`
- `skills/openai-file-search-architect/SKILL.md`
- `skills/openai-high-stakes-ops/SKILL.md`
- `skills/openai-mcp-architect/SKILL.md`
- `skills/openai-observability/SKILL.md`
- `skills/openai-primitive-selector/SKILL.md`
- `skills/openai-procurement-contingency-planning/SKILL.md`
- `skills/openai-procurement-historical-context/SKILL.md`
- `skills/openai-procurement-lookahead/SKILL.md`
- `skills/openai-retrieval-architect/SKILL.md`
- `skills/openai-secure-mcp-tunnel/SKILL.md`
- `skills/openai-shell-workflow-architect/SKILL.md`
- `skills/openai-skill-author/SKILL.md`
- `skills/openai-tooling-architect/SKILL.md`
- `skills/openai-workflow-architect/SKILL.md`
- `skills/operational-delta-analysis/SKILL.md`
- `skills/operational-intelligence/SKILL.md`
- `skills/operational-memory/SKILL.md`
- `skills/operator-communication/SKILL.md`
- `skills/platform-voice-calibration/SKILL.md`
- `skills/playwright/SKILL.md`
- `skills/plugin-creator/SKILL.md`
- `skills/posterior-update-engine/SKILL.md`
- `skills/legal-competing-evidence-descriptions/SKILL.md`
- `skills/probabilistic-risk-analysis/SKILL.md`
- `skills/project-kickoff-session-lifecycle/SKILL.md`
- `skills/promote-pork/SKILL.md`
- `skills/audit-ready-report/SKILL.md`
- `skills/control-mapping/SKILL.md`
- `skills/document-diff/SKILL.md`
- `skills/entity-resolution/SKILL.md`
- `skills/financial-intelligence/event-classification/SKILL.md`
- `skills/financial-intelligence/event-identification/SKILL.md`
- `skills/evidence-chain/SKILL.md`
- `skills/exception-triage/SKILL.md`
- `skills/provenance-data-model/SKILL.md`
- `skills/provenance-intake/SKILL.md`
- `skills/decision-reasoning/recommend-action/SKILL.md`
- `skills/governance/recommend-change-governance/SKILL.md`
- `skills/decision-reasoning/reconstruct-current-state/SKILL.md`
- `skills/reconstruct-partial-event-order/SKILL.md`
- `skills/legal-admission-status/SKILL.md`
- `skills/legal-authentication-history/SKILL.md`
- `skills/legal-custody-transfer/SKILL.md`
- `skills/legal-evidence-intake/SKILL.md`
- `skills/decision-reasoning/retrieve-historical-knowledge/SKILL.md`
- `skills/review-agent/SKILL.md`
- `skills/code-quality/review-change-high-confidence/SKILL.md`
- `skills/scope-containment/SKILL.md`
- `skills/scout/SKILL.md`
- `skills/search-strategy/SKILL.md`
- `skills/code-quality/simplify-recent-code/SKILL.md`
- `skills/single-operator-leverage/SKILL.md`
- `skills/skill-creator/SKILL.md`
- `skills/skill-installer/SKILL.md`
- `skills/slack-digest/SKILL.md`
- `skills/slack-ops/SKILL.md`
- `skills/slack-search/SKILL.md`
- `skills/slack-summarize/SKILL.md`
- `skills/sora/SKILL.md`
- `skills/stitch-design-system/SKILL.md`
- `skills/synthetic-packet-review/SKILL.md`
- `skills/thread-collapse-engineering/SKILL.md`
- `skills/thread-collapse-handoff/SKILL.md`
- `skills/legal-evidence-derivation/SKILL.md`
- `skills/legal-evidence-discussion-log/SKILL.md`
- `skills/legal-evidence-introduction/SKILL.md`
- `skills/uncertainty-communication/SKILL.md`
- `skills/vendor-onboarding-laura/SKILL.md`
- `skills/vendor-verification/SKILL.md`
- `skills/visual-identity-discrimination/SKILL.md`
- `skills/voice-calibration/SKILL.md`
- `skills/wire-risk-review/SKILL.md`

### agents (12)

- `agents/change-refinement-specialist.md`
- `agents/context-capture-agent.md`
- `agents/deterministic-weight-reviewer.md`
- `agents/hard-case-curator.md`
- `agents/high-confidence-change-reviewer.md`
- `agents/human-review-operator.md`
- `agents/operational-memory-agent.md`
- `agents/README.md`
- `agents/same-experiment-reporter.md`
- `agents/same-feature-analyst.md`
- `agents/same-research-orchestrator.md`
- `agents/training-signal-auditor.md`

### workflows (6)

- `curricula/change-quality-agent.md`
- `curricula/context-capture-agent.md`
- `curricula/deployment-agent.md`
- `curricula/design-review-agent.md`
- `curricula/operational-memory-agent.md`
- `curricula/same-research-agent.md`

### capabilities (11)

- `capabilities/conflict-resolution/pack.yaml`
- `capabilities/context-capture/pack.yaml`
- `capabilities/context-to-decision/pack.yaml`
- `capabilities/entity-resolution/pack.yaml`
- `capabilities/financial-intelligence/pack.yaml`
- `capabilities/high-confidence-change-review/pack.yaml`
- `capabilities/operational-event-reconstruction/pack.yaml`
- `capabilities/operational-memory/pack.yaml`
- `capabilities/same-research/pack.yaml`
- `capabilities/simplify-recent-code/pack.yaml`
- `capabilities/slack-operational-sensing/pack.yaml`

### tools (17)

- `tools/bounded-context-capture/tool.yaml`
- `tools/change-state-retrieval/tool.yaml`
- `tools/evidence-retrieval/tool.yaml`
- `tools/immutable-source-citation/tool.yaml`
- `tools/operational-memory-search/tool.yaml`
- `tools/policy-retrieval/tool.yaml`
- `tools/agent-school/tool.yaml`
- `tools/evaluation-runner/tool.yaml`
- `tools/relationship-traversal/tool.yaml`
- `tools/repository-instruction-discovery/tool.yaml`
- `tools/resolution-precedent-search/tool.yaml`
- `tools/review-publication/tool.yaml`
- `tools/semantic-stabilization/tool.yaml`
- `tools/signal-contract-verification/tool.yaml`
- `tools/stitch-design/tool.yaml`
- `tools/targeted-verification/tool.yaml`
- `tools/version-control-inspection/tool.yaml`

### knowledge (13)

- `knowledge/financial-intelligence/behavioral-liquidity.md`
- `knowledge/design-systems/design-system-as-interface.md`
- `knowledge/identity-resolution/signal-integrity.md`
- `knowledge/evidence/evidence-grounding.md`
- `knowledge/evidence/fact-versus-inference.md`
- `knowledge/governance/governed-change-refinement.md`
- `knowledge/context-engineering/knowledge-context-skill-tool-separation.md`
- `knowledge/operational-state/operational-state.md`
- `knowledge/governance/permission-classes.md`
- `knowledge/communication/platform-voice-calibration.md`
- `knowledge/governance/recommendation-permission-execution.md`
- `knowledge/design-systems/screenshot-component-evidence.md`
- `knowledge/operational-state/semantic-stabilization-boundary.md`

### evaluations (25)

- `evaluations/chronology-collapse/long-record.yaml`
- `evaluations/context-capture/end-to-end/turner-ap.yaml`
- `evaluations/context-to-decision/atomic/contracts.yaml`
- `evaluations/entity-resolution/rubric.md`
- `evaluations/component-lens/end-to-end/add-elements-popover.yaml`
- `evaluations/rubrics/evidence-grounded-decision.yaml`
- `evaluations/financial-intelligence/atomic/contracts.yaml`
- `evaluations/rubrics/financial-intelligence.yaml`
- `evaluations/change-quality/end-to-end/high-confidence-change-review.yaml`
- `evaluations/investigative-timeline-analysis/cross-domain.yaml`
- `evaluations/operational-memory/scenarios/lab-001.md`
- `evaluations/same-research/scenarios/lab-002.md`
- `evaluations/financial-intelligence/end-to-end/oil-and-gas-family.yaml`
- `evaluations/rubrics/operational-context-fidelity.yaml`
- `evaluations/operational-event-reconstruction/atomic/contracts.yaml`
- `evaluations/operational-memory/rubric.md`
- `evaluations/operational-memory/end-to-end/foundation.yaml`
- `evaluations/rubrics/operational-memory.yaml`
- `evaluations/partial-event-ordering/three-clocks.yaml`
- `evaluations/same-research/rubric.md`
- `evaluations/change-quality/end-to-end/simplify-recent-code.yaml`
- `evaluations/stitch-design-system/end-to-end/source-grounded-design-md.yaml`
- `evaluations/context-to-decision/end-to-end/vendor-change.yaml`
- `evaluations/operational-event-reconstruction/end-to-end/vendor-change.yaml`
- `evaluations/financial-intelligence/end-to-end/venture-family.yaml`

### references (1)

- `references/schemas/operational-event.md`

## Intentionally excluded

- references/source-material and project examples
- evaluation fixtures, runs, results, reviews, and semantic comparisons
- generated PORK output, caches, application code, and temporary files

Approval of this snapshot does not authorize live-source access, confirmation, visibility widening, messaging, or downstream execution.
