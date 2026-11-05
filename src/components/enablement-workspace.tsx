"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Database,
  FileSearch,
  FileText,
  FolderSearch2,
  History,
  Library,
  Link2,
  MessageSquareText,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Unplug,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Stage = "brief" | "sources" | "review" | "approved";
type ConnectionStep = "choice" | "learn" | "setup" | "connected";

const tasks = [
  { id: "research", label: "Prepare a research brief", icon: FileSearch },
  { id: "vendors", label: "Compare potential vendors", icon: BriefcaseBusiness },
  { id: "decision", label: "Prepare a decision memo", icon: FileText },
  { id: "changes", label: "Find what changed", icon: History },
];

const sourceOptions = [
  {
    id: "market",
    name: "2026 Market Landscape",
    detail: "Uploaded report · Updated Jul 24",
    quality: "strong",
  },
  {
    id: "notes",
    name: "Customer interview notes",
    detail: "Shared drive · 18 documents",
    quality: "strong",
  },
  {
    id: "web",
    name: "Public company sources",
    detail: "Web research · Current quarter",
    quality: "limited",
  },
];

type ReviewItem = {
  id: string;
  title: string;
  detail: string;
  acknowledged: boolean;
};

type RunRevision = {
  id: string;
  version: number;
  executive: string;
  findings: string;
  flaggedClaim: string;
  recommendation: string;
  reviewItems: ReviewItem[];
};

type ResearchRun = {
  id: string;
  status: string;
  question: string;
  audience: string;
  priority: string;
  revisions: RunRevision[];
  approvals: Array<{ id: string; approver: { name: string } }>;
};

const stageIndex: Record<Stage, number> = {
  brief: 0,
  sources: 1,
  review: 2,
  approved: 3,
};

