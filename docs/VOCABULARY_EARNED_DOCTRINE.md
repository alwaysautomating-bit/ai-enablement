# Vocabulary-Earned Doctrine

Status: Product-wide UI communication doctrine
Last updated: 2026-07-27

## Core Rule

**No new vocabulary before the person has expressed the need for it in their own words.**

Every technical or system term must be earned by the interaction before it is introduced.
The person supplies the concept in plain language first. The system reflects the behavior or
constraint back in language the person already owns. The formal term may appear later,
attached to something the person already understands.

One-line summary:

*Give people the words after they have already built the thing the words describe — never
before.*

This is a sequencing requirement, not merely a tone preference. It applies to onboarding,
framework selection, setup, empty states, prompts, labels, help, and progressive disclosure.

## Vocabulary Covered

The rule applies to all internal, technical, governance, and platform vocabulary, including:

- Requirement
- Evidence
- Review Gate
- Reconciliation
- Confidence Score
- Connector
- MCP
- Nimble
- API
- Model routing
- Provenance
- Automation
- L0, L1, and L2
- Any workspace-specific term the user has not yet encountered through their own work

Internal documentation, code, schema, logs, and administrator interfaces may use precise
terms where the audience is already expected to understand them. User-facing copy must earn
them.

## Shipping Test

Before first-time-user copy ships, ask:

> Did this sentence teach a new word, or did it use words the person already had?

If it introduces an unearned term:

1. Replace it with the job or outcome in plain language.
2. Move the term to a later point where the behavior has become concrete.
3. Offer the precise term on demand for users who want it sooner.

## Interaction Pattern

### 1. Elicit the job

Ask about the work, decision, check, worry, or desired outcome. Do not ask the user to select
an internal system concept.

Instead of:

> Which Review Gate requirements do you need?

Ask:

> Before this goes out, what does a person need to check?

### 2. Reflect the rule in plain language

Translate what the person said into an assistant behavior without requiring the formal term.

User:

> I don't want it making the decision for me. I want it to collect what I need so I can
> decide.

System:

> Never approve or reject the work. Prepare it for a person to review.

This behavior implements a Review Gate without requiring the user to learn that term first.

### 3. Reveal vocabulary after successful use

After the person has used or configured the behavior successfully, attach the formal term in
a low-stakes way:

- A small label
- A tooltip
- A "what is this called?" affordance
- An optional aside such as "This review step is called a Review Gate"

The reveal must never block progress.

### 4. Mirror adopted vocabulary

When the person begins using the formal term themselves, the system may use it at full
technical fidelity. User adoption is the strongest signal that the term now provides useful
compression.

## Job Description Before Configuration

Keep these stages separate:

1. **Describe the job:** use the person's language; do not introduce tool or platform terms.
2. **Configure the implementation:** discuss tools, access, limits, and technical choices
   only after the job is understood.

Tool names, connectors, APIs, model limitations, and platform constraints are configuration
concerns. A person describing their work should not also have to solve implementation
architecture.

The configuration stage may be handled by the workspace, an administrator, a technical
teammate, or a later screen.

## Prioritization Rule

Do not allow "all of it" to become the frictionless answer when the product is trying to
identify the first valuable capability.

When several outcomes matter, ask:

> If we could ship only one this week, which one would help most?

The interaction should:

- Require one primary outcome for the first version
- Preserve the remaining outcomes as later candidates
- Explain the tradeoff in the person's language
- Avoid converting a discovery conversation into an unbounded feature checklist

## Learning Model

Vocabulary is useful compression and should eventually be learned. The product should not
keep users permanently in imprecise language.

Vocabulary is earned by evidence, not elapsed time:

- Successful use of the behavior
- Repeated use of a workflow
- Configuration of the corresponding rule
- The user's own adoption of the term
- An explicit request to learn the precise vocabulary

There is no fixed number of days or onboarding steps after which a term becomes appropriate.

## On-Demand Precision

Precise vocabulary must always be available to users who want it sooner:

- Glossary
- Tooltip
- "What does this mean?"
- Advanced details
- Technical setup view

The rule is **not forced before earned**, not **hidden until permitted**.

## Connector Application

The connector flow begins with the job:

> Bring in information from a tool you already use.

The user selects a tool or describes the information they want available. Only then does the
system introduce the term:

> This permissioned link is called a connector.

The on-demand learning choices should use plain language:

- `See how this works`
- `Skip to setup`

The module may then explain:

- What the link can read
- What it cannot change at L0
- Why using the link avoids repeated uploads
- Which jobs it can support
- How to verify or remove access
- That write/action access is a separate later permission

Skipping the explanation never skips permission and scope confirmation.

## Review Gate Application

First-time interfaces describe the job:

- `Check this before it goes out`
- `What needs your attention`
- `Ready for your approval`

After successful use, the interface may reveal:

> This review-and-approval step is called the Review Gate.

Internal workflow states and audit records may use `Review Gate` from the beginning.

## Tier Application

Do not require users to identify as L0, L1, or L2. Show available actions and boundaries in
plain language:

- `Use approved tools`
- `Allow this workspace to post updates`
- `Build a new workflow`

Tier vocabulary may be exposed in administrator views, advanced details, documentation, or
after the user asks how access levels work.

## Governance

Every user-facing feature must identify:

- Terms it may introduce
- The user action or evidence that earns each term
- The plain-language copy used before the reveal
- The optional reveal mechanism
- The on-demand precision path

Copy review must test first-time and experienced-user states separately.
