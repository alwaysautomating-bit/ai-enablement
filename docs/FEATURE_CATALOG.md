# AI Enablement Workspace Feature Catalog

Status: Canonical product capability inventory
Last updated: 2026-09-29
Source: `FRAMEWORK_L0_L1_L2.md` plus the expanded feature and capability inventory

## Purpose

This catalog converts the product framework into a build-oriented hierarchy:

`Product area -> Epic -> Capability -> Tier -> Release -> Dependencies -> Acceptance criteria`

It is the canonical inventory of what the product is intended to support. It is not a sprint
plan or an estimate. Individual capabilities must be decomposed into user stories and
technical tasks before implementation.

## Product Rules

These rules apply to every feature and take precedence over local feature behavior.

1. Guardrails belong to the system. Unsafe or unauthorized choices are not presented.
2. The organization controls each user's tier floor and ceiling.
3. L0 and L1 users configure and reuse approved capabilities; only L2 users create new
   organizational capabilities.
4. Saving inputs or configuration for personal reuse is not the same as creating a new
   framework, skill, connector, automation, or shared template.
5. A routine may be configured and run manually at L1. Unattended or event-triggered
   execution requires L2 authorization and governance approval.
6. The first generated output is always a draft.
7. Every deliverable passes through `Generate -> Elevate -> Review -> Adjust -> Approve`.
8. Distribution, publication, or write-back remains locked until required approval is
   recorded.
9. Connectors are read-only by default. Write access is separately granted, scoped, and
   auditable.
10. Sensitive values are protected before model use whenever workspace policy requires it.
11. Privacy Scrubber reduces exposure; it is not represented as a compliance guarantee.
12. Every shared or promoted tool has an assigned steward and a retirement path.
13. Audit records are immutable and non-sensitive. Vault mappings are hard-deleted.
14. User-facing vocabulary is earned. Interfaces elicit and reflect the job in the user's
    language before revealing system terms, while keeping precise vocabulary available on
    demand.

## Tier Definitions

| Tier | Product boundary | May do | May not do |
|---|---|---|---|
| L0 | Guided Deliverables | Use role-curated frameworks, persistent context, and approved read-only connectors; review, approve, export, and save personal presets | Write to connected tools, chain frameworks, create organizational capabilities, or automate |
| L1 | Connected Workspace | Grant scoped write/action access, chain approved frameworks into manual workflows, configure repeatable routines, and compare historical runs | Run unattended jobs, add unapproved data sources, or edit governance |
| L2 | Builder Mode | Create frameworks, automations, extensions, and proposed governance changes | Bypass approval, introduce unapproved reach, or self-promote without review |
| Admin | Organization control plane | Set ceilings, approve models/connectors/builds, define policy, assign stewardship | Alter immutable audit history or access vault mappings outside defined service operations |

Tier labels may remain internal. The interface should expose available capabilities rather
than requiring users to understand the L0/L1/L2 vocabulary.

## Release Phases

| Phase | Outcome |
|---|---|
| R0 Foundation | Organizations, identity, workspaces, framework registry, runs, tiers, permissions, audit events |
| R1 Connected Guided Workspace | Research Assistant L0, persistent context, one read-only connector category, Source Review, and complete Review Gate |
| R2 Action Workspace | Explicit write/action access, audit of connector actions, and manual workflow chaining |
| R3 Privacy Service | Privacy Scrubber standard mode and isolated Ephemeral Identity Vault |
| R4 Routines | Repeatable manual routines, comparisons, change detection, reviewer routing |
| R5 Governed Automation | Scheduled and triggered execution, failure handling, approval before distribution |
| R6 Builder Mode | Framework/skill builder, extensions, governance review, technical monitoring |
| R7 Promotion | Promote Path, stewardship, support, versioning, retirement |
| R8 Workspace Expansion | SpeakSheet, Comms 101, Better Biz Docs, Reporting, HR/Manager, Daily Thinker |

Research Assistant is the recommended first workspace because it proves evidence handling,
provenance, confidence flags, and human review together. Final sequencing remains a product
decision until recorded in `DECISIONS`.

## Status Vocabulary

| Status | Meaning |
|---|---|
| Defined | Product intent is documented here |
| Needs design | User flow, policy, or boundary needs resolution |
| Ready for stories | Boundary and acceptance criteria are sufficient for decomposition |
| In build | Implementation has started |
| Verified | Acceptance criteria have passed |
| Deferred | Intentionally outside the current release |

All capabilities in this initial catalog are `Defined` unless noted otherwise.

---

## PF — Platform Foundation

