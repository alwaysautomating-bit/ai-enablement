import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Pinned PORK capabilities. The workspace reads only the vendored, hash-verified copy written by
// `npm run pork:sync`; it never reads PORK's moving main branch at request time and never
// edits the vendored files.

export type PermissionClass = { id: string; holder: string; effect: string };

export type ApprovalRecord = {
  path: string;
  id: string;
  type: "capability-approval" | "capability-approval-revocation";
  status: "active" | "revoked";
  capability: string;
  version: { commit: string; content_sha256: string };
  scope?: { sources?: "fixture_only" | "live"; runtime?: string };
  granted: string[];
  denied: string[];
  reviewer: { principal_type: string; id: string; display_name?: string; verification: string };
  revokes: string | null;
  recorded_at: string;
};

export type PorkLock = {
  pork: {
    root: string;
    capabilities: Record<string, { file: string; fileSha256: string; commit: string; contentSha256: string; committed: boolean }>;
    catalog: { file: string; fileSha256: string; commit: string; committed: boolean; counts: Record<string, number>; approvalState: string };
  };
  permissionClasses: { classes: PermissionClass[] };
  approvals: ApprovalRecord[];
  same: { root: string; contract: string; fixtures: { path: string; files: Record<string, string> } };
};

export type PorkCatalogAsset = {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  path: string;
  contentSha256: string;
  content: string;
  approvalState: "suggested" | "approved";
};

export type PorkCatalog = {
  schemaVersion: number;
  generatedAt: string;
  source: { system: string; root: string; commit: string; committed: boolean };
  approvalState: "suggested" | "approved";
  counts: Record<string, number>;
  assets: PorkCatalogAsset[];
  exclusions: string[];
};

type CapabilityModule = { id: string; path: string; content: string; kind: string };
export type PinnedCapability = {
  capability: Record<string, unknown> & { id: string; governance?: { permission_classes?: Record<string, string[]> } };
  skills: CapabilityModule[];
  tools: CapabilityModule[];
  knowledge: CapabilityModule[];
  references: CapabilityModule[];
  content_sha256: string;
};

export class PorkPinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PorkPinError";
  }
}

let cachedLock: PorkLock | null = null;
const cachedCapabilities = new Map<string, PinnedCapability>();
let cachedCatalog: PorkCatalog | null = null;

export function repoRoot() {
  return process.cwd();
}

export function loadLock(): PorkLock {
  if (!cachedLock) {
    try {
      cachedLock = JSON.parse(readFileSync(resolve(repoRoot(), "pork.lock.json"), "utf8")) as PorkLock;
    } catch {
      throw new PorkPinError("pork.lock.json is missing. Run npm run pork:sync.");
    }
  }
  return cachedLock;
}

export function loadCapability(name: string): PinnedCapability {
  const cached = cachedCapabilities.get(name);
  if (cached) return cached;
  const entry = loadLock().pork.capabilities[name];
  if (!entry) throw new PorkPinError(`Capability ${name} is not pinned. Add it to pork.config.json and run npm run pork:sync.`);
  const bytes = readFileSync(resolve(repoRoot(), entry.file));
  if (createHash("sha256").update(bytes).digest("hex") !== entry.fileSha256) {
    throw new PorkPinError(`Vendored ${entry.file} does not match pork.lock.json. Re-run npm run pork:sync; never edit vendored files.`);
  }
  const capability = JSON.parse(bytes.toString("utf8")) as PinnedCapability;
  if (capability.content_sha256 !== entry.contentSha256) throw new PorkPinError(`Vendored ${name} content hash does not match the lock.`);
  cachedCapabilities.set(name, capability);
  return capability;
}

export function loadCatalog(): PorkCatalog {
  if (cachedCatalog) return cachedCatalog;
  const entry = loadLock().pork.catalog;
  if (!entry) throw new PorkPinError("PORK catalog is not pinned. Run npm run pork:sync.");
  const bytes = readFileSync(resolve(repoRoot(), entry.file));
  if (createHash("sha256").update(bytes).digest("hex") !== entry.fileSha256) {
    throw new PorkPinError(`Vendored ${entry.file} does not match pork.lock.json. Re-run npm run pork:sync; never edit vendored files.`);
  }
  cachedCatalog = JSON.parse(bytes.toString("utf8")) as PorkCatalog;
  return cachedCatalog;
}

export function capabilityVersion(name: string) {
  const entry = loadLock().pork.capabilities[name];
  return { commit: entry.commit, contentSha256: entry.contentSha256, committed: entry.committed };
}

/** The body of a pinned PORK skill (frontmatter removed). */
export function skillInstructions(capabilityName: string, skillId: string) {
  const skill = loadCapability(capabilityName).skills.find((module) => module.id === skillId);
  if (!skill) throw new PorkPinError(`Skill ${skillId} is not part of pinned capability ${capabilityName}.`);
  const parts = skill.content.split(/^---\s*$/m);
  return (parts.length >= 3 ? parts.slice(2).join("---") : skill.content).trim();
}

/**
 * Repo-relative path to a SAME-owned fixture (SAME is the single owner; this workspace keeps
 * no copy). The file must match the hash pinned in pork.lock.json.
 */
export function sameFixturePath(file: string) {
  const { root, fixtures } = loadLock().same;
  const relative = `${root}/${fixtures.path}/${file}`;
  const expected = fixtures.files[file];
  if (!expected) throw new PorkPinError(`SAME fixture ${file} is not pinned in pork.lock.json.`);
  const actual = createHash("sha256").update(readFileSync(resolve(repoRoot(), relative))).digest("hex");
  if (actual !== expected) throw new PorkPinError(`SAME fixture ${file} changed since it was pinned. Run npm run pork:sync.`);
  return relative;
}

export const CONTEXT_CAPTURE_CAPABILITY = "context-capture";
export const EXTRACTION_SKILL = "extract-candidate-operational-context";

export function contextCaptureExtraction() {
  const version = capabilityVersion(CONTEXT_CAPTURE_CAPABILITY);
  return {
    instructions: skillInstructions(CONTEXT_CAPTURE_CAPABILITY, EXTRACTION_SKILL),
    version: `pork:${CONTEXT_CAPTURE_CAPABILITY}@${version.commit.slice(0, 7)}+${version.contentSha256.slice(0, 12)}${
      version.committed ? "" : "-uncommitted"
    }`,
  };
}
