import "server-only";
import { prisma } from "@/lib/prisma";

export const DEMO_IDS = {
  organization: "org_demo",
  user: "user_laura",
  workspace: "workspace_research",
  framework: "framework_research_assistant",
} as const;

export async function ensureDemoFoundation() {
  await prisma.organization.upsert({
    where: { id: DEMO_IDS.organization },
    update: {},
    create: {
      id: DEMO_IDS.organization,
      name: "AI Enablement Demo Organization",
    },
  });

  await prisma.user.upsert({
    where: { id: DEMO_IDS.user },
    update: {},
    create: {
      id: DEMO_IDS.user,
      email: "laura@example.local",
      name: "Laura Jenkins",
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: DEMO_IDS.organization,
        userId: DEMO_IDS.user,
      },
    },
    update: {},
    create: {
      organizationId: DEMO_IDS.organization,
      userId: DEMO_IDS.user,
      role: "OWNER",
      tierCeiling: "L0",
    },
  });

  await prisma.workspace.upsert({
    where: { id: DEMO_IDS.workspace },
    update: {},
    create: {
      id: DEMO_IDS.workspace,
      name: "Research Assistant",
      tier: "L0",
      organizationId: DEMO_IDS.organization,
    },
  });

  await prisma.framework.upsert({
    where: { id: DEMO_IDS.framework },
    update: {},
    create: {
      id: DEMO_IDS.framework,
      name: "Research Brief",
      workspaceId: DEMO_IDS.workspace,
    },
  });

  return prisma.frameworkVersion.upsert({
    where: {
      frameworkId_version: {
        frameworkId: DEMO_IDS.framework,
        version: 1,
      },
    },
    update: {},
    create: {
      frameworkId: DEMO_IDS.framework,
      version: 1,
      inputContract: JSON.stringify({
        required: ["question", "audience", "priority", "sources"],
      }),
      outputContract: JSON.stringify({
        sections: ["executive", "findings", "flaggedClaim", "recommendation"],
      }),
      reviewPolicy: JSON.stringify({
        required: ["SOURCE", "SCOPE", "AUDIENCE"],
        explicitApproval: true,
      }),
      privacyPolicy: JSON.stringify({
        mode: "NOTICE_AND_SUGGEST",
        connectorAccess: "READ_ONLY",
      }),
    },
  });
}
