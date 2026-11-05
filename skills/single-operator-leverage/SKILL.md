---
name: single-operator-leverage
description: Framework for making decisions, building systems, and shipping products without a team — maximizing output and coherence when the builder is also the operator, designer, strategist, and QA. Use when prioritizing what to work on, deciding what to automate vs. do manually, determining what to defer, or evaluating whether a task requires your specific judgment. Covers leverage identification, automation doctrine, deferral logic, decision fatigue management, and the discipline of shipping without a team. Trigger on prioritization, capacity planning, solo builder decisions, or any "what should I do next" question.
---

# Single Operator Leverage Skill

Everything is prioritization. Not because there isn't enough time — but because attention is the scarcest resource, and every choice to work on one thing is a choice not to work on something else.

**The single-operator advantage: you can make fast, coherent decisions. The single-operator risk: there is no one to catch what you miss. Build systems that compensate for the second without destroying the first.**

---

## The Leverage Stack

Not all work has the same return on attention. Sort tasks into leverage tiers before deciding what to work on.

### Tier 1: Irreplaceable Judgment
Work that requires your specific knowledge, your authority, or your relationship. No one else can do this — not a tool, not an AI, not a freelancer without extensive onboarding.

Examples: product architecture decisions, brand voice judgment, key customer conversations, product strategy, identifying scope creep

**These get your attention first, on your best cognitive hours.**

### Tier 2: High-Leverage Execution
Work that you can do well and that produces compound returns — builds infrastructure, ships product, creates assets that persist.

Examples: writing a skill doc, building a reusable component, shipping a landing page, writing system documentation

**These get your attention after Tier 1. They benefit from focus blocks.**

### Tier 3: Automatable Repetition
Work that follows a predictable pattern and doesn't require your judgment. Can be automated, templated, or systematized.

Examples: GL coding suggestions, weekly data processing, content repurposing, status updates

**These get automated or templated. Your job is to design and verify, not execute repeatedly.**

### Tier 4: Deferrable or Delegatable
Work that is real but not time-sensitive, or work that can be done by someone else without significant briefing cost.

Examples: administrative tasks, design polish after functionality is proven, documentation of stable features

**These go on a list. They happen when there's nothing more important.**

### Tier 5: Low-Return Overhead
Work that consumes time and produces little lasting value. Maintenance for its own sake, meetings without decisions, optimization of things that don't matter yet.

**These get eliminated where possible.**

---

## Automation Doctrine

### Automate When:
- The task is triggered by a predictable condition (time, threshold, event)
- The logic is stable and unlikely to change frequently
- The cost of a mistake is low or reversible
- Doing it manually 50 times would produce the same output as the automation
- The automation can be verified without running it in production

### Do Not Automate When:
- The task requires judgment that isn't reducible to rules
- The failure mode is expensive or irreversible (never automate payment approval)
- The rules change faster than the automation can be updated
- The time to build the automation exceeds the time saved within a reasonable horizon
- You don't yet understand the edge cases

### AI-Assisted Automation
Use AI to handle the first pass of tasks that benefit from language understanding but don't require your specific judgment:

- GL coding suggestions (AI proposes, human confirms at ≥90% confidence)
- Draft generation (AI writes, human calibrates)
- Pattern identification (AI flags, human decides)
- Summarization (AI compresses, human uses)

**The rule: AI handles the first pass. You handle the judgment call. Never the reverse.**

---

## Deferral Logic

Deferral is not avoidance. It is a deliberate decision that something is not the right use of attention right now.

### When to Defer
- The decision will be better made with more information that will naturally emerge
- The task depends on something else that isn't ready
- The cost of doing it wrong is high and the urgency is low
- You are in a cognitive state that isn't suited to the work

### When Not to Defer
- The task is blocking something more important
- Deferral will make the task harder (context decay, dependency accumulation)
- You've deferred it three times already (this is a signal, not coincidence)
- The urgency is real and you're avoiding it, not managing it

### The Defer vs. Delete Test
Is this on your list because it should be done, or because deleting it feels like failure? Work that isn't worth doing isn't worth deferring. Delete it.

---

## Decision Fatigue Management

As the sole decision-maker, decision fatigue is an operational risk. A decision made at 11pm after a full build day carries less quality than the same decision made at 10am.

### High-Stakes Decisions
Make these on fresh cognitive bandwidth:
- Product architecture
- Scope decisions
- Commitment to a technology or vendor
- Anything that's expensive to reverse

### Decision Pre-Loading
Before a work session, decide what you're going to decide. Don't spend working time figuring out what to work on. That decision should happen before the session starts.

Pre-session question: *What is the one thing that, if I complete it today, makes tomorrow easier?*

### Default Rules
For recurring decisions, have a default rule that removes the decision:
- Auth.js over Clerk, always
- Prisma migrate deploy only, never db push
- Soft delete only
- Neon over Supabase for new projects
- Mobile-first, always

Default rules are pre-made decisions. They cost nothing to apply and prevent the accumulation of small decisions that drain attention.

---

## The Pre-Ship Checklist Discipline

As a solo operator, the pre-ship checklist is the equivalent of a second set of eyes. It doesn't replace judgment — it ensures the judgment was applied consistently.

What a pre-ship checklist should catch:
- Security review (are there obvious vulnerabilities?)
- Auth enforcement (are protected routes actually protected?)
- Error states (do failure paths produce useful states, not broken ones?)
- Mobile behavior (does this work on a phone?)
- Vesta classification (is this a GARDRAILS product, a Viform product, or a Vesta experiment?)

The checklist is not comprehensive review. It is a minimum viable gate.

---

## Shipping Without a Team

The temptation of the solo builder is to polish indefinitely because there's no external pressure to ship. The discipline is shipping at "good enough to learn from," not "perfect in isolation."

### Shipping Doctrine
- Ship when the core job is done, not when every edge case is handled
- Edge cases are discovered in production, not in development
- A shipped product with known gaps is better than an unshipped product with imagined completeness
- Document the gaps before shipping, not after discovering them

### The "What Breaks If I Ship This" Test
Before shipping, name the three things most likely to break in real use. If you can fix them in under an hour, fix them. If not, document them and ship.

### Coherence Over Coverage
One well-made thing ships better than five half-made things. The solo operator's temptation is to start too many things. The discipline is finishing fewer things completely.

*Fewer products, shipped and working, beats a portfolio of perpetual WIPs.*

---

## Energy Management as Infrastructure

For a solo operator, personal energy is a production resource.

### Late-Night Builder Pattern
Creative and architectural work flows better late at night — fewer interruptions, lower stakes, deeper focus. This is a real cognitive pattern, not a bad habit to fix.

Design your schedule around it rather than against it. Front-load obligations. Protect late hours for build work.

### Recovery as Productivity
Burned-out operators make bad product decisions. Rest is not time away from work — it is a prerequisite for Tier 1 judgment. A day of rest that enables three days of good decisions is positive leverage.

### Context Preservation
At the end of every work session, capture where you are:
- What is the next specific action?
- What decision is pending?
- What is the current state of the thing you're building?

The 3-minute capture at end of session is worth 30 minutes of reconstruction at the start of the next one.
