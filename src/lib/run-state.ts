export const RUN_STATUS = {
  DRAFT: "DRAFT",
  GATHERING: "GATHERING",
  GENERATING: "GENERATING",
  READY_FOR_REVIEW: "READY_FOR_REVIEW",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
  APPROVED: "APPROVED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export type RunStatus = (typeof RUN_STATUS)[keyof typeof RUN_STATUS];

const transitions: Record<RunStatus, readonly RunStatus[]> = {
  DRAFT: [RUN_STATUS.GATHERING, RUN_STATUS.CANCELLED],
  GATHERING: [RUN_STATUS.GENERATING, RUN_STATUS.FAILED, RUN_STATUS.CANCELLED],
  GENERATING: [RUN_STATUS.READY_FOR_REVIEW, RUN_STATUS.FAILED, RUN_STATUS.CANCELLED],
  READY_FOR_REVIEW: [
    RUN_STATUS.CHANGES_REQUESTED,
    RUN_STATUS.APPROVED,
    RUN_STATUS.CANCELLED,
  ],
  CHANGES_REQUESTED: [RUN_STATUS.GENERATING, RUN_STATUS.CANCELLED],
  APPROVED: [RUN_STATUS.CHANGES_REQUESTED],
  FAILED: [RUN_STATUS.GATHERING, RUN_STATUS.CANCELLED],
  CANCELLED: [],
};

export function canTransition(from: RunStatus, to: RunStatus) {
  return transitions[from].includes(to);
}

export function assertTransition(from: string, to: RunStatus) {
  if (!isRunStatus(from) || !canTransition(from, to)) {
    throw new Error(`Invalid run transition: ${from} -> ${to}`);
  }
}

export function isRunStatus(value: string): value is RunStatus {
  return Object.values(RUN_STATUS).includes(value as RunStatus);
}
