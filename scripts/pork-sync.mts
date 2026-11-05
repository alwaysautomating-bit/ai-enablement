// Pin PORK capabilities (and the SAME fixtures they reference) into this workspace.
//   npm run pork:sync
// Writes vendor/pork/<capability>.json (generated; never edit) and pork.lock.json with the
// PORK revision, capability content hash, clean-state flag, permission-class schema,
// approval records, SAME version, and SAME fixture hashes.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

type CatalogCategory = "skills" | "agents" | "workflows" | "capabilities" | "tools" | "knowledge" | "evaluations" | "references";
type Config = {
  porkRoot: string;
  sameRoot: string;
  capabilities: string[];
  sameFixtures: string;
  catalog?: { include?: CatalogCategory[]; approvalState?: "suggested" | "approved" };
};
type CatalogAsset = {
  id: string;
  category: CatalogCategory;
  title: string;
  description: string;
  status: string;
  path: string;
  contentSha256: string;
  content: string;
  approvalState: "suggested" | "approved";
};

const repo = process.cwd();
const config = JSON.parse(readFileSync(join(repo, "pork.config.json"), "utf8")) as Config;
const porkRoot = resolve(repo, config.porkRoot);
const sameRoot = resolve(repo, config.sameRoot);

function command(executable: string, cwd: string, args: string[]) {
  return execFileSync(executable, args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function python(cwd: string, args: string[]) {
  if (process.env.PORK_PYTHON) return command(process.env.PORK_PYTHON, cwd, args);
  return command("uv", cwd, ["run", "--with", "pyyaml>=6.0", "python", ...args]);
}

function git(cwd: string, args: string[]) {
  return command(process.env.GIT_EXECUTABLE ?? "git", cwd, args).trim();
}

function yamlToJson(cwd: string, paths: string[]) {
  const script =
    "import json,sys,yaml,glob\n" +
    "out={}\n" +
    "for pattern in sys.argv[1:]:\n" +
    "  for p in sorted(glob.glob(pattern)):\n" +
    "    out[p.replace('\\\\','/')]=yaml.safe_load(open(p,encoding='utf-8'))\n" +
    "print(json.dumps(out))";
  return JSON.parse(python(cwd, ["-c", script, ...paths])) as Record<string, unknown>;
}

const sha256 = (buffer: Buffer | string) => createHash("sha256").update(buffer).digest("hex");
const posix = (path: string) => path.replaceAll("\\", "/");

function listFiles(relativeRoot: string, allowedExtensions: string[], excludedSegments: string[] = []) {
  const output: string[] = [];
  const visit = (relative: string) => {
    for (const name of readdirSync(resolve(porkRoot, relative))) {
      const child = posix(join(relative, name));
      if (excludedSegments.some((segment) => child.split("/").includes(segment))) continue;
      const absolute = resolve(porkRoot, child);
      if (statSync(absolute).isDirectory()) visit(child);
      else if (allowedExtensions.some((extension) => name.endsWith(extension))) output.push(child);
    }
  };
  visit(relativeRoot);
  return output.sort();
}

function registryEntries(file: string, key: string) {
  const parsed = yamlToJson(porkRoot, [file])[file] as Record<string, Array<{ id: string; path: string }>>;
  return parsed[key] ?? [];
}

function markdownField(content: string, field: string) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const match = frontmatter?.[1].match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim().replace(/^['\"]|['\"]$/g, "") ?? "";
}

function markdownTitle(content: string, fallback: string) {
  return markdownField(content, "title") || content.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback;
}

function markdownDescription(content: string) {
  const frontmatterDescription = markdownField(content, "description");
  if (frontmatterDescription) return frontmatterDescription;
  const body = content.replace(/^---[\s\S]*?---\s*/, "").replace(/^#.*$/m, "").trim();
  return body.split(/\r?\n\r?\n/)[0]?.replace(/\s+/g, " ").slice(0, 240) ?? "";
}

mkdirSync(join(repo, "vendor", "pork"), { recursive: true });
const capabilities: Record<string, unknown> = {};
const approvals: unknown[] = [];
const porkCommit = git(porkRoot, ["rev-parse", "HEAD"]);
const porkClean = git(porkRoot, ["status", "--porcelain", "--untracked-files=all"]) === "";

for (const capability of config.capabilities) {
  const assembled = python(porkRoot, ["scripts/pork_librarian.py", capability, "--format", "json"]);
  const parsed = JSON.parse(assembled) as { content_sha256: string };
  const file = `vendor/pork/${capability}.json`;
  writeFileSync(join(repo, file), assembled);
  capabilities[capability] = {
    file,
    fileSha256: sha256(readFileSync(join(repo, file))),
    commit: porkCommit,
    contentSha256: parsed.content_sha256,
    committed: porkClean,
  };
  const records = yamlToJson(porkRoot, [`evaluations/${capability}/approvals/*.yaml`]);
  for (const [path, record] of Object.entries(records)) approvals.push({ path, ...(record as object) });
}

const included = new Set<CatalogCategory>(config.catalog?.include ?? []);
const approvalState = config.catalog?.approvalState ?? "suggested";
const catalogPaths = new Map<CatalogCategory, Array<{ id: string; path: string }>>();
if (included.has("skills")) catalogPaths.set("skills", registryEntries("registry/skills.yaml", "skills"));
if (included.has("knowledge")) catalogPaths.set("knowledge", registryEntries("registry/knowledge.yaml", "knowledge"));
if (included.has("tools")) catalogPaths.set("tools", registryEntries("registry/tools.yaml", "tools"));
if (included.has("capabilities")) catalogPaths.set("capabilities", registryEntries("registry/capabilities.yaml", "capabilities"));
if (included.has("references")) {
  catalogPaths.set(
    "references",
    registryEntries("registry/references.yaml", "references").filter(({ path }) =>
      path.startsWith("references/schemas/") || path.startsWith("references/templates/"),
    ),
  );
}
if (included.has("agents")) {
  catalogPaths.set(
    "agents",
    listFiles("agents", [".md"]).filter((path) => !path.endsWith("/index.md")).map((path) => ({ id: path.split("/").at(-1)!.replace(/\.md$/, ""), path })),
  );
}
if (included.has("workflows")) {
  catalogPaths.set(
    "workflows",
    listFiles("curricula", [".md"]).filter((path) => !path.endsWith("/README.md")).map((path) => ({ id: path.split("/").at(-1)!.replace(/\.md$/, ""), path })),
  );
}
if (included.has("evaluations")) {
  catalogPaths.set(
    "evaluations",
    listFiles("evaluations", [".yaml", ".yml", ".md"], ["fixtures", "results", "runs", "reviews", "semantic-comparisons"])
      .filter((path) => !path.endsWith("/README.md") && !path.endsWith("/test_runner.py"))
      .map((path) => ({ id: path.replace(/^evaluations\//, "").replace(/\.(yaml|yml|md)$/, "").replaceAll("/", "."), path })),
  );
}

const yamlPaths = [...catalogPaths.values()].flat().map(({ path }) => path).filter((path) => /\.ya?ml$/.test(path));
const parsedYaml = yamlPaths.length ? yamlToJson(porkRoot, yamlPaths) : {};
const assets: CatalogAsset[] = [];
for (const [category, entries] of catalogPaths) {
  for (const entry of entries) {
    const content = readFileSync(resolve(porkRoot, entry.path), "utf8");
    const parsed = (parsedYaml[entry.path] ?? {}) as Record<string, unknown>;
    assets.push({
      id: entry.id,
      category,
      title: String(parsed.title ?? markdownTitle(content, entry.id)),
      description: String(parsed.description ?? markdownDescription(content)),
      status: String(parsed.status ?? markdownField(content, "status") ?? "canonical"),
      path: entry.path,
      contentSha256: sha256(content),
      content,
      approvalState,
    });
  }
}
assets.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
const counts = Object.fromEntries([...included].map((category) => [category, assets.filter((asset) => asset.category === category).length]));
const catalog = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: { system: "PORK", root: config.porkRoot, commit: porkCommit, committed: porkClean },
  approvalState,
  counts,
  assets,
  exclusions: [
    "references/source-material and project examples",
    "evaluation fixtures, runs, results, reviews, and semantic comparisons",
    "generated PORK output, caches, application code, and temporary files",
  ],
};
const catalogFile = "vendor/pork/catalog.json";
writeFileSync(join(repo, catalogFile), JSON.stringify(catalog, null, 2) + "\n");
const catalogLock = {
  file: catalogFile,
  fileSha256: sha256(readFileSync(join(repo, catalogFile))),
  commit: porkCommit,
  committed: porkClean,
  counts,
  approvalState,
};

const permissionClasses = yamlToJson(porkRoot, ["references/schemas/permission-classes.yaml"])[
  "references/schemas/permission-classes.yaml"
];

// SAME: contract version and the fixtures this workspace evaluates against.
const sameVersion = python(sameRoot, ["-c", "from modes.assertion.contract import SAME_VERSION, CONTRACT; print(CONTRACT + ' ' + SAME_VERSION)"]).trim();
const manifestPath = join(sameRoot, config.sameFixtures, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { files: Record<string, string> };
for (const [name, expected] of Object.entries(manifest.files)) {
  const actual = sha256(readFileSync(join(sameRoot, config.sameFixtures, name)));
  if (actual !== expected) throw new Error(`SAME fixture ${name} does not match its manifest hash.`);
}

const lock = {
  $comment: "Generated by npm run pork:sync. Do not edit.",
  generatedAt: new Date().toISOString(),
  pork: { root: config.porkRoot, capabilities, catalog: catalogLock },
  permissionClasses,
  approvals,
  same: { root: config.sameRoot, contract: sameVersion, fixtures: { path: config.sameFixtures, files: manifest.files } },
};
writeFileSync(join(repo, "pork.lock.json"), JSON.stringify(lock, null, 2) + "\n");

const approvalLines = [
  `# PORK One-Time Sync — ${approvalState === "approved" ? "Approved Snapshot" : "Suggested Files to Approve"}`,
  "",
  `Generated: ${catalog.generatedAt}`,
  `PORK revision: \`${porkCommit}\``,
  `Source state: **${porkClean ? "committed" : "uncommitted — review/sandbox only"}**`,
  "",
  "## Workspace implementation files",
  "",
  "- `pork.config.json` — declares the catalog scope and suggested approval state.",
  "- `scripts/pork-sync.mts` — creates the pinned catalog and approval inventory.",
  "- `src/lib/context/pork.ts` — verifies and reads the pinned catalog.",
  "- `src/app/library/page.tsx` — presents the synchronized enablement library.",
  "- `src/app/library/approval/page.tsx` — presents the per-file approval inventory in the build.",
  "- `src/components/enablement-workspace.tsx` — links Shared tools to the library.",
  "- `src/app/globals.css` — styles the library view.",
  "",
  "## Generated snapshot files",
  "",
  "- `vendor/pork/catalog.json` — exact content plus hashes for the selected portable assets.",
  "- `vendor/pork/context-capture.json` — assembled capability already consumed by Context Capture.",
  "- `pork.lock.json` — source revision, hashes, counts, permission classes, and approval records.",
  "- `docs/PORK_SYNC_APPROVAL.md` — this review list.",
  "",
  approvalState === "approved" ? "## Approved PORK source assets" : "## Suggested PORK source assets",
  "",
  ...Object.entries(counts).flatMap(([category, count]) => [
    `### ${category} (${count})`,
    "",
    ...assets.filter((asset) => asset.category === category).map((asset) => `- \`${asset.path}\``),
    "",
  ]),
  "## Intentionally excluded",
  "",
  ...catalog.exclusions.map((exclusion) => `- ${exclusion}`),
  "",
  "Approval of this snapshot does not authorize live-source access, confirmation, visibility widening, messaging, or downstream execution.",
  "",
];
writeFileSync(join(repo, "docs", "PORK_SYNC_APPROVAL.md"), approvalLines.join("\n"));

for (const [name, entry] of Object.entries(capabilities) as Array<[string, { commit: string; contentSha256: string; committed: boolean }]>) {
  console.log(
    `${name}: commit ${entry.commit.slice(0, 7)} · content ${entry.contentSha256.slice(0, 12)} · ${
      entry.committed ? "committed" : "UNCOMMITTED (school sandbox only; cannot be approved for live sources)"
    }`,
  );
}
console.log(`approvals: ${approvals.length} · SAME: ${sameVersion}`);
console.log(`catalog: ${assets.length} assets · ${catalogFile} · ${porkClean ? "committed" : "UNCOMMITTED (review/sandbox only)"}`);