### PF-01 Organizations, Identity, and Access

**Tier:** All / Admin
**Release:** R0
**Dependencies:** Authentication provider, organization data model
**Status:** Ready for stories

Capabilities:

- Multi-workspace organizations
- Users, roles, teams, and workspace membership
- Organization-controlled tier floors and ceilings
- Role-based access
- Workspace-specific permissions
- Workspace-specific model access
- Publishing and write permissions
- User and organization retention settings

Acceptance criteria:

- Every protected action is authorized server-side against organization, workspace, role,
  tier ceiling, and capability policy.
- A user cannot grant themselves a higher tier or broader connector/model access.
- Unauthorized options are absent from the interface and rejected by the API.
- Permission changes create immutable audit events.

### PF-02 Workspace and Framework Registry

**Tier:** All; creation at L2/Admin
**Release:** R0
**Dependencies:** PF-01

Capabilities:

- Multiple workspaces with distinct visual and interaction systems
- Shared platform services across workspaces
- Approved task and framework menus
- Reusable frameworks, skills, templates, and deliverable types
- Workspace-specific context, models, permissions, and governance
- Versioned framework definitions

Acceptance criteria:

- A framework declares required inputs, skill chain, output contract, review policy, privacy
  policy, allowed models, and minimum tier.
- Published framework versions are immutable; updates create a new version.
- A run always records the exact versions of every framework, skill, and policy used.
- Personal presets cannot become shared assets without L2 creation and promotion review.

### PF-03 Run and Deliverable Lifecycle

**Tier:** All
**Release:** R0
**Dependencies:** PF-02

Capabilities:

- Guided input collection
- One-time execution
- Run history and status
- Draft and revised outputs
- Saved outputs
- Deliverable generation and export
- Previous-run linkage
- Failed and cancelled run handling

Required lifecycle:

`draft -> validating -> privacy_check -> generating -> elevated -> in_review -> changes_requested -> approved -> distributed`

Terminal exception states:

`failed`, `cancelled`, `expired`

Acceptance criteria:

- State transitions are validated server-side and recorded with actor and timestamp.
- Generated content cannot move directly from `generating` to `approved`.
- Editing approved content creates a new revision and review cycle.
- Distribution is impossible before approval unless an explicit policy-defined exception is
  approved and audited.

### PF-04 Audit and Defensibility

**Tier:** All / Admin
**Release:** R0
**Dependencies:** PF-01, PF-03

Capabilities:

- Immutable audit history
- Actor, action, timestamp, policy, and object-version evidence
- Approval and revision history
- Model, source, connector, and framework provenance
- Non-sensitive Privacy Scrubber deletion events
- Defensibility record export

Acceptance criteria:

- Audit records contain no raw secrets or vault mappings.
- Material actions can be reconstructed without exposing deleted sensitive data.
- Audit events cannot be edited through product interfaces or normal service credentials.
- Approval evidence identifies the reviewed content version.

---

## GD — L0 Guided Deliverables

### GD-01 Guided Task Selection and Intake

**Tier:** L0+
**Release:** R1
**Dependencies:** PF-02, PF-03

Capabilities:

- Approved task menu
- Guided input forms
- Required-input checklists
- Topic, objective, audience, format, tone, length, and exclusions
- File upload, paste, and typed input
- Minimum-necessary-data guidance
- Privacy, model-use, citation, and hallucination guidance
- Guided prompt construction without exposing prompt engineering

Acceptance criteria:

- The user never starts from an unexplained blank prompt.
- Missing required inputs block generation and optional gaps produce warnings.
- Intake requests only information required by the selected framework.
- The system shows applicable privacy and model-routing behavior before processing.

### GD-02 Skill-Chain Execution

**Tier:** L0+
**Release:** R1
**Dependencies:** GD-01, PF-03

Capabilities:

- Preloaded skill chains
- Built-in domain best practices
- Draft generation
- Automatic second-pass evaluation and improvement
- Assumption, source, citation, tone, calculation, and privacy flags
- Structured deliverable templates

Acceptance criteria:

- The initial result is labeled and stored as a draft.
- A separate evaluation pass checks the draft against the framework contract.
- Refinement never silently removes citations, caveats, or review flags.
- The run records skill and model versions plus material assumptions.

### GD-03 Personal Reuse

**Tier:** L0+
**Release:** R1
**Dependencies:** GD-01

Capabilities:

- Save successful input configuration as a personal preset
- Rerun an approved framework manually
- Reuse personal defaults
- Save approved deliverables

Boundary:

- L0/L1 saving does not create a new skill, framework, connector, automation, or
  organization-visible template.