export function EnablementWorkspace() {
  const [stage, setStage] = useState<Stage>("brief");
  const [selectedTask, setSelectedTask] = useState("research");
  const [question, setQuestion] = useState(
    "Where are mid-market operations teams increasing AI investment, and which unmet needs are most consistent across buyers?",
  );
  const [audience, setAudience] = useState("Leadership team");
  const [priority, setPriority] = useState("Identify the strongest unmet need");
  const [selectedSources, setSelectedSources] = useState<string[]>(["market", "notes", "web"]);
  const [run, setRun] = useState<ResearchRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [connectionStep, setConnectionStep] = useState<ConnectionStep>("choice");
  const [connected, setConnected] = useState(false);
  const [railOpen, setRailOpen] = useState(false);

  const currentStage = stageIndex[stage];
  const revision = run?.revisions[0];
  const flags = revision?.reviewItems ?? [];
  const reviewedFlags = flags.filter((flag) => flag.acknowledged);
  const allFlagsReviewed = flags.length > 0 && reviewedFlags.length === flags.length;

  const sourceCount = selectedSources.length + (connected ? 1 : 0);
  const stageLabel = useMemo(() => {
    if (stage === "brief") return "Setting direction";
    if (stage === "sources") return "Choosing information";
    if (stage === "review") return "Ready for your review";
    return "Approved";
  }, [stage]);

  function toggleSource(id: string) {
    setSelectedSources((current) =>
      current.includes(id) ? current.filter((source) => source !== id) : [...current, id],
    );
  }

  useEffect(() => {
    void fetch("/api/runs")
      .then((response) => response.json())
      .then(({ runs }) => {
        const latest = runs?.[0] as ResearchRun | undefined;
        if (!latest) return;
        setRun(latest);
        setQuestion(latest.question);
        setAudience(latest.audience);
        setPriority(latest.priority);
        setStage(latest.status === "APPROVED" ? "approved" : "review");
      })
      .catch(() => setError("Past work could not be loaded."));
  }, []);

  async function prepareDraft() {
    setBusy(true);
    setError("");
    try {
      const sources = sourceOptions
        .filter((source) => selectedSources.includes(source.id))
        .map((source) => ({
          sourceKey: source.id,
          name: source.name,
          detail: source.detail,
          quality: source.quality,
          origin: source.id === "web" ? "WEB" : "WORKSPACE",
        }));
      if (connected) {
        sources.push({
          sourceKey: "drive",
          name: "Shared drive: Market research",
          detail: "Read only - 24 approved files",
          quality: "strong",
          origin: "CONNECTOR",
        });
      }
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, audience, priority, sources }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setRun(body.run);
      setStage("review");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The draft could not be prepared.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleFlag(item: ReviewItem) {
    if (!run) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/runs/${run.id}/review-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acknowledged: !item.acknowledged }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setRun(body.run);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The review item could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  async function approveCurrentRun() {
    if (!run) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/runs/${run.id}/approve`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setRun(body.run);
      setStage("approved");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The brief could not be approved.");
    } finally {
      setBusy(false);
    }
  }

  async function requestChange() {
    if (!run) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/runs/${run.id}/revisions`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setRun(body.run);
      setStage("review");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "A revision could not be created.");
    } finally {
      setBusy(false);
    }
  }

  function startNewBrief() {
    setRun(null);
    setStage("brief");
    setError("");
  }

  function openConnection() {
    setConnectionStep(connected ? "connected" : "choice");
    setConnectionOpen(true);
  }

  function closeConnection() {
    setConnectionOpen(false);
  }

  function connectDrive() {
    setConnected(true);
    setConnectionStep("connected");
  }

  function disconnectDrive() {
    setConnected(false);
    setConnectionStep("choice");
  }

  return (
    <div className="workspace-shell">
      <header className="app-header">
        <div className="header-row">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              AI
            </div>
            <div>
              <p className="brand-name">AI Enablement Workspace</p>
              <p className="brand-context">Connected work · Human approved</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-button" type="button" aria-label="Search">
              <Search size={17} />
            </button>
            <button className="icon-button" type="button" aria-label="Workspace settings">
              <Settings size={17} />
            </button>
            <button className="user-button" type="button" aria-label="Open user menu">
              LJ
            </button>
          </div>
        </div>
        <nav className="top-nav" aria-label="Primary navigation">
          <button className="nav-button active" type="button">
            Workspace
          </button>
          <button className="nav-button" type="button">
            Past work
          </button>
          <Link className="nav-button" href="/library">
            Shared tools
          </Link>
          <button className="nav-button" type="button">
            Sources
          </button>
        </nav>
      </header>

      <div className="workspace-grid">
        <aside className={`left-rail ${railOpen ? "" : "collapsed"}`}>
          <button
            className="mobile-rail-toggle"
            type="button"
            onClick={() => setRailOpen((open) => !open)}
          >
            <span>Choose the work</span>
            {railOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <div className="rail-content">
            <section className="rail-section">
              <p className="eyebrow">Your role</p>
              <select className="role-select" defaultValue="operations" aria-label="Your role">
                <option value="operations">Operations lead</option>
                <option value="manager">People manager</option>
                <option value="analyst">Business analyst</option>
              </select>
            </section>
            <section className="rail-section">
              <p className="eyebrow">What are you doing?</p>
              <div className="task-list">
                {tasks.map((task) => {
                  const Icon = task.icon;
                  return (
                    <button
                      className={`task-button ${selectedTask === task.id ? "active" : ""}`}
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTask(task.id)}
                    >
                      <Icon size={17} />
                      <span>{task.label}</span>
                    </button>
                  );
                })}
                <a className="task-button" href="/context">
                  <MessageSquareText size={17} />
                  <span>Understand how something actually works</span>
                </a>
              </div>
            </section>
            <section className="rail-section">
              <p className="eyebrow">Connected information</p>
              <button className="secondary-button" type="button" onClick={openConnection}>
                {connected ? <CheckCircle2 size={16} /> : <Link2 size={16} />}
                {connected ? "Shared drive connected" : "Bring in information"}
              </button>
              <p className="rail-callout">
                This workspace can read approved information. It cannot post, edit, or delete
                anything.
              </p>
            </section>
          </div>
        </aside>

        <main className="main-workspace">
          <header className="main-header">
            <div>
              <p className="eyebrow">Research brief</p>
              <h1>Understand the market before deciding what to build.</h1>
              <p>
                Tell the workspace what decision this research needs to support. It will gather,
                compare, and organize the evidence for you to review.
              </p>
            </div>
            <span className="status-chip">{stageLabel}</span>
          </header>

          <div className="progress-strip" aria-label="Work progress">
            {[
              ["1", "Set direction"],
              ["2", "Choose information"],
              ["3", "Review the draft"],
              ["4", "Approve"],
            ].map(([number, label], index) => (
              <button
                className={`progress-step ${
                  index === currentStage ? "active" : index < currentStage ? "complete" : ""
                }`}
                key={number}
                type="button"
                onClick={() => {
                  if (index <= currentStage) {
                    setStage((["brief", "sources", "review", "approved"] as Stage[])[index]);
                  }
                }}
              >
                <span className="mono">{number}</span>
                <strong>{label}</strong>
              </button>
            ))}
          </div>
          {error ? (
            <p className="claim-flag" role="alert">
              {error}
            </p>
          ) : null}

          {stage === "brief" ? (
            <section className="work-surface">
              <div className="section-heading">
                <div>
                  <h2>What do you need to understand?</h2>
                  <p>Start with the decision, not the search terms.</p>
                </div>
              </div>
              <div className="form-grid">
                <div>
                  <div className="field">
                    <label htmlFor="research-question">The question this work should answer</label>
                    <textarea
                      className="text-area"
                      id="research-question"
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                    />
                    <small>
                      Write it the way you would explain it to a capable new teammate.
                    </small>
                  </div>
                  <div className="field">
                    <label htmlFor="audience">Who will use the answer?</label>
                    <input
                      className="text-input"
                      id="audience"
                      value={audience}
                      onChange={(event) => setAudience(event.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <p className="field-label">If we could answer only one thing first</p>
                  <div className="choice-grid">
                    {[
                      "Identify the strongest unmet need",
                      "Compare the leading competitors",
                      "Estimate the size of the opportunity",
                    ].map((choice) => (
                      <button
                        className={`choice-button ${priority === choice ? "selected" : ""}`}
                        key={choice}
                        type="button"
                        onClick={() => setPriority(choice)}
                      >
                        <span>{choice}</span>
                        {priority === choice ? <Check size={16} /> : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="action-row">
                <button className="primary-button" type="button" onClick={() => setStage("sources")}>
                  Choose information
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          ) : null}

          {stage === "sources" ? (
            <section className="work-surface">
              <div className="section-heading">
                <div>
                  <h2>Choose what the workspace may use.</h2>
                  <p>Only selected information will be used to prepare this brief.</p>
                </div>
                <button className="secondary-button" type="button" onClick={openConnection}>
                  <Link2 size={16} />
                  Bring in information
                </button>
              </div>
              <div>
                {sourceOptions.map((source) => (
                  <label className="source-row" key={source.id}>
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.id)}
                      onChange={() => toggleSource(source.id)}
                    />
                    <div>
                      <p className="source-name">{source.name}</p>
                      <p className="source-meta">{source.detail}</p>
                    </div>
                    <span className={`quality-badge ${source.quality}`}>
                      {source.quality === "strong" ? "Well supported" : "Check closely"}
                    </span>
                  </label>
                ))}
                {connected ? (
                  <div className="source-row">
                    <span className="source-icon">
                      <FolderSearch2 size={16} />
                    </span>
                    <div>
                      <p className="source-name">Shared drive: Market research</p>
                      <p className="source-meta">Read only · 24 approved files</p>
                    </div>
                    <span className="quality-badge strong">Connected</span>
                  </div>
                ) : null}
              </div>
              <div className="action-row">
                <button className="secondary-button" type="button" onClick={() => setStage("brief")}>
                  Back
                </button>
                <button
                  className="primary-button"
                  type="button"
                  disabled={sourceCount === 0 || busy}
                  onClick={prepareDraft}
                >
                  <Sparkles size={16} />
                  {busy ? "Preparing..." : "Prepare the draft"}
                </button>
              </div>
            </section>
          ) : null}

          {stage === "review" ? (
            <>
              <section className="work-surface">
                <div className="section-heading">
                  <div>
                    <h2>Your draft is ready for review.</h2>
                    <p>The workspace improved its first pass and marked what needs your judgment.</p>
                  </div>
                  <button className="secondary-button" type="button">
                    <MoreHorizontal size={17} />
                    More
                  </button>
                </div>
                <article className="draft">
                  <p className="eyebrow">
                    Market opportunity brief · Draft {revision?.version ?? 2}
                  </p>
                  <h3>Executive finding</h3>
                  <p>{revision?.executive}</p>
                  <h3>What appears consistent</h3>
                  <p>{revision?.findings}</p>
                  <p className="claim-flag">{revision?.flaggedClaim}</p>
                  <h3>Recommendation</h3>
                  <p>{revision?.recommendation}</p>
                </article>
              </section>
              <section className="work-surface">
                <div className="section-heading">
                  <div>
                    <h2>What needs your attention</h2>
                    <p>Confirm each item before this work can be approved.</p>
                  </div>
                  <span className="status-chip">
                    {reviewedFlags.length}/{flags.length} checked
                  </span>
                </div>
                <div className="flag-list">
                  {flags.map((flag) => (
                    <label className="flag-item" key={flag.id}>
                      <input
                        type="checkbox"
                        checked={flag.acknowledged}
                        disabled={busy}
                        onChange={() => toggleFlag(flag)}
                      />
                      <span>
                        <strong>{flag.title}</strong>
                        <p>{flag.detail}</p>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="action-row">
                  <button className="secondary-button" type="button" onClick={() => setStage("sources")}>
                    Change information
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={busy}
                    onClick={requestChange}
                  >
                    <MessageSquareText size={16} />
                    Request a change
                  </button>
                  <button
                    className="primary-button"
                    type="button"
                    disabled={!allFlagsReviewed || busy}
                    onClick={approveCurrentRun}
                  >
                    <ShieldCheck size={16} />
                    Approve this brief
                  </button>
                </div>
              </section>
            </>
          ) : null}

          {stage === "approved" ? (
            <section className="work-surface">
              <div className="approval-banner">
                <h2>Approved by {run?.approvals[0]?.approver.name ?? "Laura Jenkins"}</h2>
                <p>
                  This version is locked with its sources, checks, and approval record. Any material
                  edit will create a new draft for review.
                </p>
              </div>
              <article className="draft">
                <p className="eyebrow">
                  Approved research brief · Version {revision?.version ?? 1}
                </p>
                <h3>Decision-ready summary</h3>
                <p>{revision?.executive}</p>
                <h3>Recommendation</h3>
                <p>{revision?.recommendation}</p>
              </article>
              <div className="action-row">
                <button className="secondary-button" type="button" onClick={() => setStage("review")}>
                  View review record
                </button>
                <button className="primary-button" type="button" onClick={startNewBrief}>
                  <FileText size={16} />
                  Start new brief
                </button>
              </div>
            </section>
          ) : null}
        </main>

        <aside className="right-rail">
          <section className="rail-section">
            <p className="eyebrow">Current work</p>
            <h3>Mid-market AI opportunity</h3>
            <div className="metric-list">
              <div className="metric">
                <span>Information selected</span>
                <strong>{sourceCount}</strong>
              </div>
              <div className="metric">
                <span>Items to check</span>
                <strong>{Math.max(0, flags.length - reviewedFlags.length)}</strong>
              </div>
              <div className="metric">
                <span>Access level</span>
                <strong>Read only</strong>
              </div>
            </div>
          </section>
          <section className="rail-section">
            <p className="eyebrow">What has happened</p>
            <div className="activity-list">
              <div className={`activity ${stage === "brief" ? "current" : ""}`}>
                <p>Direction set</p>
                <time>Current session</time>
              </div>
              <div className={`activity ${stage === "sources" ? "current" : ""}`}>
                <p>{sourceCount} information sources selected</p>
                <time>{currentStage >= 1 ? "Current session" : "Waiting"}</time>
              </div>
              <div className={`activity ${stage === "review" ? "current" : ""}`}>
                <p>Draft prepared and improved</p>
                <time>{currentStage >= 2 ? "Current session" : "Waiting"}</time>
              </div>
              <div className={`activity ${stage === "approved" ? "current" : ""}`}>
                <p>Human approval recorded</p>
                <time>{stage === "approved" ? "Current session" : "Waiting"}</time>
              </div>
            </div>
          </section>
          <section className="rail-section">
            <p className="eyebrow">Why this is controlled</p>
            <p className="rail-callout">
              The workspace can prepare and improve the work. A person still owns the decision
              and explicitly approves the result.
            </p>
          </section>
        </aside>
      </div>

      {connectionOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="connection-title">
            <header className="modal-header">
              <div>
                <p className="eyebrow">Bring in information</p>
                <h2 id="connection-title">
                  {connectionStep === "learn"
                    ? "See how this works"
                    : connectionStep === "connected"
                      ? "Your shared drive is connected"
                      : "Use information from your shared drive"}
                </h2>
                <p>
                  {connectionStep === "choice"
                    ? "Choose whether you want a quick explanation or prefer to go straight to setup."
                    : connectionStep === "learn"
                      ? "The workspace can use approved information without changing the original files."
                      : connectionStep === "setup"
                        ? "Review exactly what this workspace will be allowed to access."
                        : "The workspace can now read approved market research files."}
                </p>
              </div>
              <button className="secondary-button" type="button" onClick={closeConnection} aria-label="Close">
                <X size={17} />
              </button>
            </header>

            <div className="modal-body">
              {connectionStep === "choice" ? (
                <div className="choice-grid">
                  <button className="choice-button" type="button" onClick={() => setConnectionStep("learn")}>
                    <span>
                      <strong>See how this works</strong>
                      <span className="source-meta">A quick, plain-language explanation</span>
                    </span>
                    <CircleHelp size={18} />
                  </button>
                  <button className="choice-button" type="button" onClick={() => setConnectionStep("setup")}>
                    <span>
                      <strong>Skip to setup</strong>
                      <span className="source-meta">Review access and connect the tool</span>
                    </span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              ) : null}

              {connectionStep === "learn" ? (
                <>
                  <div className="explain-grid">
                    <div className="explain-item">
                      <Link2 size={20} />
                      <h3>A permissioned link</h3>
                      <p>
                        It connects this workspace to a tool where your information already lives.
                        This kind of link is called a connector.
                      </p>
                    </div>
                    <div className="explain-item">
                      <Library size={20} />
                      <h3>Less repeated setup</h3>
                      <p>
                        Approved frameworks can find current information without asking you to
                        upload the same files every time.
                      </p>
                    </div>
                    <div className="explain-item">
                      <ShieldCheck size={20} />
                      <h3>Read only at this level</h3>
                      <p>
                        It can retrieve approved files. It cannot post, edit, delete, send, or move
                        anything.
                      </p>
                    </div>
                    <div className="explain-item">
                      <Unplug size={20} />
                      <h3>You can remove access</h3>
                      <p>
                        Disconnect the tool at any time. Past work keeps its source record without
                        retaining new access.
                      </p>
                    </div>
                  </div>
                  <div className="action-row">
                    <button className="primary-button" type="button" onClick={() => setConnectionStep("setup")}>
                      Review access
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              ) : null}

              {connectionStep === "setup" ? (
                <>
                  <div className="permission-box">
                    <p className="permission-title">
                      <CheckCircle2 size={17} color="var(--teal)" />
                      This workspace will be able to
                    </p>
                    <ul>
                      <li>View files in the approved Market research folder</li>
                      <li>Read file names, text, update dates, and source links</li>
                      <li>Use selected files in research briefs you start</li>
                    </ul>
                  </div>
                  <div className="permission-box">
                    <p className="permission-title">
                      <X size={17} color="var(--red)" />
                      This workspace will not be able to
                    </p>
                    <ul>
                      <li>Edit, delete, move, or share any file</li>
                      <li>See folders outside Market research</li>
                      <li>Run without you starting the work</li>
                    </ul>
                  </div>
                </>
              ) : null}

              {connectionStep === "connected" ? (
                <>
                  <div className="permission-box">
                    <p className="permission-title">
                      <CheckCircle2 size={17} color="var(--teal)" />
                      Access verified
                    </p>
                    <ul>
                      <li>24 approved files are available</li>
                      <li>Access is limited to the Market research folder</li>
                      <li>No write or action permission is active</li>
                    </ul>
                  </div>
                  <div className="action-row">
                    <button className="danger-button" type="button" onClick={disconnectDrive}>
                      <Unplug size={16} />
                      Disconnect
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            <footer className="modal-actions">
              {connectionStep === "setup" ? (
                <>
                  <button className="secondary-button" type="button" onClick={() => setConnectionStep("choice")}>
                    Back
                  </button>
                  <button className="primary-button" type="button" onClick={connectDrive}>
                    <Database size={16} />
                    Allow read-only access
                  </button>
                </>
              ) : (
                <button className="secondary-button" type="button" onClick={closeConnection}>
                  {connectionStep === "connected" ? "Done" : "Close"}
                </button>
              )}
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}
