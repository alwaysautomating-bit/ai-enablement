import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadLock, repoRoot } from "./pork";

// Client for SAME semantic stabilization (contract same.stabilization/v1). SAME
// canonicalizes what extracted assertions appear to mean; it never decides truth. This
// module is a thin transport: all stabilization logic lives in SAME. If SAME is
// unavailable, callers fail closed and store nothing.

export const STABILIZATION_CONTRACT = "same.stabilization/v1";

export type Target = { kind: "known"; id: string } | { kind: "extracted"; ref: string } | { kind: "derived"; ref: string };

export type StabilizationRequest = {
  contract: typeof STABILIZATION_CONTRACT;
  request_id: string;
  known_entities: Array<{ id: string; type: string; names: string[]; identity_keys: string[] }>;
  known_relationships: Array<{
    id: string;
    subject: string;
    predicate: string;
    object: string;
    valid_from: string | null;
    valid_to: string | null;
    holder_cardinality: string | null;
  }>;
  extracted: {
    entities: Array<{
      ref: string;
      name: string;
      type: string;
      aliases: string[];
      identity_key: string | null;
      distinct_from: string[];
    }>;
    assertions: Array<{
      ref: string;
      kind: string;
      statement: string;
      subject_ref: string | null;
      predicate: string | null;
      object_ref: string | null;
      holder_cardinality: string | null;
      operational_status: string;
      modality: string;
      confidence: number;
      effective_from: string | null;
      effective_to: string | null;
      time_basis: string;
      time_expression: string | null;
      communicated: { first: string; last: string };
    }>;
  };
};

export type EntityDecision = {
  ref: string;
  resolution: "MATCHED" | "MERGED" | "NEW_CANDIDATE" | "COLLAPSED" | "AMBIGUOUS";
  type: string;
  name: string;
  target: Target | null;
  reason: string;
  relation_hint: string | null;
  candidates: Target[];
  distinct_from: Target[];
  confidence: number;
  flags: string[];
};

export type StabilizedAssertion = {
  ref: string;
  kind: string;
  non_assertive: boolean;
  canonical: {
    subject: Target | null;
    relation: string | null;
    predicate_key: string | null;
    predicate_label: string | null;
    qualifier: string | null;
    object: Target | null;
    direction: string | null;
    holder_cardinality: string | null;
    interval: { from: string | null; to: string | null; basis: string; expression: string | null };
  };
  original: Record<string, unknown>;
  transforms: Array<Record<string, unknown>>;
  flags: string[];
  notes: string[];
  comparisons: Array<{ against: Record<string, string> | null; outcome: string; detail: string }>;
  uncertainty: "LOW" | "MEDIUM" | "HIGH";
};

export type StabilizationResponse = {
  contract: string;
  same_version: string;
  registry_version: number;
  request_id: string | null;
  entities: EntityDecision[];
  derived_entities: Array<{ ref: string; name: string; type: string; derived_from: string; distinct_from: Target[] }>;
  assertions: StabilizedAssertion[];
  diagnostics: { entity_resolutions: Record<string, number>; flags: Record<string, number> };
};

export interface Stabilizer {
  readonly id: string;
  stabilize(request: StabilizationRequest): Promise<StabilizationResponse>;
}

export class StabilizationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StabilizationUnavailableError";
  }
}

export function sameRoot() {
  return resolve(repoRoot(), process.env.SAME_ROOT ?? loadLock().same.root);
}

/** SAME_PYTHON if set, then the SAME repository's own virtualenv, then whatever is on PATH. */
export function samePython(root: string) {
  if (process.env.SAME_PYTHON) return process.env.SAME_PYTHON;
  const venv = resolve(root, ".venv", ...(process.platform === "win32" ? ["Scripts", "python.exe"] : ["bin", "python"]));
  return existsSync(venv) ? venv : "python";
}

/** Runs `python cli.py stabilize` in the SAME repository (local-process adapter). */
export class SameProcessStabilizer implements Stabilizer {
  readonly id = "same:local-process";

  constructor(
    private readonly root = sameRoot(),
    private readonly python = samePython(root),
    private readonly timeoutMs = 60_000,
  ) {}

  stabilize(request: StabilizationRequest): Promise<StabilizationResponse> {
    return new Promise((resolvePromise, reject) => {
      const child = spawn(this.python, ["cli.py", "stabilize"], { cwd: this.root, windowsHide: true });
      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];
      const timer = setTimeout(() => {
        child.kill();
        reject(new StabilizationUnavailableError("Semantic stabilization timed out."));
      }, this.timeoutMs);
      child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
      child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
      child.on("error", () => {
        clearTimeout(timer);
        reject(new StabilizationUnavailableError("Semantic stabilization could not be started."));
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          const detail = Buffer.concat(stderr).toString("utf8").slice(0, 300);
          reject(new StabilizationUnavailableError(`Semantic stabilization failed (exit ${code}). ${detail}`));
          return;
        }
        try {
          const response = JSON.parse(Buffer.concat(stdout).toString("utf8")) as StabilizationResponse;
          if (response.contract !== STABILIZATION_CONTRACT || !Array.isArray(response.assertions)) {
            throw new Error("unexpected contract");
          }
          resolvePromise(response);
        } catch {
          reject(new StabilizationUnavailableError("Semantic stabilization returned an unexpected response."));
        }
      });
      child.stdin.end(Buffer.from(JSON.stringify(request), "utf8"));
    });
  }
}

export function defaultStabilizer(): Stabilizer {
  return new SameProcessStabilizer();
}