Acceptance criteria:

- Presets reference an approved framework version.
- Presets are private unless promoted through an authorized L2 workflow.
- A changed framework prompts the user to review incompatible preset fields.

### GD-04 On-Demand Connector Orientation

**Tier:** L0+
**Release:** R1
**Dependencies:** CX-02
**Status:** Ready for stories

Capabilities:

- Launch from the user's decision to bring in information from another tool
- Plain-language description before revealing the term `connector`
- Explanation of what connectors do and why they are useful
- Role-, framework-, and provider-specific use cases
- Read-only versus write/action explanation
- Included and excluded data explanation
- Access verification and disconnection guidance
- `See how this works` and `Skip to setup` paths
- Remember completed or skipped orientation without hiding future access to it

Acceptance criteria:

- The module does not interrupt users before they choose to add a connector.
- A knowledgeable user can skip directly to connector setup without penalty.
- Skipping the orientation does not skip the mandatory permission and scope confirmation.
- The first prompt describes the job without requiring the word `connector`.
- The term `connector` is introduced only after the user has selected the tool or expressed
  the need to bring its information into the workspace.
- Examples reflect the selected connector, intended framework, and user role when known.
- L0 guidance states clearly that the connector cannot post, edit, delete, send, or otherwise
  change information.
- The module remains available from connector setup and help after it is completed or
  skipped.
- Setup ends with verification of what the workspace can and cannot access.

### GD-05 Vocabulary-Earned Communication

**Tier:** All user-facing tiers
**Release:** R1
**Dependencies:** PF-01, PF-02
**Status:** Ready for stories

Capabilities:

- Elicit jobs, decisions, checks, and concerns in the user's language
- Reflect rules and outcomes without premature system vocabulary
- Separate job description from technical configuration
- Reveal precise terms after successful use
- Mirror terms the user adopts
- Provide glossary, tooltip, and advanced-detail access on demand
- Track term exposure and user adoption without using elapsed time as the trigger
- Require one primary outcome when discovery otherwise expands to "all of it"
- Preserve deferred outcomes for later work

Acceptance criteria:

- Each first-time flow inventories every technical or system term it may display.
- Each term defines the user action or evidence that earns its reveal.
- First-time copy uses job language until the reveal condition is met.
- Vocabulary reveals are informative and never block completion.
- Users can request precise vocabulary immediately through an on-demand affordance.
- Job-description flows do not ask users to choose connectors, APIs, models, MCP servers, or
  other implementation mechanisms.
- Configuration begins only after the job and primary outcome are understood.
- When multiple outcomes are selected, the flow requires one first priority and retains the
  others as later candidates.
- Experienced users and administrators can use precise terminology without forced
  simplification.

---

## RG — Review Gate

### RG-01 Generate and Elevate

**Tier:** All
**Release:** R1
**Dependencies:** GD-02, PF-03

Capabilities:

- Treat first output as draft
- Automatic refinement pass
- Surface material claims, assumptions, citations, calculations, tone, privacy, permissions,
  and reach concerns
- Prioritize review flags by severity

Acceptance criteria:

- Every completed generation enters `elevated`, never `approved`.
- Each flag points to a specific output span, source, calculation, permission, or run fact.
- The system distinguishes warnings from blocking findings.

### RG-02 Human Review and Revision

**Tier:** All
**Release:** R1
**Dependencies:** RG-01

Capabilities:

- Reviewer assignment
- Review comments
- Mark reviewed
- Requested revisions
- User and AI-assisted adjustments
- Version comparison
- Required acknowledgment of blocking flags

Acceptance criteria:

- Review activity is tied to a content version.
- Requested changes prevent approval until resolved or explicitly dispositioned.
- Reviewers can see what changed between revisions.
- AI adjustments remain drafts and never count as human approval.

### RG-03 Explicit Approval and Distribution Lock

**Tier:** All
**Release:** R1
**Dependencies:** RG-02

Capabilities:

- Explicit human approval
- Approval history
- Publish/export/write-back lock
- Defensibility record
- Tier-scaled review:
  - L0: deliverable plus sourcing
  - L1: deliverable, sourcing, and intended write/actions
  - L2: permissions, reach, and unattended impact

Acceptance criteria:

- Approval is an explicit authenticated action.
- Required flags and review tasks must be resolved first.
- Approval records reviewer, content version, timestamp, scope, and policy version.
- Material post-approval edits invalidate approval.

---

## SE — Source Review and Evidence

### SE-01 Source Intake and Qualification

**Tier:** L0+
**Release:** R1
**Dependencies:** PF-03

