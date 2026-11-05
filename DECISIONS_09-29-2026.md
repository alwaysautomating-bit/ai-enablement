# Architecture Decisions

## 07-26-2026

### Decision

Three-tier workspace structure: L0 (Guided Deliverable), L1 (Connected Workspace), L2
(Builder Mode). Each tier is fully usable on its own, not a stripped demo of the next.
Guardrails scale with the workspace tier, never with individual employee discipline.

### Reason

Matches the requirement that the workspace expand in capability as an org's AI adoption
matures. Puts the guardrail burden on the system/architecture rather than on employees
remembering policy — mirrors the "control plane decides who decides" thesis already used in
Icarus.

### Alternatives Considered

Single flat workspace with permission flags per user (rejected — makes guardrails a matter of
individual configuration rather than structural tier design, harder to reason about and audit).

### Consequences

Below L2, nothing new gets created — only used. That distinction becomes the load-bearing
line for the whole framework. Tier boundaries need to be enforced at every layer (UI,
connector access, automation creation) rather than as a single access-control check.

---

### Decision

Review Gate is a mandatory, explicit-approval loop at every tier: Generate → Elevate →
Review → Adjust → Approve. Scope of what's reviewed scales per tier (deliverable → sourcing →
reach/access).

### Reason

Makes the human's defensibility work structural rather than optional. Reframes "ethical AI
use" away from blaming the model and onto making review an unskippable, low-friction habit —
first output is treated as a draft by default, not a final answer.

### Alternatives Considered

Leaving review as a norm/policy expectation rather than a structural gate (rejected — relies
on individual discipline, which is exactly what this framework is designed to avoid).

### Consequences

Every framework built on this platform must route through the Review Gate; it cannot be
bypassed per-framework. UI/UX needs a consistent review affordance across all workspaces.

---

### Decision

Privacy Scrubber (internal name: Ephemeral Identity Vault) is a shared platform service
across all workspaces, built on genuinely separate encrypted infrastructure from day one
(own Supabase project or fully separate schema/credentials) rather than schema-level
isolation as a stopgap. Uses reversible tokenization: detect sensitive values → token →
isolated encrypted vault → AI only sees tokens → restore only recognized tokens against a
canonical map (never literal find-and-replace) → re-scan output → hard-delete the vault
mapping. Inverts the org's usual soft-delete-only standard — the vault uses hard delete.
Three handling modes: Standard masking, Strict de-identification, Restricted environment.
Positioned explicitly as a best-practice privacy aid, not a HIPAA/GLBA/GDPR/CMMC compliance
guarantee.

### Reason

"Practice as you mean to go on" — build the safe version from day one so nobody downstream
has to learn the boundary by making an expensive or destructive mistake. Literal
find-and-replace risks corrupting unrelated text or colliding on duplicate values, so
restoration must resolve through a canonical token map instead. Hard delete is required
because the entire point of the vault is that original values are actually gone, not flagged
inactive. Avoiding overpromising on compliance keeps legal/positioning honest.

### Alternatives Considered

Schema-level isolation within the main database as a stopgap until real demand justifies
separate infra (rejected — cheap to build correctly now while empty, expensive to retrofit
later); raw redaction instead of reversible tokenization (rejected — not reversible, less
useful for workflows that need the original value back after AI processing).

### Consequences

Adds real infra overhead (a second encrypted environment) before the first framework ships,
but keeps the vault's isolation boundary non-negotiable from day one. Needs explicit
in-product policy language (not just planning-doc language) stating it reduces exposure but
does not by itself make a workflow compliant.

---

### Decision

Stack recommendation for this project: Next.js + Supabase/Postgres + Prisma + Auth.js,
matching Laura's standing technical standards (Auth.js over Clerk, Google sign-in primary /
Apple for consumer / email magic link fallback, `prisma migrate deploy` only in production
never `db push`, soft delete + immutable audit logs as the general standard — except the
vault, which deliberately inverts to hard delete).

### Reason

Consistency with existing product portfolio conventions reduces onboarding cost for anyone
moving between projects and reuses already-validated patterns.

### Alternatives Considered

Not evaluated in this session — carried forward from standing preference rather than
re-litigated per project.

### Consequences

Core data model will need at minimum: `workspaces`, `frameworks`, `runs`, `run_status`,
`user_tier`. Not yet implemented — stack and schema are recommendations pending confirmation,
per the backlog.

---

### Decision

