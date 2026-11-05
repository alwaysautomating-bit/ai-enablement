# AP Approvals Discovery Pilot Spec

Oct 22, 2026 · @Laura

A conversational AI interviews each person in one AP approval workflow, keeps the raw answers private to the AI enabler, and produces a process map that preserves disagreements and is checked against SOPs and system records.

## Participant opener

Read or show this at the start of every interview, then go straight to the first question. Two or three sentences, conversational, no legal tone.

> "This conversation is just for me. I'm trying to understand how the work really happens so I can make it easier. I share patterns with the team, never who said what. The one exception is if I run into something that puts the company or someone in it at real risk, and I'd talk to you first. You know this work better than anyone, so I'm here to learn from you."

Delivery rules:

- Use the same wording for every participant so nobody wonders what the others were told.
- Drop the last clause ("I'd talk to you first") if you will not actually do that in every case.
- Never open with an overdue approval, a missed deadline, or any individual's performance.

## Privacy rules

Raw interview responses belong to the AI enabler and exist to help participants. Management receives synthesized findings backed by documents and system records.

| Item | Rule |
| --- | --- |
| Raw transcripts and notes | Visible only to the AI enabler. Never shared with management or other participants. |
| What management sees | Process findings with supporting data. Findings are attributed to the process, never to a person. |
| Unique roles | With six participants, a role like Controller identifies one person. Generalize the claim, or get the participant's approval of the exact wording before it appears. |
| Interviews and audits | Interview data stays out of any audit or enforcement system. Only approved process requirements flow into implementation. |
| Stated exception | If the AI enabler finds something that puts the company or a person at real risk, it is raised. The default is to talk to the participant first. |
| Participant access | Participants can read and correct their own transcript, and ask for it to be deleted. |
| AI vendor | Confirm the model provider does not retain or train on transcripts before promising privacy. Participants will ask. |
| Retention | Set a deletion date for raw data at the end of the engagement. |

The engagement agreement has to back every row above. If the client owns all engagement data, the privacy promise to participants is not enforceable, and raw interviews could be pulled into legal discovery or an HR matter.

The "talk to you first" default can yield to an active fraud situation or a legal obligation. Word the agreement so it does not conflict.

## Interview guide

Each interview runs 30 to 45 minutes and is bounded by that person's own responsibilities. The agent responds to what the person says and picks follow-ups from the topics below. It does not march through a questionnaire.

**Opening question:** "Walk me through what happens when something needs your approval."

| Topic | Example follow-up |
| --- | --- |
| Cadence | "Is there a day or time you usually handle these?" |
| Channels | "Where do requests reach you? Is there one place you check to be sure you've seen everything?" |
| Documentation | "Where does the approval get recorded afterward?" |
| Handoffs | "What happens right after you finish? How does the next person know?" |
| Unusual cases | "Tell me about the last time something didn't fit the normal flow. What did you do?" |
| Authorization | "What makes you comfortable approving something? Is there anything you'd want to check first?" |
| Ideal workflow | "In your ideal world, how would this work?" |

What each role covers:

- **AP specialist:** intake, verification, invoice processing, payment preparation.
- **Manager:** how requests arrive, how they are evaluated, decisions, handoff of completed approvals.
- **Controller and treasury:** authorization requirements, banking cutoffs, where approvals must be documented.
- **Vendor:** how instructions arrive, invoice submission, status checks, dispute resolution.

Agent rules:

- Be curious, neutral, and specific. Treat the participant as a knowledgeable designer of the work.
- Ask about the last time something went sideways, because workarounds surface when the question assumes they are normal.
- Never assume the current process is wrong, frame a question around an individual failure, or ask someone to defend a decision.
- Summarize back what you heard before moving to the next topic.

## Tuning by industry and team

The discovery flow has a fixed core and a swappable tuning profile. The core covers the opener, privacy rules, output schema, conflict handling, and the validation loop. A profile changes what the agent asks about, what it checks against, and what counts as an escalation. Build the profile before the first interview of an engagement, ideally in an hour or two from public material plus a short call with the sponsor.

**What a profile contains**

| Profile field | What it controls |
| --- | --- |
| Vocabulary | The terms people actually use ("draw", "pay app", "chart of accounts", "ticket"), so the agent sounds like it knows the work |
| Role map | Which roles take part and what each one is responsible for |
| Topic weights | Which follow-up topics get extra depth (cadence, handoffs, authorization, exceptions) |
| Evidence sources | Where claims get checked: systems, logs, documents, regulators' required records |
| Constraints | Regulation, contracts, and cutoffs that shape any redesign |
| Escalation triggers | What counts as real risk for this industry, spelled out in the participant opener |
| Format | Interview length, channel (chat, voice, mobile in the field), and scheduling around shift patterns |

**Industry profiles (examples)**

| Industry | Tune toward | Evidence sources | Escalation triggers |
| --- | --- | --- | --- |
| Construction | Field-to-office handoffs, change orders, lien waivers, pay applications; interviews short and mobile-friendly | Daily logs, change order records, pay app history, lien waiver files | Payment released without waivers, duplicate billing, falsified field records |
| Healthcare | Intake, authorization, billing handoffs; strict care-time constraints | Scheduling and billing system logs, prior-auth records | Anything touching patient data outside policy, billing for services not rendered |
| Financial services and family offices | Approval hierarchies, segregation of duties, wire controls, entity-level authority | Banking platform logs, delegation records, reconciliations | Control bypasses, wire instructions changed outside verification |
| Professional services | Time capture, billing approvals, client onboarding | Time entry logs, invoicing system, engagement letters | Billing for work not performed, conflicts of interest |
| Manufacturing | Shop-floor to ERP handoffs, quality holds, receiving and 3-way match | ERP transactions, receiving logs, quality records | Safety shortcuts, falsified quality or receiving records |