Capabilities:

- Source queue
- Title, date, excerpt, origin, and reason used
- Internal/public label
- Strong, limited, or conflicted quality status
- Recency and quality rules
- Approved-source list
- Mark reviewed, outdated, excluded, or requiring verification

Acceptance criteria:

- Source metadata and retrieval time are preserved.
- Excluded sources cannot support final claims.
- Quality labels have visible reasons derived from configured rules.
- Evidence may be reviewed before generation and must be reviewable before approval.

### SE-02 Claim Traceability

**Tier:** L0+
**Release:** R1
**Dependencies:** SE-01, RG-01

Capabilities:

- Claim-to-source traceability
- Sentence-level source reveal
- Quoted-versus-inferred distinction
- Unsupported-claim detection
- Conflict and disagreement detection
- Citation generation

Acceptance criteria:

- Material factual claims identify supporting evidence or are marked unsupported.
- Quotes retain exact source location and are distinguished from paraphrases and inference.
- Conflicting evidence remains visible and cannot be silently collapsed into certainty.
- Generated citations resolve to preserved source metadata.

---

## CX — Context and Connections

### CX-01 Persistent Context

**Tier:** L0+
**Release:** R1
**Dependencies:** PF-01, PF-02

Capabilities:

- Company glossary and terminology
- Brand voice and personal voice profiles
- Role and audience profiles
- Product, service, and policy context
- Approved examples
- Previous deliverables and reports
- Shared and personal context

Acceptance criteria:

- Every context item has scope, owner, source, version, sensitivity, and retention policy.
- Users can see which context affected a run.
- Organization context overrides incompatible personal defaults where policy requires.
- Context updates do not retroactively alter historical run evidence.

### CX-02 Connector Authorization

**Tier:** L0+ read use; L1+ write/action use; Admin approval; L2 configuration
**Release:** R1 onward
**Dependencies:** PF-01, PF-04

Capabilities:

- Guided connector walkthroughs
- Permission and exclusion explanation
- Verification of successful connection
- Read-only default
- Explicit write opt-in
- Internal knowledge and public research connections
- Google Drive, Microsoft 365, SharePoint
- Gmail, Outlook, Slack, Teams
- Airtable, Asana, Salesforce, QuickBooks
- Approved database connections

Acceptance criteria:

- Connector authorization is organization-approved and workspace-scoped.
- Requested scopes are shown before connection and stored in the audit record.
- L0 connector grants are read-only and cannot perform write or action operations.
- Write actions require a separately approved grant and pre-action review where configured.
- L2 builders may use approved connector capabilities but cannot introduce a new provider or
  scope without admin approval.

### CX-03 History, Comparison, and Detection

**Tier:** L1+
**Release:** R4
**Dependencies:** PF-03, CX-01

Capabilities:

- Historical run and prior-report comparison
- Period-over-period, fixed-baseline, and rolling-period comparison
- Change, exception, anomaly, and incomplete-data detection
- Distinguish new developments from repeated information
- Suppress low-value repetition
- Material-change and missing-input notifications

Acceptance criteria:

- Every comparison identifies its baseline and method.
- Missing or structurally incompatible data is surfaced rather than treated as zero.
- Detected changes link to underlying evidence.
- Suppression rules remain inspectable during review.

### CX-04 Context Capture

**Tier:** L0+
**Release:** R1
**Status:** In build — verified on synthetic evaluation 2026-09-29
**Dependencies:** PF-01, CX-02, SE-01
**Plan:** [CONTEXT_CAPTURE_ROADMAP.md](./CONTEXT_CAPTURE_ROADMAP.md)

Capabilities:

- Bounded investigation from one plain-language question
- Date range, label, sender, and channel scoping; direct messages excluded by default
- Read-only collection from Gmail and Slack through a common source adapter contract
- Evidence stored as source pointers with minimal excerpts, hashes, and access envelopes
- Model-backed extraction of candidate context into six buckets: people and entities,
  relationships, decisions, responsibilities, rules and exceptions, open questions
- Modality labelling for hypothetical, questioning, or uncertain statements
- Summary of what was found, read, and set aside
- Confirm, correct, or not-useful review per candidate item

Acceptance criteria:

- Collection never exceeds the declared scope, and scopes are shown before connection.
- Every candidate item cites at least one evidence span that verifies verbatim against the
  source; unverifiable spans are rejected.
- Candidate items cannot become operational facts without a recorded human review decision.
- Excluded, out-of-scope, and filtered messages are counted and visible.
- Audit events record capture lifecycle and review decisions without message content or
  credentials.

### CX-05 Operational Context Graph