Build in this order: (1) L0 only, 3-4 frameworks; (2) L1 with one connector category
(Drive + one chat tool); (3) Privacy Scrubber standard mode, on separate encrypted
infrastructure from day one; (4) L2 automation only, no agent-built tools yet; (5) L2 builder
mode (coding agent scaffolding small tools), with engineering looped in deliberately at this
stage; (6) the Promote Path, once there's a real backlog of durable L2 builds worth promoting.

### Reason

Each stage proves a specific piece of the guardrail architecture before the next stage adds
risk on top of it — deliverable quality first, then persistent context and provenance, then
the vault (built early even though nothing strictly needs it yet, per "practice as you mean
to go on"), then automation, then the highest-risk/highest-differentiation piece (agent-built
tools) last, then promotion machinery only once there's something worth promoting.

### Alternatives Considered

Building L2 builder mode early to showcase differentiation (rejected — highest risk piece,
should land only after the guardrail architecture from L1/L2-automation is already proven);
building multiple L0 frameworks in parallel (rejected — proves nothing until one full loop is
proven end-to-end; explicit scope-creep risk).

### Consequences

The first framework choice (Comms 101 vs. Research Assistant) blocks all Claude Code build
work and must be made before step 1 can start. Vault infrastructure (step 3) is provisioned
before it has an active consumer, which is a deliberate ops-cost-now tradeoff, not an
oversight.

## 07-27-2026

### Decision

`FEATURE_CATALOG.md` is the canonical capability inventory. The full framework document
remains the product-design source, while `PROJECT` remains the concise active summary.
Future stories, schema objects, API routes, and tests should reference catalog feature IDs.

### Reason

The expanded inventory contains hundreds of capabilities at very different scales. Stable
epic IDs and a single canonical catalog preserve traceability without turning `PROJECT` or
`BACKLOG` into storage closets.

### Alternatives Considered

