import { capabilityVersion, loadCapability, loadLock, type ApprovalRecord, type PermissionClass } from "./pork";

// Permission-class gate (PORK doctrine/governance/permission-classes.md).
// An approval is scoped to capability + version (commit + content hash) + permission class.
// Passing one class authorizes nothing else. Fixture-only school runs need no approval;
// the gate applies the moment a live source is involved, and it fails closed.

export const CONTEXT_CAPTURE_REQUIRED_CLASSES = [
  "retrieve_authorized_evidence",
  "reconstruct_conversations",
  "extract_candidate_assertions",
  "run_semantic_stabilization",
  "persist_candidates",
] as const;

export class PermissionGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionGateError";
  }
}

export type ClassState = "granted" | "not_approved" | "human_only" | "not_requested";

export type GateInput = {
  capability: string;
  title: string;
  version: { commit: string; contentSha256: string; committed: boolean };
  governance: { requested?: string[]; human_only?: string[] };
  classes: PermissionClass[];
  approvals: ApprovalRecord[];
};

/** Approvals that apply to exactly this capability version for live use (revocations honoured). */
export function applicableApprovals(input: GateInput): ApprovalRecord[] {
  const revoked = new Set(input.approvals.filter((a) => a.type === "capability-approval-revocation").map((a) => a.revokes));
  return input.approvals.filter(
    (a) =>
      a.type === "capability-approval" &&
      a.status === "active" &&
      !revoked.has(a.id) &&
      a.capability === `skill-pack.${input.capability}` &&
      a.version.commit === input.version.commit &&
      a.version.content_sha256 === input.version.contentSha256 &&
      a.scope?.sources !== "fixture_only",
  );
}

/** Pure: the capability record shown to people and used by the gate. */
export function capabilityRecordFrom(input: GateInput) {
  const requested = new Set(input.governance.requested ?? []);
  const humanOnly = new Set(input.governance.human_only ?? []);
  // Uncommitted content can never be approved for live use.
  const approvals = input.version.committed ? applicableApprovals(input) : [];
  const granted = new Set(approvals.flatMap((a) => a.granted).filter((id) => requested.has(id) && !humanOnly.has(id)));
  const classes = input.classes.map((cls) => {
    let state: ClassState;
    if (humanOnly.has(cls.id) || cls.holder === "human_only") state = "human_only";
    else if (!requested.has(cls.id)) state = "not_requested";
    else if (granted.has(cls.id)) state = "granted";
    else state = "not_approved";
    return { id: cls.id, effect: cls.effect, state };
  });
  return {
    capability: `skill-pack.${input.capability}`,
    title: input.title,
    version: input.version,
    approvals: approvals.map((a) => ({
      id: a.id,
      reviewer: a.reviewer.display_name || a.reviewer.id,
      verification: a.reviewer.verification,
      recordedAt: a.recorded_at,
      granted: a.granted,
    })),
    classes,
  };
}

/** Pure: throws unless every required class is granted for this exact, committed version. */
export function assertGate(input: GateInput, required: readonly string[]) {
  const record = capabilityRecordFrom(input);
  const label = `${record.title} ${record.version.commit.slice(0, 7)}/${record.version.contentSha256.slice(0, 12)}`;
  if (!record.version.committed) {
    throw new PermissionGateError(`${label} is uncommitted in PORK, so it can only run on sample data.`);
  }
  const missing = required.filter((id) => record.classes.find((c) => c.id === id)?.state !== "granted");
  if (missing.length) {
    throw new PermissionGateError(`${label} is not approved for live sources. Missing: ${missing.join(", ")}.`);
  }
}

function gateInputFor(capability: string): GateInput {
  const pinned = loadCapability(capability);
  const lock = loadLock();
  return {
    capability,
    title: String(pinned.capability.title ?? capability),
    version: capabilityVersion(capability),
    governance: pinned.capability.governance?.permission_classes ?? {},
    classes: lock.permissionClasses.classes,
    approvals: lock.approvals,
  };
}

export function capabilityRecord(capability: string) {
  const record = capabilityRecordFrom(gateInputFor(capability));
  return {
    ...record,
    liveUseAllowed:
      record.version.committed &&
      CONTEXT_CAPTURE_REQUIRED_CLASSES.every((id) => record.classes.find((c) => c.id === id)?.state === "granted"),
  };
}

export function assertLiveUseAllowed(capability: string, required: readonly string[]) {
  assertGate(gateInputFor(capability), required);
}