**Tier:** L0+ read; L2 and Admin for schema extension
**Release:** R1 (single user); R2+ (shared)
**Status:** In build — verified on synthetic evaluation 2026-09-29
**Dependencies:** CX-04, PF-04

Capabilities:

- Resolved entities with source identities and aliases
- Deterministic identity matching plus reviewable candidate merges
- Temporal relationships with validity windows, basis, and confidence
- Supersession instead of overwrite when responsibilities or facts change
- Access envelopes inherited by derived assertions, facts, and relationships
- Permission-aware projections as the single read path for UI, models, and external clients
- Explicit, audited visibility widening

Acceptance criteria:

- A changed fact closes the prior relationship's validity window; history stays queryable.
- A derived item is never visible to anyone who cannot see all of its inputs unless a human
  has explicitly widened visibility.
- Context is filtered by permission before it reaches any model or external client.
- Entity merges not established by deterministic identifiers require review.

### CX-06 AI Client Access

**Tier:** L0+ read and capture start; L1+ for any action tool
**Release:** R1
**Status:** In build — verified on synthetic evaluation 2026-09-29
**Dependencies:** CX-05, PF-01

Capabilities:

- MCP server exposing reviewed operational context to Codex and Claude
- Capture start from an AI client, with review remaining in the workspace
- Personal client access tokens with scopes, revocation, and last-used tracking
- Portable `SKILL.md` packages for context capture and context lookup
- Provider-agnostic in-app extraction model interface (Claude and OpenAI)

Acceptance criteria:

- Every client call authenticates, authorizes server-side through the projection service,
  and produces an audit event naming the client.
- Unreviewed candidates are returned only on explicit request and are always labelled.
- No review, visibility-widening, or external write tool is exposed at L0.
- The same skills and server work from both Codex and Claude Code without modification.

---

## RT — Routines and Automation

### RT-01 Repeatable Manual Routines

**Tier:** L1+
**Release:** R4
**Dependencies:** GD-03, CX-03

Capabilities:

- Save a completed task as a routine configuration
- Run again manually
- Configure daily, weekly, monthly, or business-cycle intent
- Choose comparison method and output format
- Route output to a reviewer
- Create follow-up tasks after approval

Boundary:

- L1 may define and manually run a routine. Scheduling intent can be saved, but no job runs
  unattended until L2 automation is approved.

Acceptance criteria:

- A routine references approved framework and connector versions.
- Manual execution follows the full Review Gate.
- Converting a routine to unattended execution creates an L2 automation proposal.

### RT-02 Governed Automation

**Tier:** L2 / Admin
**Release:** R5
**Dependencies:** RT-01, RG-03, CX-02

Capabilities:

- Daily, weekly, monthly, business-cycle, scheduled, and event-triggered jobs
- Scheduled deliverable creation
- Reviewer routing and approval before distribution
- Failed-run and incomplete-input handling
- Significant-change notifications
- Action-item and follow-up-task generation

Acceptance criteria:

- Activation requires review of schedule, inputs, connectors, models, actions, recipients,
  failure behavior, and maximum reach.
- Generated outputs cannot distribute before required approval.
- Automation runs are idempotent where duplicate triggers are possible.
- Failures cannot silently publish partial output.

---

## PS — Privacy Scrubber and Ephemeral Identity Vault

### PS-01 Detection and Policy Classification

**Tier:** Notice at L0; enforced policy at L1+
**Release:** R3
**Dependencies:** PF-01, PF-04

Capabilities:

- Detect names, email addresses, phone numbers, and home addresses
- Detect account, policy, employee, customer, and Social Security numbers
- Detect banking information and tax identifiers
- Detect organization-specific identifiers and sensitive free text
- Custom sensitive-data patterns
- Entity counts and detection review
- Exclude documents from processing
- Organization-specific handling policies

Acceptance criteria:

- Detection results identify entity type, location, confidence, and proposed handling.
- Policy decides whether processing may continue, requires review, or must route elsewhere.
- Users cannot override organization-prohibited processing.
- Detection telemetry contains no raw sensitive values.

### PS-02 Transformation and Isolated Token Vault

**Tier:** L1+ automatic; available to approved L0 runs
**Release:** R3
**Dependencies:** PS-01, separate encrypted infrastructure

Capabilities:

- Permanently remove, partially mask, or stable-tokenize values
- Preserve last four digits where policy allows
- Keep explicitly allowed values
- Stable tokens within a run
- Separate encrypted mapping database
- Model isolation from token map
- Standard masking, strict de-identification, and restricted-environment modes

Acceptance criteria:

