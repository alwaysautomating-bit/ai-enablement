import "server-only";
import { prisma } from "@/lib/prisma";
import { buildReviewItems, generateFirstDraft, improveDraft } from "@/lib/research-pipeline";
import { assertTransition, RUN_STATUS } from "@/lib/run-state";
import { DEMO_IDS, ensureDemoFoundation } from "@/lib/seed";

export type CreateRunInput = {
  question: string;
  audience: string;
  priority: string;
  sources: Array<{
    sourceKey: string;
    name: string;
    detail: string;
    quality: string;
    origin: string;
  }>;
};

const runInclude = {
  sources: true,
  revisions: {
    orderBy: { version: "desc" as const },
    include: { reviewItems: { orderBy: { createdAt: "asc" as const } } },
  },
  approvals: {
    where: { status: "ACTIVE" },
    orderBy: { approvedAt: "desc" as const },
    include: { approver: { select: { name: true } } },
  },
  auditEvents: { orderBy: { createdAt: "asc" as const } },
} as const;

function auditMetadata(value: Record<string, unknown>) {
  return JSON.stringify(value);
}

export async function createResearchRun(input: CreateRunInput) {
  const frameworkVersion = await ensureDemoFoundation();
  const sourceNames = input.sources.map((source) => source.name);
  const firstDraft = generateFirstDraft({ ...input, sourceNames });
  const improvedDraft = improveDraft({ ...input, sourceNames }, firstDraft);

  const run = await prisma.$transaction(async (tx) => {
    let created = await tx.run.create({
      data: {
        question: input.question,
        audience: input.audience,
        priority: input.priority,
        workspaceId: DEMO_IDS.workspace,
        frameworkVersionId: frameworkVersion.id,
        createdById: DEMO_IDS.user,
        sources: { create: input.sources },
      },
    });

    await tx.auditEvent.create({
      data: {
        eventType: "RUN_CREATED",
        objectType: "RUN",
        objectId: created.id,
        metadata: auditMetadata({ frameworkVersion: frameworkVersion.version }),
        organizationId: DEMO_IDS.organization,
        runId: created.id,
        actorId: DEMO_IDS.user,
      },
    });

    assertTransition(created.status, RUN_STATUS.GATHERING);
    created = await tx.run.update({
      where: { id: created.id },
      data: { status: RUN_STATUS.GATHERING },
    });
    assertTransition(created.status, RUN_STATUS.GENERATING);
    created = await tx.run.update({
      where: { id: created.id },
      data: { status: RUN_STATUS.GENERATING },
    });

    await tx.runRevision.create({
      data: { runId: created.id, version: 1, kind: "FIRST_PASS", ...firstDraft },
    });
    const revision = await tx.runRevision.create({
      data: {
        runId: created.id,
        version: 2,
        kind: "IMPROVED",
        ...improvedDraft,
        reviewItems: { create: buildReviewItems() },
      },
    });

    assertTransition(created.status, RUN_STATUS.READY_FOR_REVIEW);
    await tx.run.update({
      where: { id: created.id },
      data: { status: RUN_STATUS.READY_FOR_REVIEW },
    });
    await tx.auditEvent.createMany({
      data: [
        {
          eventType: "SOURCES_SELECTED",
          objectType: "RUN",
          objectId: created.id,
          metadata: auditMetadata({ sourceCount: input.sources.length }),
          organizationId: DEMO_IDS.organization,
          runId: created.id,
          actorId: DEMO_IDS.user,
        },
        {
          eventType: "REVISION_CREATED",
          objectType: "RUN_REVISION",
          objectId: revision.id,
          metadata: auditMetadata({ version: 2, kind: "IMPROVED" }),
          organizationId: DEMO_IDS.organization,
          runId: created.id,
          actorId: DEMO_IDS.user,
        },
        {
          eventType: "REVIEW_REQUIRED",
          objectType: "RUN",
          objectId: created.id,
          metadata: auditMetadata({ blockingItems: 3 }),
          organizationId: DEMO_IDS.organization,
          runId: created.id,
          actorId: DEMO_IDS.user,
        },
      ],
    });
    return created;
  });

  return getRun(run.id);
}

export async function getRun(runId: string) {
  return prisma.run.findUnique({ where: { id: runId }, include: runInclude });
}

export async function listRuns() {
  await ensureDemoFoundation();
  return prisma.run.findMany({
    where: { workspaceId: DEMO_IDS.workspace },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: runInclude,
  });
}

