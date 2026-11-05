"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Lock,
  MessageSquareText,
  Pencil,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

// Plain-language copy follows the Vocabulary-Earned Doctrine: the screen talks about
// conversations, what was found, and where it was seen. Internal terms (assertion,
// evidence, provenance, connector) stay out of first-use copy.

type ScopeOption = { scopeType: string; value: string; label: string; unavailableReason: string | null };
type Source = {
  grantId: string;
  provider: string;
  name: string;
  readOnly: boolean;
  permissions: Array<{ scope: string; plainLanguage: string }>;
  options: ScopeOption[];
};
type CaptureListItem = { id: string; question: string; status: string; createdAt: string; items: number };
type EntityRef = { id: string; canonicalName: string; entityType: string; status: string } | null;
type EvidenceView = {
  evidenceId: string;
  where: string;
  author: string;
  communicatedAt: string;
  permalink: string | null;
  quote: string;
  role: string;
  excerpt: string;
  quoteStart: number;
  quoteEnd: number;
  access: string;
};
type Item = {
  id: string;
  kind: string;
  bucket: string;
  statement: string;
  subject: EntityRef;
  predicate: string | null;
  object: EntityRef;
  operationalStatus: string;
  modality: string;
  confidence: number;
  operationalTime: { from: string | null; to: string | null; basis: string; expression: string | null };
  communicated: { first: string; last: string };
  rationale: string;
  audience: string;
  reviewState: string;
  evidence: EvidenceView[];
};
type CaptureView = {
  id: string;
  question: string;
  status: string;
  failureReason: string | null;
  extractor: { version: string | null; model: string | null };
  stats: {
    messagesRead?: number;
    conversations?: number;
    duplicates?: number;
    setAside?: number;
    rejected?: Array<{ statement: string; reason: string }>;
  };
  summary: { people: number; otherEntities: number; responsibilityChanges: number; needsReview: number; byBucket: Record<string, number> };
  entities: Array<{ id: string; name: string; type: string; status: string; aliases: string[] }>;
  conversations: Array<{ id: string; label: string; basis: string[]; messages: Array<{ sourceMessageId: string }> }>;
  assertions: Item[];
};
type TimelineEntry = {
  relationshipId: string;
  from: { id: string; canonicalName: string };
  predicate: string;
  to: { id: string; canonicalName: string };
  operationalTime: { validFrom: string | null; validTo: string | null; basis: string; startKnown: boolean };
  firstCommunicatedAt: string;
  current: boolean;
  closedBy: string | null;
  statement: string;
};

const BUCKETS: Array<{ id: string; label: string }> = [
  { id: "RESPONSIBILITIES", label: "Who's responsible" },
  { id: "RELATIONSHIPS", label: "How things connect" },
  { id: "DECISIONS", label: "Decisions" },
  { id: "RULES_AND_EXCEPTIONS", label: "Rules & exceptions" },
  { id: "OPEN_QUESTIONS", label: "Open questions" },
  { id: "PEOPLE_AND_ENTITIES", label: "People & things" },
];

const EXAMPLES = [
  "How do invoices from our main contractor actually get approved and paid?",
  "Everything about one customer account over the last 90 days",
  "Who owns vendor onboarding now, and what changed recently?",
];

const MODALITY_LABEL: Record<string, string> = {
  HYPOTHETICAL: "Sounds hypothetical",
  QUESTION: "Asked, not answered",
  SARCASM_OR_JOKE: "Possibly a joke",
  UNCERTAIN: "Uncertain",
};

const TIME_BASIS_LABEL: Record<string, string> = {
  STATED_IN_TEXT: "stated in the message",
  INFERRED_FROM_CONTEXT: "inferred from nearby messages",
  COMMUNICATION_TIME: "assumed from when it was said",
  STATED_BY_REVIEWER: "set by you",
  UNKNOWN: "not stated",
};

const REVIEW_LABEL: Record<string, string> = {
  NEEDS_REVIEW: "Not confirmed yet",
  CONFIRMED: "Confirmed",
  CORRECTED: "Corrected",
  NOT_USEFUL: "Not useful",
};