- The model never receives vault credentials or original mapped values.
- Tokens are unique and stable within their authorized run scope.
- The main application database never stores reversible mappings.
- Restricted mode prevents external-model processing and routes only to approved environments.

### PS-03 Restoration, Rescan, and Destruction

**Tier:** L1+ / governed per workspace
**Release:** R3
**Dependencies:** PS-02, RG-02

Capabilities:

- Restore only recognized tokens and approved fields
- Leave selected fields masked
- Never use literal global find-and-replace
- Re-scan after model processing and after restoration
- Automatic expiration
- Manual cancellation and destruction
- Hard-delete mappings and verify deletion
- Non-sensitive deletion audit event

Acceptance criteria:

- Restoration resolves against the canonical token map only.
- Strict mode requires review before any restoration and may prohibit it entirely.
- Expiration and cancellation make mappings irrecoverable through application credentials.
- A non-sensitive event records token count, run, completion time, and deletion verification.

### PS-04 Privacy Product Communication

**Tier:** All
**Release:** R3
**Dependencies:** PS-01

Capabilities:

- Best-practice privacy-aid positioning
- Warning that masking is not automatic anonymization or compliance
- Warning that some data may not be processed externally at all
- Plain-language explanation of active handling mode

Acceptance criteria:

- Claims never state or imply automatic HIPAA, GLBA, GDPR, CMMC, or industry compliance.
- Users see applicable restrictions before data leaves the approved environment.

---

## BM — L2 Builder Mode

### BM-01 Framework and Skill Builder

**Tier:** L2
**Release:** R6
**Dependencies:** PF-02, RG-03, CX-02

Capabilities:

- Build and test frameworks
- Compose reusable approved skills
- Add deliverable types
- Create organization-specific workflows
- Build from existing bundles
- Define input, output, review, privacy, model-routing, and data-handling rules
- Private and test states

Acceptance criteria:

- New builds begin private and cannot enter shared menus directly.
- Builder previews show data reach, permissions, models, review requirements, and outputs.
- Test runs use isolated data and remain clearly distinguished from production.
- Governance review is required before production activation.

### BM-02 Extensions and Small Internal Tools

**Tier:** L2
**Release:** R6
**Dependencies:** BM-01

Capabilities:

- Small internal tools and narrow workflow applications
- Workspace extensions
- Organization-specific interfaces
- Coding-agent scaffolding
- Engineering review and architecture support
- Technical-health monitoring

Acceptance criteria:

- Each extension has a narrow declared purpose, owner, dependency list, and blast radius.
- Extensions use approved bundles and connectors by default.
- New data sources, actions, or model routes require separate admin approval.
- Health checks cover runtime, connector, model, and framework-version compatibility.

---

## PP — Promote Path and Stewardship

### PP-01 Nomination and Promotion Review

**Tier:** Nominate at all tiers; build/promote at L2/Admin
**Release:** R7
**Dependencies:** BM-01, PF-04

Capabilities:

- Private build
- Self-nomination or nomination by another employee
- Light promotion review
- Stranger-usable input and failure-path validation
- Named, anonymous, or organization-owned attribution
- Shared release into L0/L1 menus

Acceptance criteria:

- Promotion review is distinct from the build's safety/governance approval.
- The builder controls attribution even when another person nominates the build.
- Promotion requires verified inputs, review flow, permissions, documentation, and ownership.
- Released versions are immutable and rollback-capable.

### PP-02 Stewardship, Support, and Retirement

**Tier:** L2/Admin
**Release:** R7
**Dependencies:** PP-01

Capabilities:

- Attached support thread
- Technical and practice stewardship
- One-person ownership for suitably small tools
- Split ownership when a tool outgrows one person
- Usage and technical-health monitoring
- Feedback collection
- Version updates
- Deprecation and retirement

Acceptance criteria:

- Promotion is blocked until required stewardship is accepted.
- Every promoted build has health status, last review, support route, and retirement criteria.
- Deprecated tools stop accepting new runs on the configured date while preserving history.
- Stewardship transfer is explicit and audited.

### PP-03 Open Door

**Tier:** Observe at all tiers; host at L2/Engineering
**Release:** R7

Capabilities:

- Voluntary observation without tier change
- Engineering- and builder-led walkthroughs
- Architecture, skill-chain, review-flow, and promotion explanations
- Reusable learning sessions

Acceptance criteria:

- Observation never grants production data, credentials, or builder permissions.
- Demonstrations use approved examples or sanitized data.
- Participation is voluntary and does not alter tier eligibility automatically.

---

## OA — Organization Administration