export async function setReviewItem(runId: string, itemId: string, acknowledged: boolean) {
  const run = await getRun(runId);
  const latest = run?.revisions[0];
  if (!run || !latest || !latest.reviewItems.some((item) => item.id === itemId)) {
    throw new Error("Review item does not belong to the latest run revision.");
  }
  if (run.status !== RUN_STATUS.READY_FOR_REVIEW) {
    throw new Error("Only work ready for review can be checked.");
  }

  await prisma.$transaction([
    prisma.reviewItem.update({
      where: { id: itemId },
      data: {
        acknowledged,
        acknowledgedAt: acknowledged ? new Date() : null,
      },
    }),
    prisma.auditEvent.create({
      data: {
        eventType: acknowledged ? "REVIEW_ITEM_ACKNOWLEDGED" : "REVIEW_ITEM_REOPENED",
        objectType: "REVIEW_ITEM",
        objectId: itemId,
        metadata: auditMetadata({ revisionId: latest.id }),
        organizationId: DEMO_IDS.organization,
        runId,
        actorId: DEMO_IDS.user,
      },
    }),
  ]);
  return getRun(runId);
}

export async function approveRun(runId: string) {
  const run = await getRun(runId);
  const latest = run?.revisions[0];
  if (!run || !latest) throw new Error("Run not found.");
  if (run.status !== RUN_STATUS.READY_FOR_REVIEW) {
    throw new Error("This run is not ready for approval.");
  }
  const unchecked = latest.reviewItems.filter((item) => item.blocking && !item.acknowledged);
  if (unchecked.length > 0) {
    throw new Error("Complete every required review item before approval.");
  }

  await prisma.$transaction(async (tx) => {
    assertTransition(run.status, RUN_STATUS.APPROVED);
    await tx.run.update({ where: { id: runId }, data: { status: RUN_STATUS.APPROVED } });
    const approval = await tx.approval.create({
      data: {
        runId,
        revisionId: latest.id,
        approverId: DEMO_IDS.user,
      },
    });
    await tx.auditEvent.create({
      data: {
        eventType: "RUN_APPROVED",
        objectType: "APPROVAL",
        objectId: approval.id,
        metadata: auditMetadata({ revisionId: latest.id, version: latest.version }),
        organizationId: DEMO_IDS.organization,
        runId,
        actorId: DEMO_IDS.user,
      },
    });
  });
  return getRun(runId);
}

export async function requestRevision(runId: string) {
  const run = await getRun(runId);
  const latest = run?.revisions[0];
  if (!run || !latest) throw new Error("Run not found.");
  if (run.status !== RUN_STATUS.READY_FOR_REVIEW && run.status !== RUN_STATUS.APPROVED) {
    throw new Error("Changes can only be requested for reviewable or approved work.");
  }

  await prisma.$transaction(async (tx) => {
    assertTransition(run.status, RUN_STATUS.CHANGES_REQUESTED);
    await tx.run.update({ where: { id: runId }, data: { status: RUN_STATUS.CHANGES_REQUESTED } });
    await tx.approval.updateMany({
      where: { runId, status: "ACTIVE" },
      data: { status: "INVALIDATED", invalidatedAt: new Date() },
    });
    const revision = await tx.runRevision.create({
      data: {
        runId,
        version: latest.version + 1,
        kind: "REQUESTED_CHANGE",
        executive: latest.executive,
        findings: latest.findings,
        flaggedClaim: latest.flaggedClaim,
        recommendation: `${latest.recommendation} The revision request is recorded for the next editing pass.`,
        reviewItems: { create: buildReviewItems() },
      },
    });
    assertTransition(RUN_STATUS.CHANGES_REQUESTED, RUN_STATUS.GENERATING);
    await tx.run.update({ where: { id: runId }, data: { status: RUN_STATUS.GENERATING } });
    assertTransition(RUN_STATUS.GENERATING, RUN_STATUS.READY_FOR_REVIEW);
    await tx.run.update({ where: { id: runId }, data: { status: RUN_STATUS.READY_FOR_REVIEW } });
    await tx.auditEvent.create({
      data: {
        eventType: "REVISION_REQUESTED",
        objectType: "RUN_REVISION",
        objectId: revision.id,
        metadata: auditMetadata({ version: revision.version, invalidatedApproval: true }),
        organizationId: DEMO_IDS.organization,
        runId,
        actorId: DEMO_IDS.user,
      },
    });
  });
  return getRun(runId);
}
