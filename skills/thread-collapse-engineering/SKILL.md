---
name: thread-collapse-engineering
description: Collapse long coding sessions, debugging threads, PR/deployment discussions, and architecture conversations into source-linked engineering handoffs, validated current state, decision records, regression candidates, and reviewable documentation proposals. Use when engineering context must survive across sessions, contributors, repositories, or deployments. Use collapse-chronology for precise temporal reconstruction; use thread-collapse-handoff for nonengineering discussions.
---

# Thread Collapse — Engineering

Convert engineering conversation residue into actionable, verifiable engineering memory. A thread is evidence of work and intent, **not proof of repository or production state**. Produce a handoff a new engineer can use on day one, plus separately reviewable proposals for durable documentation, tests, and controls.

## Non-negotiable rules

1. Separate **said**, **implemented**, **tested**, **merged**, **deployed**, and **observed in production**. Never infer a later state from an earlier one.
2. Identify the latest supported state by tracking supersession, corrections, reversions, failed attempts, and conflicting claims. Do not use “latest message wins.”
3. Every consequential claim carries a locator (thread line/message, file path + revision, PR, test output, deployment ID) and verification status. Never invent paths, commit hashes, test results, or owners.
4. Preserve **why**: initial assumptions, failure mechanism, decision rationale, rejected alternatives, tradeoffs, and downstream effects.
5. Distinguish design intent from verified implementation. When repository access is unavailable, mark `THREAD-REPORTED / REPO-UNVERIFIED` and provide exact verification steps.
6. Do not promote candidate knowledge into canonical documentation, rules, production configuration, or automated training signals without the designated reviewer and verification gates.
7. Protect secrets, personal data, customer data, and credentials. Redact sensitive payloads and cite safe references instead.
8. Prioritize constraints, invariants, failure modes, interfaces, migrations, security boundaries, and recovery behavior over conversational narrative.
9. Treat test counts as evidence limited to their specific environment and run; do not claim comprehensive coverage.
10. Preserve unresolved contradictions. Never silently reconcile competing technical claims.

## Inputs and evidence hierarchy

Accept threads, chat exports, agent session logs, issue/PR discussions, build logs, commits, architecture notes, test outputs, and optional repository state. Record source name, timestamp if known, branch/revision if known, and coverage gaps. When available, verify against code, tests, CI, PR history, migration state, and deployment telemetry. Evidence from the current implementation outranks an earlier plan for **current behavior**; an explicit approved decision remains the source for **intent**. Conflicts require review.

Use statuses: `PROPOSED`, `IMPLEMENTED_UNVERIFIED`, `VERIFIED_LOCAL`, `VERIFIED_CI`, `MERGED`, `DEPLOYED`, `PRODUCTION_OBSERVED`, `SUPERSEDED`, `REVERTED`, `UNKNOWN`. Use `NOT_READY` if required verification is missing; `READY_FOR_REVIEW` only when the proposal has sufficient evidence; `APPROVED` only with a recorded reviewer decision.

## Workflow

### 1. Establish scope and baseline

Identify project, repository, branch, time window, feature/problem, intended outcome, participants/owners when known, and existing canonical docs. State what sources are missing. Inventory touched files/modules and external dependencies without pretending thread references are verified paths.

### 2. Reconstruct engineering change and current state

Extract discrete change records: initial condition -> attempted change -> observed result -> correction -> final supported state. Include chronology when ordering determines meaning; invoke `collapse-chronology` for complex partial ordering. Track each change's status, code location, evidence, tests, and supersession links.

### 3. Extract durable engineering knowledge

Capture:
- Architecture decisions and rejected alternatives, with rationale and consequences.
- Domain definitions, invariants, preconditions, postconditions, thresholds, algorithms, edge cases, and state transitions.
- API, schema, data migration, compatibility, authorization, privacy, and operational contracts.
- Root causes and failure mechanisms, including why prior tests or assumptions missed the issue.
- Reusable implementation patterns, guardrails, runbooks, and anti-patterns.
- Dependencies, ownership, environment/setup requirements, and links to existing docs.

Distinguish `FACT`, `DECISION`, `INFERENCE`, `HYPOTHESIS`, `PROPOSAL`, and `OPEN_QUESTION`.