### OA-01 Policy Control Plane

**Tier:** Admin
**Release:** R0-R6
**Dependencies:** PF-01, PF-04

Capabilities:

- Define and assign tiers
- Approve models, connectors, data sources, and restricted environments
- Define privacy rules, sensitive classes, retention, and vault expiration
- Define review, publishing, and write permissions
- Configure workspace templates and recurring routines
- Manage company glossary, shared context, voice, brand, and source-quality standards

Acceptance criteria:

- Policy is versioned, effective-dated, and evaluated server-side.
- Every run records the policy version applied.
- More restrictive policy changes affect future actions without rewriting historical evidence.
- Policy simulation shows affected users, workspaces, routines, and automations before publish.

### OA-02 Operational Oversight

**Tier:** Admin
**Release:** R2-R7
**Dependencies:** PF-04

Capabilities:

- Reports awaiting review
- Failed runs and incomplete inputs
- Audit-log review
- Promoted-tool review
- Steward assignment
- Usage and health monitoring
- Shared-tool deprecation

Acceptance criteria:

- Admin views are scoped to authorized organizations and data classes.
- Alerts link to the exact run, policy, build, or review requiring action.
- Operational dashboards do not expose vault mappings or unnecessary sensitive content.

---

## WS — Workspace Catalog

Workspace epics share PF, GD, RG, SE, CX, RT, and PS services. Each workspace must define its
own input contract, skill chain, deliverable contract, review policy, privacy policy, model
policy, and acceptance suite.

### WS-RA Research Assistant

**Tier:** L0-L2
**Release:** R1 core; R2/R4 expansion
**Dependencies:** GD, RG, SE

Capabilities:

- Define and refine research question, scope, topics, exclusions, and recency
- Select internal and public sources
- Search connected systems and public information
- Extract evidence from PDFs and other approved documents
- Compare sources, detect disagreement, and assess quality
- Preserve citations, notes, and evidence tables
- Market, competitor, vendor, regulatory, customer, product, operational, and literature research
- Executive briefs and recurring weekly research
- Prior-report comparison and meaningful-change highlighting
- Source review before approval

Workspace acceptance criteria:

- Every material finding is traceable to evidence or marked unsupported.
- Recency, exclusion, and source-scope rules are enforced during retrieval.
- Contradictory evidence is visible in the deliverable and Review Gate.
- Recurring research distinguishes new information from previously reported findings.

### WS-SS SpeakSheet

**Tier:** L0-L2
**Release:** R8
**Dependencies:** GD, RG, PS; spreadsheet processing service

Capabilities:

- Upload and inspect workbook structure
- Explain data relative to user role and objective
- Clean and standardize columns; find missing values, duplicates, and anomalies
- Create and explain formulas including VLOOKUP, XLOOKUP, and SUMIFS
- Create pivot tables, dashboards, charts, KPI recommendations, and visualizations
- Budget-versus-actual, month-over-month, year-over-year, forecast, and cash-flow analysis
- AP/AR aging, reconciliation, variance, Pareto, cohort, segmentation, and root-cause analysis
- Financial and executive summaries
- Row-level traceability, formulas, assumptions, and excluded-data disclosure
- Identity masking and approved restoration

Workspace acceptance criteria:

- Original files remain recoverable and are never silently overwritten.
- Every conclusion traces to cells, rows, formulas, or explicit assumptions.
- Generated formulas are validated against representative test data.
- Exclusions, transformations, and restored identifiers are reviewable before export.

### WS-CM Comms 101

**Tier:** L0-L2
**Release:** R8
**Dependencies:** GD, RG, PS, CX-01

Capabilities:

- Personal and company voice
- Audience, channel, tone, formality, and length controls
- Email, Slack, Teams, status, executive, meeting, client, escalation, decision, follow-up,
  and proposal-summary outputs
- Convert one source into multiple channel formats
- Detect inappropriate length and emotionally charged language
- Improve clarity and professionalism while preserving user voice
- Use approved prior communications as context
- Warn or mask before sensitive external communication

Workspace acceptance criteria:

- Output identifies intended audience and channel.
- Voice adaptation does not silently override policy or factual content.
- External-channel privacy checks occur before generation and again before distribution.
- Multi-channel outputs retain consistent facts while adapting format and length.

### WS-BD Better Biz Docs

**Tier:** L0-L2
**Release:** R8
**Dependencies:** GD, RG, SE, PS

Capabilities:

- Proposals, business cases, reports, executive memos, SOPs, policies, project plans,
  client deliverables, presentations, and executive summaries