**Team profiles (examples)**

| Team | Tune toward | Typical gaps that surface |
| --- | --- | --- |
| AP and finance | Intake channels, verification, approval chains, payment cutoffs | Approvals scattered across email, chat, and tickets; unclear approver limits |
| Field and operations | Capture at the point of work, photos and signatures, what gets lost between site and office | Double entry, delayed documentation, proof of work that lives on personal phones |
| Sales and RevOps | Lead handoffs, quote approvals, discounting authority, CRM discipline | Shadow spreadsheets, discount approvals by chat |
| HR and people | Onboarding, approvals, policy exceptions; heightened privacy sensitivity | Manual checklists, inconsistent exception handling |
| IT and security | Access requests, change approvals, incident response | Access granted informally, change records written after the fact |
| Support and customer success | Triage, escalation paths, knowledge gaps | Answers living in individual heads, inconsistent escalation |

**How to build a profile**

1. Learn the industry's vocabulary and required records from public sources and the sponsor.
2. Ask the sponsor for the org chart, current SOPs, and the systems list.
3. Pick the roles, weight the follow-up topics, and write the escalation triggers into the opener's plain-language exception.
4. Run the first two interviews as a dry run, then adjust vocabulary and topic weights before the rest.
5. Save the finished profile so the next engagement in that industry starts from it.

Two cautions. Do not build all of these profiles before the pilot: build the AP profile for the pilot, then add a second one after you see which parts of the first needed changing. And keep the privacy core identical across every profile, because participants compare notes, and a rule that changes by team erodes trust faster than any single answer can build it.

## Output schema

Interviews produce claims about how work happens. Every claim carries a verification status, and disagreements stay in the record instead of being resolved by picking one account.

| Field | What it holds |
| --- | --- |
| Roles and responsibilities | Who performs each action and who holds authority |
| Inputs and requirements | What information a person needs before they can act |
| Handoffs | What triggers the next person's work and how it reaches them |
| Timing | Cadence, deadlines, banking cutoffs, escalation expectations |
| Exceptions | Unusual cases and how people resolve them today |
| Systems | Where work is recorded, performed, and verified |
| Improvement ideas | What participants would change, with the reason given |
| Conflicts | Places where accounts disagree, with each version side by side |
| Open questions | Gaps nobody could answer yet |
| Verification status | Per claim: unverified, confirmed by record, or contradicted by record |

The merged process map assembles the overlapping accounts into one proposed workflow and marks where they agree. Each participant reviews the map before anything is finalized, with the prompt "Here's how I understood your workflow. What's missing or wrong?"

Ideal-world answers are logged as design requirements. Evaluate each against policy, risk, and operational constraints, and look for ones that satisfy several roles at once (a single Wednesday approval cycle, for example, can serve the manager, AP, treasury, and vendors).

## Verification

Interviews tell the AI enabler where to look. Conclusions in the final review rest on records the client can check for themselves.

| Claim type | Checked against |
| --- | --- |
| "Approvals go through Asana" | Task history and approval timestamps in Asana |
| "I approve from email" | Email threads and message dates for a sample of payments |
| "Wires are documented in the bank platform" | Banking platform authorization logs |
| "We can't execute until the bank records authorization" | Bank audit trail compared with payment execution times |
| "This is the documented process" | Current SOPs and policy documents |
| "Who may approve what" | Delegation of authority and approval limit records, which interviews cannot establish |
| Workarounds and exceptions | Sample of recent exception cases, traced through the records above |

Pick a sample window (for example, the last 90 days of payments) before the first interview so the checks are the same for every claim.

## Pilot run sequence

1. **Scope:** pick one AP approval workflow and 5 to 8 participants across AP, management, controller, treasury, and at least one vendor.
2. **Agree terms:** engagement agreement covers data ownership, retention, and the privacy rules above.
3. **Collect records:** pull current SOPs and the verification sample before interviews begin.
4. **Discover:** run one interview per participant, scheduled at their convenience.
5. **Reconstruct:** merge the accounts into one process map, keeping conflicts and open questions visible.
6. **Verify:** check each claim against the records and update its status.
7. **Validate:** show each participant the map and fix what they say is missing or wrong.
8. **Redesign:** list unnecessary work, weak handoffs, and missing controls. Check what the existing tools already handle before proposing anything new.
9. **Agree:** the right people approve the revised SOP.
10. **Final review:** present findings with data to management. No raw interview content.

## Open questions

- [ ] Which client and which AP approval workflow is the pilot?
- [ ] Chat, voice, or both for the interviews?
- [ ] Which AI model provider handles transcripts, and what are its retention and training terms?
- [ ] What exact wording in the engagement agreement keeps raw responses with the AI enabler?
- [ ] What does the "talk to you first" exception look like when the risk is active fraud?
- [ ] Is the pilot priced as a fixed-scope engagement (one workflow, set interview count, defined deliverables)?
