# AI Enablement Workspace — L0 / L1 / L2 Framework

Source of truth for the AI Enablement Workspace product design. Originally imported from the
07-24-2026 design session and revised on 07-27-2026 to make read-only connectors and
persistent context available at L0. Treat this file as primary;
`PROJECT_07-27-2026.md` is the condensed working-memory summary and `FEATURE_CATALOG.md`
translates this framework into build-level epics.

## Core thesis

The workspace grows with the org's trust and appetite, not with the individual's technical
skill. An employee doesn't "graduate" by learning prompt engineering. The org decides how
much surface area to open, and the system enforces the boundary — the same way Icarus
separates who decides from who executes. At every level, the employee experiments freely
inside whatever's unlocked. They never have to think about guardrails; that's architecture,
not personal discipline.

One-liner: **the workspace expands with adoption, the guardrails scale with the workspace —
never with the person.**

This applies as much to how the *product itself* gets built as to how it behaves for users.
The safe version of anything (the vault, the review gate, the permission model) gets built
correctly the first time, whether or not the first workspace to ship even needs it yet — not
because every use case demands it immediately, but because that's how nobody downstream has
to learn the hard way. An org adopting this shouldn't have to make an expensive or
destructive mistake to discover where the boundary should have been. The boundary is already
there, waiting, before anyone needed it.

Same logic applies to technical debt, even at the prototype or learning-space stage. "It's
just a prototype" isn't license to build it sloppy — the goal is to limit debt wherever
reasonably possible from the first line of code, not just in the pieces slated for
production. A prototype built cleanly is cheap to promote later; a prototype built as a pile
of shortcuts has to be rebuilt before it can carry anything real, which is its own kind of
expensive mistake.

One more piece of this that's easy to miss: engineering doesn't get to sit outside this shift
and just design the guardrails for everyone else. The way engineering itself works has to
change too — more time spent reviewing and architecting AI-assisted builds, less time as the
sole author of everything, tiny well-scoped tools instead of everything routed through a big
platform. Engineers are adapting to what work looks like going forward at the same time as
everyone else in the org, not handing down rules from a position that stays fixed.

Worth naming honestly: engineers often experience this as their identity being democratized
to "the rest of us," and that discomfort isn't irrational — it's a real thing being
renegotiated, not just a workflow update. Nothing about this framework erases their value.
They're still the domain experts; the review-and-architect role in the Promote Path and the
technical-health half of stewardship both depend on that expertise directly. What changes is
the default — nobody has to sit in a queue waiting for engineering to have bandwidth to build
the small tool they need, because building the small thing is no longer gated behind being an
engineer. That's a real shift in who has to say yes before something small gets made, and it
deserves to be named as exactly that rather than smoothed over. Engineering belongs in this
conversation deliberately — not left out of it, and not treated as the department everyone
else's adoption has to be cleared through first.

## Design principles

1. **Guardrails are infrastructure, not instructions.** Nobody memorizes a policy. The system
   won't let you do the unsafe thing; it just quietly doesn't offer it.
2. **Every level is fully usable on its own.** L0 isn't a stripped-down demo of L1. It's a
   complete, valuable working mode. Orgs (or individuals within an org) can live at L0
   indefinitely.
3. **Frameworks, not chat boxes.** Nobody gets an empty prompt, and nobody picks an abstract
   AI capability like "summarize" or "draft." They pick the actual job they are trying to do,
   named the way they would name it. A framework selected for the user's role and aimed at
   their actual deliverable turns "a smart chat box" into "my assistant."
