import { loadCatalog } from "@/lib/context/pork";
import Link from "next/link";

export const metadata = {
  title: "PORK sync approval · AI Enablement Workspace",
  description: "Files suggested for approval in the one-time PORK snapshot.",
};

const implementationFiles = [
  "pork.config.json",
  "scripts/pork-sync.mts",
  "src/lib/context/pork.ts",
  "src/app/library/page.tsx",
  "src/app/library/approval/page.tsx",
  "src/components/enablement-workspace.tsx",
  "src/app/globals.css",
  "vendor/pork/catalog.json",
  "vendor/pork/context-capture.json",
  "pork.lock.json",
  "docs/PORK_SYNC_APPROVAL.md",
];

export default function ApprovalPage() {
  const catalog = loadCatalog();
  const categories = Object.keys(catalog.counts);
  return (
    <div className="library-shell">
      <header className="library-header">
        <Link className="library-back" href="/library">← Enablement library</Link>
        <div>
          <p className="eyebrow">One-time sync</p>
          <h1>{catalog.approvalState === "approved" ? "Approved snapshot files" : "Suggested files to approve"}</h1>
          <p>{catalog.approvalState === "approved" ? "This inventory records the exact implementation and portable PORK assets approved for this snapshot." : "Review the implementation and the exact portable PORK assets included in this snapshot."}</p>
        </div>
        <div className="library-source-state sandbox">
          <strong>{catalog.source.committed ? "Committed source" : "Review / sandbox only"}</strong>
          <span>{catalog.assets.length} assets</span>
        </div>
      </header>
      <main className="library-main approval-list">
        <section className="library-category" aria-labelledby="implementation-heading">
          <div className="approval-heading">
            <h2 id="implementation-heading">Workspace implementation and generated files</h2>
            <span>{implementationFiles.length}</span>
          </div>
          <ul>{implementationFiles.map((path) => <li key={path}><code>{path}</code></li>)}</ul>
        </section>
        {categories.map((category) => {
          const assets = catalog.assets.filter((asset) => asset.category === category);
          return (
            <details className="library-category" key={category}>
              <summary><div><h2>{category}</h2><p>Canonical PORK source files {catalog.approvalState} for this snapshot.</p></div><span>{assets.length}</span></summary>
              <ul>{assets.map((asset) => <li key={asset.path}><code>{asset.path}</code></li>)}</ul>
            </details>
          );
        })}
        <section className="approval-warning">
          <strong>Authority boundary</strong>
          <p>Approving these files does not authorize live-source access, confirmation, visibility widening, messaging, or downstream execution.</p>
        </section>
      </main>
    </div>
  );
}
