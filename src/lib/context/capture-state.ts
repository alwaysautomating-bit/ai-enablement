export const CAPTURE_STATUS = {
  DRAFT: "DRAFT",
  COLLECTING: "COLLECTING",
  EXTRACTING: "EXTRACTING",
  RESOLVING: "RESOLVING",
  READY_FOR_REVIEW: "READY_FOR_REVIEW",
  CLOSED: "CLOSED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export type CaptureStatus = (typeof CAPTURE_STATUS)[keyof typeof CAPTURE_STATUS];

const transitions: Record<CaptureStatus, readonly CaptureStatus[]> = {
  DRAFT: ["COLLECTING", "CANCELLED"],
  COLLECTING: ["EXTRACTING", "FAILED", "CANCELLED"],
  EXTRACTING: ["RESOLVING", "FAILED", "CANCELLED"],
  RESOLVING: ["READY_FOR_REVIEW", "FAILED"],
  READY_FOR_REVIEW: ["CLOSED"],
  CLOSED: [],
  FAILED: ["COLLECTING", "CANCELLED"],
  CANCELLED: [],
};

export function canTransitionCapture(from: CaptureStatus, to: CaptureStatus) {
  return transitions[from]?.includes(to) ?? false;
}

export function assertCaptureTransition(from: string, to: CaptureStatus) {
  if (!(from in transitions) || !canTransitionCapture(from as CaptureStatus, to)) {
    throw new Error(`Invalid capture transition: ${from} -> ${to}`);
  }
}