function formatDay(value: string | null) {
  if (!value) return null;
  return new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function confidenceLabel(value: number) {
  if (value >= 0.85) return "Strong";
  if (value >= 0.65) return "Fairly sure";
  if (value >= 0.4) return "Tentative";
  return "Weak";
}

function humanize(predicate: string) {
  return predicate.replace(/_/g, " ");
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Something went wrong.");
  return body as T;
}

export function ContextCapture() {
  const [sources, setSources] = useState<Source[]>([]);
  const [captures, setCaptures] = useState<CaptureListItem[]>([]);
  const [capture, setCapture] = useState<CaptureView | null>(null);
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  // No default window: a rolling "last N days" silently drops older messages as time passes.
  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");
  const [permissionsReviewed, setPermissionsReviewed] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bucket, setBucket] = useState("RESPONSIBILITIES");

  const refreshList = useCallback(async () => {
    const [sourceBody, captureBody] = await Promise.all([
      api<{ sources: Source[] }>("/api/context/sources"),
      api<{ captures: CaptureListItem[] }>("/api/context/captures"),
    ]);
    setSources(sourceBody.sources);
    setCaptures(captureBody.captures);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [sourceBody, captureBody] = await Promise.all([
          api<{ sources: Source[] }>("/api/context/sources"),
          api<{ captures: CaptureListItem[] }>("/api/context/captures"),
        ]);
        if (!active) return;
        setSources(sourceBody.sources);
        setCaptures(captureBody.captures);
      } catch (reason) {
        if (active) setError((reason as Error).message);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const openCapture = useCallback(async (id: string) => {
    setError(null);
    const body = await api<{ capture: CaptureView }>(`/api/context/captures/${id}`);
    setCapture(body.capture);
  }, []);

  const optionKey = (grantId: string, option: ScopeOption) => `${grantId}|${option.scopeType}|${option.value}`;
  const chosen = useMemo(
    () =>
      sources.flatMap((source) =>
        source.options
          .filter((option) => !option.unavailableReason && selected[optionKey(source.grantId, option)])
          .map((option) => ({ grantId: source.grantId, scopeType: option.scopeType, value: option.value, label: option.label })),
      ),
    [sources, selected],
  );
  const chosenSources = sources.filter((source) => chosen.some((scope) => scope.grantId === source.grantId));

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const body = await api<{ captureId: string }>("/api/context/captures", {
        method: "POST",
        body: JSON.stringify({
          question,
          windowStart: windowStart || null,
          windowEnd: windowEnd || null,
          scopes: chosen,
          permissionsReviewed,
        }),
      });
      await openCapture(body.captureId);
      await refreshList();
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="cc-shell">
      <header className="cc-header">
        <Link className="text-button" href="/">
          <ArrowLeft size={16} /> Workspace
        </Link>
        <div>
          <p className="eyebrow">Understand how something actually works</p>
          <h1>{capture ? capture.question : "What should I understand?"}</h1>
        </div>
      </header>

      <div className="cc-layout">
        <aside className="cc-rail" aria-label="Earlier questions">
          <button
            className="secondary-button cc-new"
            type="button"
            onClick={() => {
              setCapture(null);
              setError(null);
            }}
          >
            <Sparkles size={16} /> New question
          </button>
          <p className="eyebrow">Earlier questions</p>
          {captures.length === 0 && <p className="cc-muted">Nothing yet.</p>}
          <ul className="cc-history">
            {captures.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`cc-history-item ${capture?.id === item.id ? "active" : ""}`}
                  onClick={() => openCapture(item.id).catch((reason: Error) => setError(reason.message))}
                >
                  <span>{item.question}</span>
                  <small>
                    {item.status === "READY_FOR_REVIEW" ? `${item.items} to look at` : item.status.toLowerCase().replace(/_/g, " ")}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="cc-main">
          {error && (
            <p className="cc-error" role="alert">
              {error}
            </p>
          )}
          {!capture && (
            <AskForm
              question={question}
              setQuestion={setQuestion}
              sources={sources}
              selected={selected}
              setSelected={setSelected}
              optionKey={optionKey}
              windowStart={windowStart}
              windowEnd={windowEnd}
              setWindowStart={setWindowStart}
              setWindowEnd={setWindowEnd}
              chosenSources={chosenSources}
              permissionsReviewed={permissionsReviewed}
              setPermissionsReviewed={setPermissionsReviewed}
              canRun={question.trim().length >= 8 && chosen.length > 0 && permissionsReviewed && !running}
              running={running}
              run={run}
            />
          )}
          {capture && (
            <CaptureReview
              capture={capture}
              bucket={bucket}
              setBucket={setBucket}
              reload={() => openCapture(capture.id)}
              onError={setError}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function AskForm(props: {
  question: string;
  setQuestion: (value: string) => void;
  sources: Source[];
  selected: Record<string, boolean>;
  setSelected: (value: Record<string, boolean>) => void;
  optionKey: (grantId: string, option: ScopeOption) => string;
  windowStart: string;
  windowEnd: string;
  setWindowStart: (value: string) => void;
  setWindowEnd: (value: string) => void;
  chosenSources: Source[];
  permissionsReviewed: boolean;
  setPermissionsReviewed: (value: boolean) => void;
  canRun: boolean;
  running: boolean;
  run: () => void;
}) {
  return (
    <div className="cc-ask">
      <section className="cc-panel">
        <label className="field-label" htmlFor="cc-question">
          Describe it the way you would to a colleague
        </label>
        <textarea
          id="cc-question"
          className="text-area"
          rows={3}
          value={props.question}
          onChange={(event) => props.setQuestion(event.target.value)}
          placeholder="How do our contractor invoices actually get approved, and who handles them now?"
        />
        <div className="cc-examples">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" className="cc-chip" onClick={() => props.setQuestion(example)}>
              {example}
            </button>
          ))}
        </div>
      </section>

      <section className="cc-panel">
        <h2>Where do these conversations happen?</h2>
        <p className="cc-muted">I only look where you choose, and only within the dates you set.</p>
        <div className="cc-sources">
          {props.sources.map((source) => (
            <fieldset key={source.grantId} className="cc-source">
              <legend>
                <MessageSquareText size={16} /> {source.name}
              </legend>
              {source.options.map((option) => {
                const key = props.optionKey(source.grantId, option);
                return (
                  <label key={key} className={`cc-option ${option.unavailableReason ? "disabled" : ""}`}>
                    <input
                      type="checkbox"
                      disabled={Boolean(option.unavailableReason)}
                      checked={Boolean(props.selected[key])}
                      onChange={(event) => props.setSelected({ ...props.selected, [key]: event.target.checked })}
                    />
                    <span>{option.label}</span>
                    {option.unavailableReason && <small>{option.unavailableReason}</small>}
                  </label>
                );
              })}
            </fieldset>
          ))}
        </div>
        <div className="cc-dates">
          <label>
            <span className="field-label">From (optional)</span>
            <input className="text-input" type="date" value={props.windowStart} onChange={(e) => props.setWindowStart(e.target.value)} />
          </label>
          <label>
            <span className="field-label">To (optional)</span>
            <input className="text-input" type="date" value={props.windowEnd} onChange={(e) => props.setWindowEnd(e.target.value)} />
          </label>
        </div>
      </section>

      {props.chosenSources.length > 0 && (
        <section className="cc-panel cc-permissions">
          <h2>
            <ShieldCheck size={18} /> What this can read
          </h2>
          {props.chosenSources.map((source) => (
            <div key={source.grantId}>
              <strong>{source.name}</strong>
              <ul>
                {source.permissions.map((permission) => (
                  <li key={permission.scope}>{permission.plainLanguage}</li>
                ))}
              </ul>
            </div>
          ))}
          <label className="cc-option">
            <input
              type="checkbox"
              checked={props.permissionsReviewed}
              onChange={(event) => props.setPermissionsReviewed(event.target.checked)}
            />
            <span>I have reviewed what this can read. Nothing will be sent, posted, or changed.</span>
          </label>
        </section>
      )}

      <div className="action-row">
        <button className="primary-button" type="button" disabled={!props.canRun} onClick={props.run}>
          {props.running ? "Reading conversations…" : "Look through these conversations"}
        </button>
      </div>
    </div>
  );
}

function CaptureReview(props: {
  capture: CaptureView;
  bucket: string;
  setBucket: (value: string) => void;
  reload: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const { capture } = props;
  const [showDropped, setShowDropped] = useState(false);
  const [timelineFor, setTimelineFor] = useState<string | null>(null);

  if (capture.status === "FAILED") {
    return <p className="cc-error">This did not finish: {capture.failureReason ?? "unknown problem"}.</p>;
  }

  const items = capture.assertions.filter((item) => item.bucket === props.bucket);
  const rejected = capture.stats.rejected ?? [];
  const tiles = [
    { label: "Messages read", value: capture.stats.messagesRead ?? 0 },
    { label: "Conversations pieced together", value: capture.stats.conversations ?? 0 },
    { label: "People", value: capture.summary.people },
    { label: "Accounts, projects & others", value: capture.summary.otherEntities },
    { label: "Changes in who's responsible", value: capture.summary.responsibilityChanges },
    { label: "Open questions", value: capture.summary.byBucket.OPEN_QUESTIONS ?? 0 },
    { label: "Still to look at", value: capture.summary.needsReview },
  ];

  return (
    <div className="cc-review">
      <section className="cc-panel">
        <h2>What I found</h2>
        <div className="cc-tiles">
          {tiles.map((tile) => (
            <div key={tile.label} className="cc-tile">
              <strong>{tile.value}</strong>
              <span>{tile.label}</span>
            </div>
          ))}
        </div>
        <p className="cc-muted">
          {capture.stats.setAside ?? 0} messages didn&apos;t bear on the question and {capture.stats.duplicates ?? 0} repeated
          another message. Nothing here is trusted until you confirm it.
        </p>
        {rejected.length > 0 && (
          <div>
            <button className="text-button" type="button" onClick={() => setShowDropped(!showDropped)}>
              {showDropped ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {`${rejected.length} ${rejected.length === 1 ? "suggestion was" : "suggestions were"} dropped because the cited words weren't in the message`}
            </button>
            {showDropped && (
              <ul className="cc-dropped">
                {rejected.map((item) => (
                  <li key={item.statement}>
                    {item.statement} <small>— {item.reason}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <nav className="cc-tabs" aria-label="What was found">
        {BUCKETS.map((entry) => {
          const count =
            entry.id === "PEOPLE_AND_ENTITIES" ? capture.entities.length : (capture.summary.byBucket[entry.id] ?? 0);
          return (
            <button
              key={entry.id}
              type="button"
              className={`cc-tab ${props.bucket === entry.id ? "active" : ""}`}
              onClick={() => props.setBucket(entry.id)}
            >
              {entry.label} <span>{count}</span>
            </button>
          );
        })}
      </nav>

      {props.bucket === "PEOPLE_AND_ENTITIES" ? (
        <section className="cc-panel">
          <ul className="cc-entities">
            {capture.entities.map((entity) => (
              <li key={entity.id}>
                <div>
                  <strong>{entity.name}</strong>{" "}
                  <small className="cc-muted">
                    {entity.type.toLowerCase()} · {entity.status === "CONFIRMED" ? "confirmed" : "not confirmed yet"}
                  </small>
                  {entity.aliases.length > 0 && <p className="cc-muted">Also called: {entity.aliases.join(", ")}</p>}
                </div>
                <button className="text-button" type="button" onClick={() => setTimelineFor(entity.id)}>
                  <Clock size={14} /> Over time
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="cc-cards">
          {items.length === 0 && <p className="cc-muted">Nothing in this group.</p>}
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              reload={props.reload}
              onError={props.onError}
              showTimeline={setTimelineFor}
            />
          ))}
        </div>
      )}

      {timelineFor && <Timeline entityId={timelineFor} onClose={() => setTimelineFor(null)} />}
    </div>
  );
}

function ItemCard(props: {
  item: Item;
  reload: () => Promise<void>;
  onError: (message: string) => void;
  showTimeline: (entityId: string) => void;
}) {
  const { item } = props;
  const [open, setOpen] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [visibility, setVisibility] = useState<"OWNER" | "SOURCE_AUDIENCE">("OWNER");
  const [statement, setStatement] = useState(item.statement);
  const [from, setFrom] = useState(item.operationalTime.from ?? "");
  const [to, setTo] = useState(item.operationalTime.to ?? "");
  const [saving, setSaving] = useState(false);
  const pending = item.reviewState === "NEEDS_REVIEW";

  async function decide(decision: "CONFIRM" | "CORRECT" | "NOT_USEFUL") {
    setSaving(true);
    try {
      const correction =
        decision === "CORRECT"
          ? {
              ...(statement.trim() !== item.statement ? { statement: statement.trim() } : {}),
              ...(from !== (item.operationalTime.from ?? "") ? { effectiveFrom: from || null } : {}),
              ...(to !== (item.operationalTime.to ?? "") ? { effectiveTo: to || null } : {}),
            }
          : undefined;
      await api(`/api/context/assertions/${item.id}/review`, {
        method: "POST",
        body: JSON.stringify({ decision, visibility, correction }),
      });
      await props.reload();
    } catch (reason) {
      props.onError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const happened = item.operationalTime.from || item.operationalTime.to;
  const timelineEntity = item.object?.entityType !== "PERSON" ? item.object : item.subject;

  return (
    <article className={`cc-card ${pending ? "" : "decided"}`}>
      <div className="cc-card-top">
        <span className={`cc-state ${item.reviewState.toLowerCase()}`}>{REVIEW_LABEL[item.reviewState] ?? item.reviewState}</span>
        {MODALITY_LABEL[item.modality] && <span className="cc-flag">{MODALITY_LABEL[item.modality]}</span>}
        {item.operationalStatus === "ABANDONED" && <span className="cc-flag">Dropped</span>}
        {item.operationalStatus === "PROPOSED" && <span className="cc-flag">Proposed, not done</span>}
        <span className="cc-confidence">{confidenceLabel(item.confidence)}</span>
      </div>
      <p className="cc-statement">{item.statement}</p>

      <dl className="cc-times">
        <div>
          <dt>When it was true</dt>
          <dd>
            {happened ? (
              <>
                {item.operationalTime.from ? formatDay(item.operationalTime.from) : "Unknown start"}
                {item.operationalTime.to ? ` → ${formatDay(item.operationalTime.to)}` : item.operationalStatus === "ACTIVE" ? " → now" : ""}
              </>
            ) : (
              "Not stated"
            )}
            <small>
              {" "}
              ({TIME_BASIS_LABEL[item.operationalTime.basis] ?? item.operationalTime.basis}
              {item.operationalTime.expression ? `: “${item.operationalTime.expression}”` : ""})
            </small>
          </dd>
        </div>
        <div>
          <dt>When it was said</dt>
          <dd>
            {formatDay(item.communicated.first)}
            {item.communicated.last.slice(0, 10) !== item.communicated.first.slice(0, 10)
              ? ` – ${formatDay(item.communicated.last)}`
              : ""}
          </dd>
        </div>
        <div>
          <dt>Who could see the messages</dt>
          <dd>
            <Lock size={12} /> {item.audience}
          </dd>
        </div>
      </dl>

      <button className="text-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Where I saw it ({item.evidence.length})
      </button>
      {open && (
        <div className="cc-evidence">
          <p className="cc-muted">{item.rationale}</p>
          {item.evidence.map((evidence) => (
            <figure key={`${evidence.evidenceId}-${evidence.quoteStart}`} className="cc-quote">
              <figcaption>
                <strong>{evidence.author}</strong> · {evidence.where} · {formatDay(evidence.communicatedAt)}
                {evidence.role !== "SUPPORTS" && (
                  <span className="cc-flag">{evidence.role === "CONTRADICTS" ? "Points the other way" : "Background"}</span>
                )}
              </figcaption>
              <blockquote>
                {evidence.excerpt.slice(0, evidence.quoteStart)}
                <mark>{evidence.excerpt.slice(evidence.quoteStart, evidence.quoteEnd)}</mark>
                {evidence.excerpt.slice(evidence.quoteEnd)}
              </blockquote>
              <small className="cc-muted">
                <Eye size={12} /> {evidence.access}
              </small>
            </figure>
          ))}
        </div>
      )}

      {pending && (
        <div className="cc-decide">
          {correcting && (
            <div className="cc-correct">
              <label>
                <span className="field-label">What is actually true</span>
                <textarea className="text-area" rows={2} value={statement} onChange={(e) => setStatement(e.target.value)} />
              </label>
              <div className="cc-dates">
                <label>
                  <span className="field-label">True from</span>
                  <input className="text-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </label>
                <label>
                  <span className="field-label">Until</span>
                  <input className="text-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </label>
              </div>
            </div>
          )}
          <fieldset className="cc-visibility">
            <legend className="field-label">Once confirmed, who can use this?</legend>
            <label className="cc-option">
              <input type="radio" checked={visibility === "OWNER"} onChange={() => setVisibility("OWNER")} />
              <span>Just me</span>
            </label>
            <label className="cc-option">
              <input type="radio" checked={visibility === "SOURCE_AUDIENCE"} onChange={() => setVisibility("SOURCE_AUDIENCE")} />
              <span>People who could already see these messages ({item.audience.toLowerCase()})</span>
            </label>
          </fieldset>
          <div className="cc-actions">
            {correcting ? (
              <>
                <button className="primary-button" type="button" disabled={saving} onClick={() => decide("CORRECT")}>
                  <Check size={16} /> Save correction
                </button>
                <button className="secondary-button" type="button" onClick={() => setCorrecting(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="primary-button" type="button" disabled={saving} onClick={() => decide("CONFIRM")}>
                  <Check size={16} /> Confirm
                </button>
                <button className="secondary-button" type="button" disabled={saving} onClick={() => setCorrecting(true)}>
                  <Pencil size={16} /> Correct
                </button>
                <button className="danger-button" type="button" disabled={saving} onClick={() => decide("NOT_USEFUL")}>
                  <X size={16} /> Not useful
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {!pending && timelineEntity && item.kind !== "OPEN_QUESTION" && (
        <button className="text-button" type="button" onClick={() => props.showTimeline(timelineEntity.id)}>
          <Clock size={14} /> See {timelineEntity.canonicalName} over time
        </button>
      )}
    </article>
  );
}

function Timeline(props: { entityId: string; onClose: () => void }) {
  const [data, setData] = useState<{ entity: { name: string }; timeline: TimelineEntry[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ entity: { name: string }; timeline: TimelineEntry[] }>(`/api/context/timeline?entity=${encodeURIComponent(props.entityId)}`)
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, [props.entityId]);

  return (
    <div className="modal-backdrop" role="presentation" onClick={props.onClose}>
      <section className="modal cc-timeline" role="dialog" aria-modal="true" aria-label="Over time" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{data ? `${data.entity.name} over time` : "Over time"}</h2>
          <button className="text-button" type="button" onClick={props.onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          {error && <p className="cc-error">{error}</p>}
          {data && data.timeline.length === 0 && <p className="cc-muted">Nothing confirmed yet. Confirm items to build this history.</p>}
          <ol className="cc-timeline-list">
            {data?.timeline.map((entry) => (
              <li key={entry.relationshipId} className={entry.current ? "current" : ""}>
                <div className="cc-window">
                  {entry.operationalTime.validFrom ? formatDay(entry.operationalTime.validFrom) : "Unknown start"} →{" "}
                  {entry.operationalTime.validTo ? formatDay(entry.operationalTime.validTo) : "now"}
                </div>
                <div>
                  <strong>{entry.from.canonicalName}</strong> {humanize(entry.predicate)} <strong>{entry.to.canonicalName}</strong>
                  <p className="cc-muted">
                    First mentioned {formatDay(entry.firstCommunicatedAt)}
                    {entry.closedBy && !entry.current ? " · ended by a later change" : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
