---
name: extract-candidate-operational-context
description: Extract reviewable entities, responsibilities, relationships, decisions, rules, exceptions, and open questions from reconstructed work conversations. Use after authorized evidence has been assembled; outputs remain unreviewed candidates.
metadata:
  domain: context-capture
  source: AI Enablement Workspace context extractor, promoted 2026-09-29 and migrated to the current PORK ontology 2026-10-20
---

# Extract Candidate Operational Context

Propose what reconstructed workplace conversations establish about how work operates. A human reviews every item before it is trusted, so exact grounding and honest uncertainty matter more than coverage.

## Read the record

- Read each reconstructed conversation in order and retain missing-context warnings.
- Treat duplicates as repeated evidence, not independent confirmation.
- Preserve corrections and superseding assertions rather than deleting earlier states.
- Do not promote sarcasm, jokes, complaints, hypotheticals, or unanswered questions into facts.
- Merge aliases or pronouns only when the record supports the identity link.

## Keep times separate

Record communication time independently from the time an assertion allegedly became operationally true. Preserve the original temporal phrase and classify its basis as `STATED_IN_TEXT`, `INFERRED_FROM_CONTEXT`, `COMMUNICATION_TIME`, or `UNKNOWN`.

## Produce candidates

Return relevant entities and atomic assertions of type `RELATIONSHIP`, `RESPONSIBILITY`, `DECISION`, `RULE`, `EXCEPTION`, or `OPEN_QUESTION`.

For every assertion:

- identify subject, predicate, and object where applicable;
- bind it to speaker, message, thread, and source identifiers;
- include at least one exact supporting quote;
- state modality, confidence, operational time, and time basis;
- link any confirmed fact it may supersede;
- surface conflict, missing context, and alternative interpretations.

Never invent an entity, date, authority, or fact. These records are quoted assertions and unreviewed candidates, not accepted operational state.