- Outlines and required-section frameworks
- Brand, design system, layout, pricing, comparison, chart, and graphic templates
- Citation support, page preview, revision workflow, and quality checklist
- Tone, style, and export-ready formatting
- Approved client-identifier restoration

Workspace acceptance criteria:

- Required sections and quality checks are framework-enforced.
- Claims, pricing, comparisons, and charts retain source or calculation evidence.
- Page preview matches exported output within supported-format tolerances.
- Restored identifiers pass privacy review before export.

### WS-RP Reporting

**Tier:** L0-L2
**Release:** R8
**Dependencies:** CX-03, RT, RG, SE

Capabilities:

- Weekly/monthly operating, budget, pipeline, claims, service, portfolio, AP, AR, leadership,
  customer-feedback, and KPI reporting
- Completeness, target, previous-period, and rolling-period comparisons
- Material-change explanation, risk identification, and exception flagging
- Executive summaries and action items
- Human review before distribution

Workspace acceptance criteria:

- Reports identify reporting period, baseline, completeness, and materiality rules.
- Missing data is distinguished from zero or no change.
- Exceptions and summaries link to calculations and evidence.
- Distribution remains approval-gated.

### WS-HR HR and Manager

**Tier:** L0-L2; restricted by policy
**Release:** R8
**Dependencies:** PS, RG, SE, restricted-environment routing

Capabilities:

- Performance evaluations, improvement plans, coaching, one-on-one prep, promotion packets,
  goal summaries, and feedback
- Complaint intake and summary, incidents, investigations, exit interviews, employee
  relations, accommodations, ethics hotline, and case timelines
- Tone neutralization, fact/opinion separation, emotionally charged language detection,
  unsupported claims, and evidence organization
- Identity masking by default
- Approved restoration after review
- Restricted-environment routing for higher-risk matters

Workspace acceptance criteria:

- Workspace policy determines which use cases are permitted and where processing occurs.
- Identity masking is default and cannot be bypassed when policy requires it.
- Facts, allegations, opinions, and model inferences are visibly distinct.
- High-risk outputs require designated reviewer roles before restoration or export.

### WS-DT Daily Thinker

**Tier:** L0-L2
**Release:** R8
**Dependencies:** GD-03, CX-01, RT-01

Capabilities:

- One structured daily question
- Role, industry, general AI use, reflection, process, assumption, experiment, explanation,
  and connection prompts
- Private response and AI discussion
- Save insight; turn it into an action, experiment, task, or personal routine
- Propose reusable workflow or workspace-context additions
- Review patterns, recurring problems, automation candidates, and information gaps
- Build practical AI fluency over time

Boundary:

- L0/L1 may create private actions, experiments, and routine proposals. Creating a shared
  workflow or active automation requires L2 and the applicable review path.

Workspace acceptance criteria:

- Responses are private by default with explicit scope controls.
- Pattern analysis uses only authorized historical responses.
- Suggested automation or context changes remain proposals until reviewed at the required tier.
- Deleting private responses follows the configured retention policy.

---

## Cross-Cutting Quality Requirements

Every epic must define and verify:

- Authorization at UI and API boundaries
- Empty, loading, error, cancellation, retry, and partial-data states
- Keyboard and screen-reader accessibility
- Responsive behavior without overlapping or truncated controls
- Immutable version and audit evidence
- Data retention, deletion, and export behavior
- Model and connector failure behavior
- Human-review and approval behavior
- Privacy classification and minimum-necessary-data handling
- Observability without logging sensitive content
- Representative unit, integration, authorization, and end-to-end tests
- Vocabulary inventory, reveal conditions, plain-language fallback, and on-demand precision
  path for every first-time user flow

## Decisions Still Required

These items must be recorded in `DECISIONS` before their dependent stories are considered
implementation-ready:

1. Confirm the standalone product name and repository location.
2. Confirm the application stack.
3. Confirm Research Assistant as the first end-to-end framework.
4. Decide whether persistent organization context is admin-authored, inferred and reviewed,
   or a hybrid.
5. Define initial connector category and provider.
6. Define model-provider and approved-model strategy.
7. Define restricted-environment routing targets.
8. Define source-quality scoring rules for the first Research Assistant release.
9. Define which exports or downloads count as distribution for approval locking.
10. Define retention periods for runs, sources, deliverables, personal voice, and private
    Daily Thinker responses.

## Traceability Rule

Future backlog items, stories, schema objects, API routes, and tests should reference the
applicable feature ID from this catalog. New capabilities must be added here or explicitly
identified as local implementation details. A release is not feature-complete until its
catalog acceptance criteria are verified.