4. **Progress is pulled, not pushed.** The user hits a wall ("I wish this could actually post
   the update, not just draft it," "I want this to run automatically") and that friction is
   what unlocks the next tier — not a sales funnel nudging them up.
5. **Trust compounds visibly.** Each tier makes the previous tier's invisible machinery
   slightly more visible (read access → write access and governance → automation), so people
   build real mental models of how the system works as they go.
6. **Review is the job, not a step you skip.** The AI generates. The human makes it
   defensible. That second part is the actual work — it's where the human either creates
   value or lets it degrade — so the system's whole design goal is to make review easy
   enough that people actually do it, every time, as a habit rather than a chore.
7. **One-shot is a floor, not a ceiling.** Most common practice today is: ask once, take
   what you get. That's leaving capacity on the table. The workspace should treat the first
   output as a draft by default — try a second pass, check itself against the framework's
   own standard, surface what it would improve — rather than stopping the moment something
   plausible comes back. Iteration is modeled, not left to the user to remember to ask for.
8. **Vocabulary is earned.** No technical or system term is introduced before the person has
   expressed the underlying need in their own words. The interface describes the job first,
   reveals precise vocabulary after successful use, and keeps technical language available
   on demand without forcing it into first-time onboarding. Full doctrine:
   [VOCABULARY_EARNED_DOCTRINE.md](./VOCABULARY_EARNED_DOCTRINE.md).

---

## L0 — Guided Deliverable Mode

**What it is:** a role-curated menu of ready-made frameworks. Pick the actual job to be done,
feed it what it asks for, and get a deliverable. The deeper job of this tier is a mental-model
shift: from AI as "fancier search" or "fancier autocomplete" to a role-specific assistant
built around the user's real work.

**What the user experiences:**
- Land in a menu curated for their role rather than a generic wall of every framework.
- Choose the task using job language — "draft the claims escalation summary," "put together
  this week's competitor scan," or "write the board update" — rather than abstract
  capabilities such as "summarize" or "draft."
- Connect the tools where information already lives through guided walkthroughs that explain
  what is accessible, what is excluded, that access is read-only at this tier, and how to
  verify the connection.
- When choosing to bring in information from another tool, optionally open an orientation
  that explains how the link works, why the workspace uses it, common role-specific use
  cases, and the difference between reading and changing information. Once the need is
  concrete, the interface may explain that this permissioned link is called a connector.
  Users who already understand it can skip the orientation and continue directly to setup.
- Receive an input checklist that is substantially prefilled from persistent organization
  context and connected read-only sources.
- Runs a preloaded skill chain (the framework's internal steps) and produces the deliverable
  in a template that's already good — not a blank page with instructions

**What's active:** Capability bundle + Framework bundle + Deliverable bundle, plus persistent
Context and the Connection bundle in read-only mode. Connectors are not something a user must
earn; they are too useful to withhold, and persistent context is baseline usability rather
than a trust milestone. L0 does not include write/action access, multi-framework workflow
chaining, or automation.

**Where guardrails live:** baked directly into the skill — citation rules, structure
requirements, "flag for human review" triggers, tone constraints. The user never sees a
policy; they just can't produce an unsourced claim or a document missing a required section.
Connector access is guardrailed by scope: read-only, one framework at a time, with no
write-back. The Connector Orientation Module is optional, but the actual permission and
scope confirmation is never skippable.

### Connector Orientation Module

**When it appears:** on demand, when a user chooses to bring in information from a tool they
already use. It is not required before the user expresses that intent and does not interrupt
unrelated L0 work.

**What it teaches:**

- Begin in plain language: a permissioned link between the workspace and a tool where the
  user's work already lives. After the concept is concrete, reveal that the link is called a
  connector.
- What it does: lets an approved framework retrieve selected information without requiring
  repeated copying and uploading.
- Why it is useful: reduces repetitive setup, keeps organizational context current, and
  preserves source provenance.
- What it does not do at L0: post, edit, delete, send, or otherwise change information in the
  connected tool.
- Common use cases by role and framework, using the connector the user selected.
- What information is included, what is excluded, how access can be verified, and how the
  connector can be disconnected later.
- The difference between read-only access at L0 and separately approved write/action access
  at L1.

**Interaction rules:**

- Offer `See how this works` and `Skip to setup` as equal paths.
- Remember that the user skipped or completed the orientation so it is not repeatedly
  imposed, while keeping it available from connector setup and help.
- Tailor examples to the user's role, selected connector, and intended framework.
- Require the same explicit scope and permission confirmation after either path. Skipping
  education never implies consent and never bypasses authorization.
- End setup with a verification step showing what the workspace can and cannot access.

**Exit signal (what tells you they're ready for L1):** they want the workspace to do
something in a connected tool — post the update, not just draft it — or they want to chain
multiple frameworks into a repeatable manual workflow.

---

## L1 — Connected Workspace Mode

**What it is:** the same connected, context-aware frameworks from L0, now able to act on the
organization's tools instead of only reading from them, and combinable into light repeatable
workflows.

**What the user experiences:**
- Grant explicit, per-connector write or action access on top of the read-only connections
  already in place.
- Can chain two or three frameworks into a light repeatable workflow (e.g., weekly scan →
  brief → post to Slack), still manually triggered
- See what is allowed as the Governance bundle becomes visible, though not editable.

**What's active:** adds opt-in write/action access to the Connection bundle already active at
L0, plus the ability to chain frameworks into a manual workflow. Governance becomes visible
but remains fixed.

**Where guardrails live:** write/action access is scoped per connector and never defaults on.
Someone must explicitly grant it tool by tool. Provenance traces every claim to its source,
and the audit trail records what each run read and wrote. The trust decision at L1 is not
whether a tool may be connected, but whether the workspace may change anything in it.

**Exit signal:** they want something to run without them triggering it, or they want a
workflow that doesn't exist in the framework menu yet.

---

## L2 — Builder Mode

**What it is:** the user starts assembling, not just consuming — chaining workflows into
automations, and using a coding agent to build small bespoke tools (trackers, intake forms,
mini dashboards) out of the same bundles they already trust.

**What the user experiences:**
- Turn a manual workflow into a scheduled or triggered automation
- Describe a small tool in plain language; the system scaffolds it using existing
  capability/context/framework bundles as building blocks, with a coding agent doing the
  execution
- Save workflows and tools as shareable assets for teammates — this is where individual
  experimentation starts becoming org infrastructure, via the Promote Path below

**What's active:** adds an Automation bundle and an Extension bundle (agent-built tools). The
Governance bundle becomes *editable*, but only with an approval step — this is the one place
a human sign-off gate is structurally required, because this is the tier where new surface
area gets created rather than just used.

**Where guardrails live:** admin-level review before an automation goes live or a tool
touches a new data source; an org-wide audit log of who built what and what it can reach.
Below L2, nothing new gets created — only used. That's the real dividing line.

---

## The Promote Path — from someone's build to everyone's tool

**The idea:** a durable L2 build shouldn't have to stay parked in one person's workspace.
Promotion is how one person's tool becomes part of the shared menu everyone else gets at L0
and L1 — without those people needing to build anything, or even needing to know it started
life as someone's coding-agent experiment. This is the mechanism by which the org's
collective floor rises without every individual having to climb tiers themselves.

**The stages:**
1. **Personal build** — private by default. Something built at L2 belongs to the person who
   built it, until someone decides otherwise.
2. **Nomination** — either the builder submits it themselves, or someone else (a teammate, an
   admin, you) flags it as good enough to share. Both are legitimate paths. Good work
   shouldn't get stuck in one person's workspace just because that person doesn't want to be
   the one making noise about it.
3. **Light promotion review** — a different check than the L2 governance gate. That gate
   asked "is it safe for this to exist and reach what it reaches." This one asks "does it
   hold up for someone who isn't the builder" — does the input checklist make sense to a
   stranger, does it break outside the builder's specific data or context, is it safe to hand
   to someone who won't be able to debug it themselves.
4. **Attribution choice** — the builder decides: credited by name, credited anonymously, or
   shared as an org tool with no individual name attached at all. Even when someone *else*
   nominates the build, the builder still gets a quiet check-in before it goes wide — "I'd
   like to add this to the shared library, okay if I credit you / keep it anonymous / just
   list it as an org tool" — rather than finding out after the fact that something they
   built for themselves is now everyone's tool.
5. **Promoted state** — it joins the framework or deliverable menu like anything native to
   the workspace. Nobody using it downstream needs to know or care where it came from.
6. **Support thread** — every promoted build gets a home for questions, comments, and
   feedback attached specifically to it. Lightweight — a thread, not a ticket system.
   Someone using it can ask how to adjust something, flag what's broken, or request an
   improvement. Routes to the builder if they've opted to stay attached to it, or to a
   general steward if they haven't.

**Open thread to resolve:** stewardship. A promoted build needs an owner, even if that owner
isn't the original builder — otherwise it quietly rots and the whole Promote Path loses
credibility ("half the shared library doesn't actually work anymore"). Worth deciding whether
promotion requires someone to formally accept ongoing steward responsibility before it goes
live, or whether unmaintained builds just get flagged and retired automatically after a
stretch of unanswered feedback.

---

## Open Door — anyone can come learn how the L2 layer works, no tier change required

Not everyone curious about architecture, data flow, version control, or actual code wants to
become an L2 builder themselves. Curiosity shouldn't need a formal tier change to be
satisfied. This is a standing invitation, not a course and not a requirement: anyone,
regardless of tier, can come watch how an L2 build actually works.

**What it looks like in practice:**
- L2 builders (engineering included, per above) host regular open sessions — an architecture
  walkthrough, "here's how this automation is actually wired," "here's what version control
  buys you and why it matters," pairing time for someone who just wants to watch a build
  happen start to finish
- No tier prerequisite — someone at L0 can sit in on how their favorite promoted tool
  actually works without being nominated or approved for L2 access first
- This is voluntary access to the *machinery*, distinct from voluntary access to *building*.
  You can learn how the plumbing works before anyone hands you the wrench

**Why it matters:** it's the informal, human counterpart to the Promote Path's formal
mechanism. Promote Path moves *outputs* down to everyone. Open Door moves *understanding* the
same direction, for whoever wants it, without making them formally level up first. It's also
probably the quietest, most reliable way curious non-technical people become the org's next
L2 builders — not pushed there, just curious enough after watching a few sessions to try it
themselves. That's the "progress is pulled, not pushed" principle applied to people, not just
to tiers.

It also gives engineering a natural way to be *in* this rather than gatekeeping around it —
hosting these sessions is exactly the review-and-architect role already described for them,
made visible and shared rather than happening behind a closed door.

---

## The Review Gate — the human+AI unit of work

**The philosophy:** when the output is wrong, that's not a system failure — that's AI doing
what AI sometimes does. The failure is a human approving something they never actually looked
at. Ethical AI use isn't about blaming the model for its mistakes; it's about making sure the
person attaching their name to the output actually made it defensible. The AI does the
generation. The human does the part that was always the real work — deciding whether this is
good enough to stand behind.

This is why burden shifts *to* the system everywhere else in this framework (guardrails,
provenance, permission scoping) and shifts *toward* the human at exactly one point: review.
Not because the human is being punished with extra work, but because review is the one place
value actually gets created or destroyed. Elevate the human to that moment. Everything else
in the architecture exists to clear the runway so they can actually do it.

**The mechanic:** every framework run ends the same way, regardless of tier.

`Generate → Elevate → Review → Adjust → Approve`

- **Generate** — the framework produces the deliverable.
- **Elevate** — the system doesn't just drop the output in a folder. It surfaces it, with
  what needs eyes on it flagged (a claim without a strong source, a section outside the usual
  pattern, a number worth double-checking).
- **Review** — the human looks. The minimum viable version of this is a quick scan — open the
  doc, read it, lay eyes on the flagged spots. It doesn't have to be exhaustive. It has to be
  real.
- **Adjust** — fix what's off. This is expected, not a sign something went wrong.
- **Approve** — an explicit action, not a default. Nothing is "done" until someone approves
  it. This is the moment ownership transfers from the system's output to the human's work.

**Why "approve" has to be explicit:** if review is optional or invisible, it gets skipped
under deadline pressure, and the whole ethical premise collapses back into "the AI said so."
An explicit approve action is what makes the deliverable defensible after the fact — there's
a record of a specific person having looked and signed off, not just a system that generated
something nobody checked.

**How it scales by tier:**
- **L0** — review the deliverable and its sourcing. The user scans the document, confirms
  flagged spots, and can open provenance links for claims drawn from read-only connectors
  before approving. This remains low friction, but it is never skipped.
- **L1** — review extends to intended actions. In addition to deliverable and source review,
  the user confirms what a manual workflow will write, where it will write it, and who will
  receive or see the result before the action occurs.
- **L2** — review extends to reach. Before an automation goes live or a built tool ships,
  review includes what it touches (what data, what actions, what it can do unattended), not
  just what it produced once. This is the review that has teeth — it's the gate that requires
  admin approval mentioned earlier, because at this tier the thing being approved keeps
  running after the person stops watching it.

**Habit formation, not compliance theater:** the goal isn't a checkbox that proves review
happened. It's a person who, six months in, instinctively opens the doc before sending it —
the same way a good editor never publishes a piece they haven't read. The system's job is to
keep that action cheap enough (flagged spots, one-click approve, no extra tooling to learn)
that doing it becomes the path of least resistance, not an extra chore competing with the
deadline.

---

## Bundle activation by tier

| Bundle | L0 | L1 | L2 |
|---|---|---|---|
| Capability (skills) | ✓ | ✓ | ✓ |
| Framework | ✓ | ✓ | ✓ |
| Deliverable | ✓ | ✓ | ✓ |
| Context | persistent from L0 | persistent | persistent + shared |
| Connection | ✓ (read-only) | ✓ (read + write, opt-in per connector) | ✓ (read/write, scoped) |
| Governance | invisible | visible, fixed | editable, gated by approval |
| Automation | — | — | ✓ |
| Extension (built tools) | — | — | ✓ |
| Review Gate | ✓ (deliverable + sourcing) | ✓ (deliverable + sourcing + intended actions) | ✓ (reach/access + unattended impact) |
| Privacy Scrubber | ✓ (notice + suggest) | ✓ (auto-mask + restore per workspace) | ✓ (org-defined data classes, modes, model routing) |
| Promote Path | consume + nominate | consume + nominate | build + nominate + steward |

---

## Org-level shape

This isn't one ladder the whole company climbs together. It's a portfolio. Different people,
teams, or roles sit at different tiers simultaneously:

- A role can have a **floor and a ceiling** — e.g., "Finance analysts: minimum L1, capped at
  L1 until admin review" or "Ops leads: free range through L2."
- An **admin view** shows tier distribution across the org — who's stuck at L0 and why, who's
  built automations at L2, where governance exceptions have been granted.
- Moving someone's ceiling up is an org decision (one click, one policy change) — never
  something the employee has to request feature-by-feature.

This is the part that matches the "control plane decides who decides" framing directly: the
workspace is the data plane where people actually work, and the tier ceiling is the
control-plane decision sitting above it.

---

## Privacy Scrubber (Ephemeral Identity Vault)

A reusable platform service, shared across every workspace, not a feature of any one of them.
It reduces unnecessary exposure of sensitive information during AI-assisted work. It's a
best-practice privacy aid, not a compliance guarantee — it does not by itself make a workflow
HIPAA-, GLBA-, GDPR-, or CMMC-compliant.

**The architectural answer: yes, a dedicated encrypted database, deleted when done.** That
instinct is exactly right, and it's the detail that makes the whole thing defensible rather
than a nice idea. Specifically:

- **A separate database, not a separate table.** The token vault should live in its own
  database (or at minimum its own isolated schema with its own credentials), never colocated
  with the workspace's application data. If the main app database is ever compromised or
  queried broadly, the vault is a different blast radius entirely.
- **Encrypted at rest**, ideally with envelope encryption — a per-run or per-org data key
  wraps the individual values, and that data key itself is wrapped by a master key held in a
  secrets manager, not in application code.
- **Scoped access**: only the current user and the current run can read from it. Not "the
  workspace," not "the org admin by default" — the specific run that created the mapping.
- **Automatic expiration**, not just manual deletion. A TTL on every mapping so nothing
  survives past its restoration window even if the user never comes back to finish the run.
- **Hard delete, not soft delete.** This is the one place in the system where "soft delete
  only" (the standing default) should be inverted — the entire point is that the original
  values are actually gone, cryptographically and operationally, not just flagged inactive.
- **A non-sensitive audit record survives the deletion.** Something like: *"Run run_456 used
  37 temporary tokens. Mappings destroyed successfully at 4:42 PM."* That gives the org
  evidence the privacy process ran, without retaining anything sensitive in that evidence.

**The flow:**
1. Detect sensitive values in the input.
2. Replace each value with a stable token (`PERSON_001`, `POLICY_001`, `PHONE_001`).
3. Store the mapping in the isolated vault — never in the workspace database, never in the AI
   model's context.
4. Send only the tokenized data to the AI model. The model sees: *"PERSON_001 contacted
   support about POLICY_001."*
5. Receive the analysis or report back — still tokenized.
6. Resolve only recognized tokens against the canonical mapping to restore approved values.
   Don't do a literal find-and-replace on raw text — two original values can be identical,
   one value can appear under multiple entity types, and free-text replacement can silently
   corrupt unrelated content. Token-to-value resolution against the canonical map avoids all
   three failure modes.
7. Re-scan the final output for anything that slipped through before it's considered final.
8. Destroy the vault mapping. Verify deletion. Log the non-sensitive audit event.

**Vault record shape:**
```json
{
  "workspace_id": "ws_123",
  "run_id": "run_456",
  "token": "PERSON_001",
  "entity_type": "person_name",
  "original_value_encrypted": "encrypted-value",
  "normalized_hash": "hash-for-deduplication",
  "replacement_policy": "restore_in_final",
  "created_at": "timestamp",
  "expires_at": "timestamp"
}
```

**Three handling modes** (the workspace picks the default; the user can escalate):
- **Standard masking** — everyday client and business data. Auto-restore after review.
- **Strict de-identification** — higher-risk files. More aggressive removal, no automatic
  restoration, mandatory review before anything is unmasked.
- **Restricted environment** — regulated or highly sensitive work. The user is routed to an
  approved enterprise model, private deployment, or internal system instead of the general
  workspace model entirely.

**Mapped to L0–L2:**
- **L0** — teaches noticing. "We found 14 sensitive entities. Want us to protect them before
  analysis?" Reframes the whole habit from *"don't paste sensitive information into AI"* to
  *"let me sanitize this first"* — that's the behavior shift worth reinforcing.
- **L1** — auto-masks and restores inside specific workspaces, per that workspace's
  configured default (see below).
- **L2** — the org defines which data classes, models, connectors, and workflows are
  permitted at all — this is where "restricted environment" mode gets enforced structurally
  rather than left to the individual user's judgment.

**Workspace-level defaults:**
- Research Assistant → suggest masking.
- SpeakSheet → auto-mask names, keep financial figures visible.
- Comms 101 → warn before sending sensitive content to an external model.
- HR Workspace → mask by default, require review before restoration.
- Insurance Workspace → mask policyholders and claimants by default.
- Healthcare Workspace → stricter handling by default, organization-approved models where
  required.

**Flagship use case — HR and manager workflows.** Not because this data needs protecting more
than anywhere else, but because people are often hesitant to use AI at all when employee
information is involved, and this lowers that barrier while building the right habit. A
manager drafting feedback pastes:

> *Sarah Jenkins has missed deadlines on Project Phoenix, had two coaching conversations, and
> received complaints from John Smith…*

The workspace transforms it to:

> *EMPLOYEE_001 has missed deadlines on PROJECT_001, had two coaching conversations, and
> received complaints from EMPLOYEE_002…*

The AI can still identify recurring themes, improve tone, remove emotionally charged
language, make feedback more objective, and draft the review — none of that reasoning
depends on knowing who the employee actually is. Names get restored locally only after the
manager reviews the draft.

Same pattern applies to: performance evaluations, PIPs, exit interview summaries,
investigation notes, accommodation requests (HR); 1:1 prep, promotion packets, coaching docs
(managers); incident reports, ethics hotline summaries (legal/compliance); support ticket and
escalation analysis (customer success); claims trend analysis, underwriting notes, call
quality reviews (insurance); internal quality improvement reporting (healthcare admin,
subject to org policy).

**Product policy, stated plainly:** *Privacy Scrubber reduces unnecessary exposure of
sensitive information during AI-assisted work. It does not by itself make a workflow HIPAA-,
GLBA-, GDPR-, or industry-compliant.* Some orgs' policies or legal obligations may prohibit
sending certain data categories to any external model even after masking — that's exactly
what "restricted environment" mode exists to route around, rather than pretending one privacy
setting fits every situation.

## Build sequence (MVP first)

1. **L0 with 3-4 frameworks, persistent context, and read-only connectors live from the
   start** (probably Drive + one chat tool). Prove the deliverable quality bar and read-only
   connector experience together. This alone is a sellable product.
2. **L1: write/action access plus workflow chaining.** Prove that connector write access is
   genuinely opt-in and scoped, and that chaining two or three frameworks into a manual
   workflow holds up, before adding automation.
3. **Privacy Scrubber standard mode**, built as a shared service from the start rather than
   bolted onto one workspace, on genuinely separate encrypted infrastructure from day one —
   not schema-level isolation as a stopgap. This is a "practice as you mean to go on"
   decision: the vault gets built correctly once, whether or not the first workspace to ship
   even needs it yet, so it's sitting there ready rather than something retrofitted under
   pressure later once real client/HR data is already flowing through the system.
4. **L2 automation only** (no agent-built tools yet) — scheduled/triggered workflows on top
   of what already exists in L1.
5. **L2 builder mode** (coding agent scaffolding small tools) — this is the highest-risk,
   highest-differentiation piece; do it last, after the guardrail architecture from
   L1/L2-automation is already proven. This is also the natural point to loop engineering
   into the rollout deliberately, as partners in the review/architecture role and the
   technical half of stewardship — not as an afterthought, and not as a gate everyone else's
   adoption has to clear through first.
6. **The Promote Path**, once there's enough L2 activity that a real backlog of durable
   builds exists to promote in the first place — this is the layer that turns individual
   experimentation into org-wide value, but it needs something worth promoting before it's
   worth building the promotion machinery itself.

## Open questions to resolve next

- Does context bundle content (org glossary, voice, approved sources) get authored by an
  admin up front, or inferred from L0 usage over time?
- Where exactly does "read-only default, write is opt-in" live technically — per connector,
  per framework, or per user role?
- Naming: does each tier need a name people say out loud ("she's an L2 user" is clunky), or
  does the tier stay invisible and only the *capability menu* changes visibly?
- Is Extension bundle (agent-built tools) scoped to only ever use existing bundles as building
  blocks, or can L2 users introduce entirely new data sources without going through the L1
  connector walkthrough first?
- Internal name landed on **Ephemeral Identity Vault**; user-facing name **Privacy Scrubber**
  — worth testing both with actual HR/insurance buyers before locking in.

**Resolved — stewardship split:** technical health (does it still run, does it break when a
connector or model changes) is engineering's job. Practice health (is this still the right
way to do this thing, has policy or context moved on, should it be retired even though it
technically works) belongs to a domain or product owner, not engineering by default. Dumping
both on engineering is how shared libraries quietly rot — "still runs" gets checked, "still
good" never does, because nobody's actually assigned to ask it.

That split assumes a build big enough to need two different people watching two different
things. Most promoted builds shouldn't be that big. The scope target here is **tiny SaaS, not
platforms** — small, single-purpose tools, built well enough from day one that one capable
person can reasonably hold both halves of stewardship at once: read the code and
architecture, fix a bug if one shows up, and judge whether it's still the right approach.
Keeping builds small on purpose is itself a stewardship strategy — a narrow, well-built tool
has a narrow blast radius and a narrow maintenance surface, so it doesn't need a team assigned
to babysit it. The two-role split above is the fallback for the rare build that outgrows one
person, not the default expectation for everything in the library.