Copy the full inventory into `PROJECT` or `BACKLOG` (rejected because it would increase
navigation cost and blur each managed file's responsibility); split every product area into
its own planning file (rejected because the product has not earned that documentation
surface yet).

### Consequences

The catalog is supporting product documentation, not a managed operating file, and therefore
does not use a date suffix. Backlog work must be decomposed from catalog epics rather than
duplicating the full inventory.

---

### Decision

Below L2, users may save private input configurations and manually rerun approved routines,
but they do not create new organizational frameworks, skills, connectors, automations, or
shared templates. Unattended or event-triggered execution requires L2 authorization and
governance approval.

### Reason

This preserves L0/L1 usefulness without violating the framework's load-bearing boundary:
below L2, users consume approved capabilities rather than create new organizational surface
area. A private preset changes inputs; an automation creates durable execution and reach.

### Alternatives Considered

Prohibit all saved configuration below L2 (rejected because it makes repeat work
unnecessarily burdensome); allow L1 scheduling because recurring tasks appear in the
expanded inventory (rejected because unattended execution adds reach and must receive the
L2 review appropriate to automation).

### Consequences

The product and authorization model must distinguish personal presets, manual routines,
automation proposals, and active automations. Converting an L1 routine into unattended
execution creates an L2 proposal and cannot silently activate a job.

---

### Decision

Read-only connectors and persistent organization context are active at L0. L1 adds explicit,
per-connector write/action access and the ability to chain approved frameworks into manually
triggered workflows. L2 remains the boundary for unattended automation, extension building,
and new organizational surface area.

This decision supersedes the 07-26-2026 build-sequence assumption that L0 would ship without
connectors and that the first read-only connector category would arrive at L1.

### Reason

Persistent context is baseline usability, not a maturity reward. Read-only connections are
too useful to withhold and can be safely constrained by scope. The meaningful trust boundary
is whether the workspace may change an external system, chain actions, or continue operating
without the user present.

### Alternatives Considered

Keep L0 disconnected and session-only (rejected because it preserves repetitive setup and
makes the product feel like a generic chat interface); move both read and write access into
L1 (rejected because it treats materially different risk levels as one capability jump).

### Consequences

The first sellable L0 release must include persistent context and at least one read-only
connector category. Connector permissions must distinguish read scopes from write/action
scopes. L1 acceptance tests must verify explicit opt-in, action auditability, and manual
workflow chaining. Review scope follows the same boundary: L0 includes deliverable and source
review, L1 adds intended-action review, and L2 adds reach and unattended-impact review. This
supersedes the earlier tier-specific Review Gate scope while preserving the mandatory
Generate → Elevate → Review → Adjust → Approve mechanic.

---

### Decision

Connector education is an on-demand L0 module shown when a user chooses to add a connector.
Users may complete the orientation or skip directly to setup. The permission and scope
confirmation remains mandatory after either path.

### Reason

First-time users need a plain-language mental model of connectors, while experienced users
should not be forced through remedial education. Consent and authorization are different
from education: familiarity may justify skipping the lesson, but never skipping review of
the actual access being granted.

### Alternatives Considered

Require orientation for every connector setup (rejected because it adds unnecessary friction
for experienced users); place connector education in general onboarding (rejected because it
arrives before the concept is relevant); allow the skip path to bypass directly to connection
(rejected because permission scope must always be explicit).

### Consequences

Connector setup needs separate orientation and authorization states. The product remembers
completed or skipped orientation to avoid repetition, keeps the module available on demand,
and always presents provider-specific scopes before authorization.

---

### Decision

Vocabulary-Earned Communication is a product-wide UI sequencing rule. The system must elicit
and reflect a person's job in language they already use before introducing internal,
technical, governance, or platform terms. Precise vocabulary becomes available after the
concept is concrete, after successful use, when the user adopts it, or immediately on demand.

### Reason

Premature terminology makes first-time users describe their work and learn an unfamiliar
taxonomy simultaneously. Separating those tasks reduces uncertainty without withholding the
precise vocabulary that eventually helps users think and communicate faster.

### Alternatives Considered

Define plain language only as a copywriting preference (rejected because contributors can
violate a preference without breaking an acceptance test); hide technical vocabulary until a
fixed onboarding milestone (rejected because some users want precision immediately and
elapsed time is not evidence of understanding); expose all terms with tooltips from the first
screen (rejected because the terms still impose cognitive work before the need exists).

### Consequences

Every first-time flow must inventory its vocabulary, define reveal evidence, supply
plain-language copy, and provide an on-demand precision path. Job description and technical
configuration are separate stages. Discovery flows must require one primary MVP outcome when
"all of it" would otherwise erase prioritization. Internal documentation, code, audit
records, and expert/admin interfaces may retain precise terminology.

## 07-28-2026

### Decision

Build the AI Enablement Workspace as a standalone Next.js application in
`C:\Projects\AIEnablementWorkspace`, with a fresh product identity and repository history.

### Reason

The project now has its own product surface and needs isolation from Founder OS. Keeping the
implementation inside Founder OS would preserve confusing Icarus lineage and make ownership,
deployment, and project memory harder to reason about.

### Alternatives Considered

Continue building inside the Founder OS Vite application (rejected because the product has
earned its own identity); discard the existing Icarus interface entirely (rejected because
its operational shell is useful product evidence).

### Consequences

The standalone project owns its package identity, README, operating files, product docs, UI,
dependencies, and git history. Icarus remains a visual and interaction reference, not a code
dependency or product brand.

---

### Decision

The first runnable slice is a connected L0 Research Assistant using deterministic mock data
and local state. Live model execution, identity, persistence, and external connector
credentials are deferred until the workflow contract is verified.

### Reason

The vertical slice needs to prove the product's distinctive behavior — recognizable jobs,
vocabulary-earned setup, scoped read access, provenance, human review, and explicit approval
— before infrastructure choices make those behaviors expensive to change.

### Alternatives Considered

Integrate the model and database before building the review experience (rejected because it
would validate infrastructure before product behavior); build a static mockup (rejected
because approval gating and connector setup need real interaction).

### Consequences

The current app is runnable and behaviorally complete for the prototype flow, but it does not
process real documents, call a model, authenticate users, or persist evidence. Those are the
next implementation boundaries.

---

### Decision

Persist the first L0 workflow with Prisma and local SQLite behind server-side route handlers.
Treat runs as a state machine, revisions as immutable records, review items as
revision-specific blockers, and approvals as records bound to one exact revision.

### Reason

The Review Gate only becomes a product control when refreshes, edits, and server requests
cannot bypass it. Exact-revision approval preserves what a person actually reviewed, while
audit events make the workflow reconstructable.

### Alternatives Considered

Continue with browser-local state (rejected because it cannot prove governance or history);
attach approval only to the run (rejected because later edits would silently inherit trust).

### Consequences

Material changes create a new revision, invalidate any active approval, and require a fresh
review cycle. The local environment uses a checked-in SQL migration runner because Prisma's
native migration engine fails opaquely on the current Windows/Node installation; production
remains intended for PostgreSQL with reviewed migrations.

## 09-26-2026

### Decision

The first connected capability is Context Capture over Gmail and Slack, read-only, planned in
`docs/CONTEXT_CAPTURE_ROADMAP.md` (catalog epics CX-04, CX-05, CX-06). Gmail comes first
for email, and Outlook follows through the same adapter contract. This provisionally resolves
catalog decision 5 (initial connector category and provider).

### Reason

Email and Slack hold much of an organization's informal operational history: requests,
decisions, exceptions, handoffs, and changes in responsibility. A bounded capture over them
is the most direct test of whether AI can reconstruct useful operational context from
ordinary work without asking people to document it. Gmail also supplies Google sign-in for
app identity.

### Alternatives Considered

Drive or SharePoint documents first (rejected because documents describe intended process
more than actual process); Google/Microsoft + Asana first (deferred because task state is
more valuable once people, responsibilities, and decisions are resolved); Gmail and Outlook
together (rejected because it doubles OAuth work before the contract is proven).

### Consequences

Gmail's `gmail.readonly` is a restricted scope, so Google verification and a security
assessment are a gate before any pilot organization. v0.1 runs on seeded fixtures first,
then on Laura's own accounts only.

---

### Decision

Captured material is split into four records that are never collapsed: evidence (a source
pointer with a minimal excerpt), assertion (the candidate interpretation), operational fact
(an assertion confirmed or corrected by a human), and relationship (a temporal edge between
resolved entities). Changes supersede prior facts and close validity windows instead of
overwriting them.

### Reason

Email and Slack contain sarcasm, stale instructions, hypotheticals, and errors. Keeping
evidence, interpretation, and reviewed truth separate preserves provenance and makes human
review the only path to operational fact, consistent with "no automatic promotion to truth."

### Alternatives Considered

Store messages as memory and search them (rejected because it is generic search, not
operational context); let high-confidence extractions auto-promote (rejected because
confidence is not review).

### Consequences

Context authorship for captured context is "inferred and reviewed," a partial answer to
catalog decision 4. The schema needs separate evidence, assertion, review-decision, fact,
and relationship tables.

---

### Decision

Every evidence row carries an access envelope, and derived assertions, facts, and
relationships inherit the most restrictive envelope of their inputs. The UI, model context
assembly, and external AI clients all read through one permission-aware projection service.
Widening visibility is an explicit, audited human decision.

### Reason

A shared operational layer must not flatten source-system permissions. Permission has to be
applied before context reaches a model, not requested of the model afterwards.

### Alternatives Considered

Copy source data into a single workspace permission model (rejected because it bypasses
source boundaries); filter model output after generation (rejected because the model would
already have seen restricted content).

### Consequences

v0.1 is single-user, so captured context is visible only to the person who captured it.
Multi-user sharing is a Phase 7 gate with Postgres RLS.

---

### Decision

The AI Enablement app remains the system of record for connections, permissions,
provenance, review, and operational memory. Codex and Claude act as clients through an MCP
server and portable `SKILL.md` skills. They can read reviewed context and start captures,
but they cannot record review decisions, widen visibility, or write to external systems at
L0. In-app extraction goes through a provider-agnostic model interface with Claude and
OpenAI implementations.

### Reason

Laura wants to work from Codex or Claude without either becoming a second, ungoverned
store of organizational knowledge. Routing both through the same server keeps
authorization, audit, and review in one place.

### Alternatives Considered

Make Codex or Claude the primary interface and the web app an admin console (rejected for
v0.1 because review and permission confirmation need a dedicated surface); build separate
integrations per AI client (rejected because MCP and `SKILL.md` work in both).

### Consequences

The MCP server needs personal client access tokens, server-side authorization through the
projection service, and audit events naming the client. Catalog decision 6 (model strategy)
is narrowed to provider-agnostic with Claude and OpenAI; approved-model policy is still
open.

---

### Decision

Context Capture v0.1 runs locally on SQLite. The move to Supabase/Postgres with RLS
happens before any account other than Laura's is connected.

### Reason

Local-first keeps iteration fast while the contract is proven on fixtures and personal data.
The migration is a gate tied to the moment other people's data enters, not to calendar time.

### Alternatives Considered

Hosted from the start (deferred because it adds OAuth redirect, deployment, and RLS work
before the product hypothesis is tested).

### Consequences

OAuth clients are configured for localhost first. Tokens are encrypted at rest locally with
an environment-held key and never enter audit metadata.

## 09-29-2026

### Decision

Build Context Capture Phases 1–4 (context model, synthetic corpus, review experience, MCP
interface and skills, model extraction and evaluation) before real sign-in and live
connectors. Every service takes a `Principal`. Web requests resolve it from a development
stand-in that refuses to run in production. AI clients resolve it from hashed personal
tokens. Source connections are `SourceGrant` rows read through a `SourceAdapter`.

### Reason

The central hypothesis — that reviewed operational context can be reconstructed from work
conversations — should be proven before OAuth and hosting work. Keeping identity and
connections behind interfaces means Auth.js and Gmail/Slack adapters slot in without
changing the context model.

### Alternatives Considered

Build Phase 0 authentication first as originally sequenced (deferred at Laura's direction;
nothing live is connected, and the stand-in is disabled in production).

### Consequences

Replacing `getWebPrincipal` with a session lookup and registering live adapters are the only
changes real sign-in and connectors require. No other person's data may be connected until
that happens.

---

### Decision

Keep two chronologies on every captured item. Communication time (`communicatedAt`,
`firstCommunicatedAt`) records when something was said. Operational time (`effectiveFrom` /
`effectiveTo` on assertions and facts, `validFrom` / `validTo` on relationships) records when
it was true. `timeBasis` records how the operational time was established: stated in the
text, inferred from context, assumed from the message time, set by the reviewer, or unknown.

### Reason

Decisions are routinely announced after they take effect, and rules often start in the
future. Ordering the operation by message time produces wrong histories.

### Alternatives Considered

A single timestamp per fact (rejected because it conflates announcement with effect).

### Consequences

Timelines order by operational time and fall back to first communication only when the start
is unknown, and they show both times. The evaluation scores operational dates separately.

---

### Decision

Entities are concrete things. The extractor is instructed not to create entities that are
another entity plus an activity (for example "<Organization> approvals"); the activity
belongs in the relationship predicate. The evaluation matches entities by name, alias, or
the longest known name they contain, so it scores what was found rather than one way of
modelling it.

### Reason

The first live run with `gpt-5.5` found every approver handoff with correct dates but
attached them to a derived process entity. The organization's own timeline was empty and the
graph was fragmented.

### Alternatives Considered

Accept derived process entities and merge them later (rejected because it fragments every
entity view until a person repairs it); make the scorer exact (rejected because it would
reward one modelling style instead of correct content).

### Consequences

Extractor version `context-extractor/2026-09-29.2`. A PROCESS entity is created only when
messages name a process as a thing of its own.

---

### Decision

Derived items use the strict intersection of their sources' access envelopes, and only the
reviewer's own relationships take part in one-holder timeline reflow. When a relationship's
window was closed by a change the viewer cannot see, the timeline reports only that it ended.

### Reason

Derived information must not escape the permissions of its inputs, and one person's private
facts must not rewrite another person's history.

### Alternatives Considered

Envelope of the broadest supporting source (rejected because it leaks what narrower sources
added); hide closures caused by restricted changes (rejected because it presents a stale
state as current).

### Consequences

A fact supported by a public channel *and* a small email thread is visible only to the email
participants. In the synthetic evaluation, Marcus sees none of the approver history because
each fact also cites an email he was not on. Letting a reviewer confirm a fact on its
broadly visible evidence alone is a follow-up design question.

---

### Decision

The recorded extractor is a test double that replays a hand-authored response for the
synthetic corpus. It is refused for any non-fixture source. Model quality is judged only by
live-provider evaluation runs.

### Reason

Offline, deterministic tests need a stable extractor, but a response written by the builder
cannot measure extraction quality.

### Alternatives Considered

Heuristic rule-based extraction (rejected because it would be tuned to the evaluation
corpus rather than domain-neutral).

### Consequences

`npm test` proves the pipeline and governance. `npm run context:eval -- --extractor openai`
(or `anthropic`) measures the model.

---

### Decision

Pin `better-sqlite3` to the 12.x line used by `@prisma/adapter-better-sqlite3`.

### Reason

13.0.1 has no prebuilt binary for Node 24 on Windows and this machine cannot compile it.
Reinstalling dependencies left both copies without native bindings.

### Alternatives Considered

Install Visual Studio build tools (rejected as unnecessary local setup for a dev database).

### Consequences

One deduplicated driver serves the app, migrations, and evaluation. Revisit when a 13.x
prebuilt exists for the Node version in use.