### 4. Convert discoveries into verification and regression candidates

For each material bug or invariant, specify: expected behavior; observed failure; exact input or minimal reproducible example; intended implementation/algorithm; boundary/threshold semantics; negative cases; deterministic unit fixtures; property/metamorphic tests; cross-language parity tests where applicable; integration/CI gate; and command or procedure to reproduce. Flag missing fixtures or inaccessible code. Do not claim a candidate test already exists.

### 5. Identify documentation destinations and downstream impact

Route each candidate to its best destination, avoiding duplication:
- ADR for durable architectural decisions and tradeoffs.
- Module/API contract or schema docs for expected behavior.
- Tests/fixtures/CI for executable invariants and regressions.
- Runbook for deployment, rollback, recovery, troubleshooting, and operational checks.
- Onboarding guide for setup, dependencies, and surprising constraints.
- Issue/backlog for unimplemented work and open questions.
- Engineering memory index for source-linked cross-project discoveries and pointers to canonical artifacts.

Mark affected callers, integrations, data, migrations, releases, model training, and documentation that may now be stale.

### 6. Draft proposals, then gate promotion

Each documentation or code candidate must include: destination, proposed text/change, source links, supporting verification, affected versions, reviewer/owner if known, risk, and acceptance criteria. Queue as `NOT_READY` if unverified; otherwise `READY_FOR_REVIEW`. Reviewer may `ACCEPT`, `AMEND`, `REJECT`, or `DEFER`, with rationale and immutable decision history. Only accepted and verified items can be promoted into authoritative docs or automation. Approval never substitutes for required tests or deployment checks.

### 7. Produce the next-session briefing

Give the next engineer a precise starting point: what exists, what has actually been verified, what must not change, what is blocked, what to inspect first, how to reproduce, what tests to run, and the next explicit action with owner and acceptance criteria. Surface blockers as `NOT_READY` with exact missing dependency.

## Output contract

Use these headings. Keep entries concise but source-linked. Say `None identified` where appropriate.

### Engineering Thread Scope
Project/repo; branch/revision; sources and dates; objective; evidence limitations.

### Current Verified State
Component | Claimed state | Verified state | Evidence | Confidence | Missing verification.

### Change and Supersession Ledger
Change ID | Before | Attempt | Result | Correction/final state | Status | Source.

### Architecture and Decision Records
Decision ID | Context | Decision | Alternatives | Rationale | Consequences | Evidence | Proposed ADR destination.

### Contracts and Invariants
Contract ID | Scope | Exact intended behavior | Boundaries/thresholds | Evidence | Implementation location | Verification status.

### Bugs, Root Causes, and Lessons
Failure | Reproducer | Root cause (verified or hypothesized) | Fix | Regression exposure | Evidence.

### Regression and CI Candidates
Test/fixture | Input | Expected output/invariant | Test level | Command/gate | Status | Evidence.

### Dependencies, Security, and Operational Impact
Affected systems, data, permissions, migrations, observability, rollback, and downstream consumers.

### Documentation Promotion Queue
Candidate | Target artifact | Draft/summary | Source | Verification | Owner/reviewer | Readiness | Acceptance criteria.

### Open Questions and Conflicts
Question/conflict | Why it matters | What evidence resolves it | Owner if known.

### Next Required Actions
Priority | Exact action | Owner | Prerequisite | Done-when condition.

### Day-One Engineering Handoff
Where to start; established truths; things not to assume; commands to verify; blockers; next action.

## Optional structured record

For automated ingestion, emit records with stable IDs and fields: `kind`, `project`, `component`, `claim`, `epistemic_type`, `state`, `source_locators`, `code_refs`, `version_scope`, `verification`, `supersedes`, `dependencies`, `destination`, `review_status`, `owner`, `acceptance_criteria`. Do not fabricate unknown values; use `null` or `UNKNOWN`.

## Quality gates

Before finishing, verify that (a) every high-impact claim has a locator, (b) reported and verified states are separated, (c) superseded decisions cannot reappear as current guidance, (d) regressions are specified with reproducible expectations, (e) unapproved proposals are not presented as canonical, (f) sensitive data is excluded, and (g) the next engineer can start without replaying the thread.
