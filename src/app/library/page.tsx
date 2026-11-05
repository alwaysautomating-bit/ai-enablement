import { loadCatalog } from "@/lib/context/pork";
import Link from "next/link";

export const metadata = {
  title: "Enablement library · AI Enablement Workspace",
  description: "A reviewable, hash-pinned snapshot of portable PORK assets.",
};

const categoryCopy: Record<string, { label: string; description: string }> = {
  skills: { label: "Skills", description: "Reusable instructions for recognizable jobs." },
  agents: { label: "Agents", description: "Bounded roles, responsibilities, permissions, and stop conditions." },
  workflows: { label: "Workflows", description: "Curricula and ordered learning or operating paths." },
  capabilities: { label: "Capabilities", description: "Governed compositions of skills, knowledge, tools, and evaluations." },
  tools: { label: "Tool contracts", description: "Callable interfaces and runtime guarantees." },
  knowledge: { label: "Knowledge", description: "Portable doctrine and durable concepts." },
  evaluations: { label: "Evaluations", description: "Rubrics and tests used to assess behavior safely." },
  references: { label: "Schemas & templates", description: "Consulted structures that support execution without becoming doctrine." },
};

export default function LibraryPage() {
  const catalog = loadCatalog();
  const categories = Object.keys(categoryCopy).filter((category) => catalog.counts[category] !== undefined);

  return (
    <div className="library-shell">
      <header className="library-header">
        <Link className="library-back" href="/">← Workspace</Link>
        <div>
          <p className="eyebrow">Shared tools</p>
          <h1>AI enablement library</h1>
          <p>Portable operating knowledge synchronized from PORK for review and controlled use.</p>
        </div>
        <div className={`library-source-state ${catalog.source.committed ? "committed" : "sandbox"}`}>
          <strong>{catalog.source.committed ? "Pinned source" : "Review / sandbox only"}</strong>
          <span className="mono">{catalog.source.commit.slice(0, 12)}</span>
        </div>
      </header>

      <main className="library-main">
        <section className="library-summary">
          <div>
            <span className="library-total">{catalog.assets.length}</span>
            <span>portable assets</span>
          </div>
          <p>
            Every item retains its canonical path and content hash. Items are marked <strong>{catalog.approvalState}</strong> for this snapshot.
            Snapshot approval does not grant live-source or execution authority.
          </p>
          <Link href="/library/approval" className="secondary-button">Review approval list</Link>
        </section>

        <div className="library-categories">
          {categories.map((category) => {
            const copy = categoryCopy[category];
            const assets = catalog.assets.filter((asset) => asset.category === category);
            return (
              <details className="library-category" key={category} open={category === "skills" || category === "agents"}>
                <summary>
                  <div>
                    <h2>{copy.label}</h2>
                    <p>{copy.description}</p>
                  </div>
                  <span>{assets.length}</span>
                </summary>
                <div className="library-grid">
                  {assets.map((asset) => (
                    <article className="library-card" key={`${asset.category}:${asset.id}`}>
                      <div className="library-card-top">
                        <span className="library-badge">{asset.approvalState}</span>
                        <span>{asset.status}</span>
                      </div>
                      <h3>{asset.title}</h3>
                      <p>{asset.description || "Canonical PORK asset."}</p>
                      <code>{asset.path}</code>
                    </article>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </main>
    </div>
  );
}
