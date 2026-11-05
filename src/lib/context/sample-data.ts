import type { Db } from "../db";
import { FIXTURE_PROVIDERS } from "./adapters/fixture";
import { adapterFor } from "./adapters/registry";
import { sameFixturePath } from "./pork";

// Sample organization, people, and read-only sample connections for local use and
// evaluation. Idempotent. Live grants are created by OAuth later, not here. The sample corpus
// is owned by SAME and read through the hash-pinned path in pork.lock.json.

export const SAMPLE = {
  organization: "org_demo",
  users: [
    { id: "user_laura", email: "laura@example.local", name: "Laura Jenkins", role: "MEMBER" },
    { id: "user_marcus", email: "marcus@example.local", name: "Marcus Reed", role: "MEMBER" },
  ],
} as const;

export async function ensureSampleContextData(db: Db) {
  await db.organization.upsert({
    where: { id: SAMPLE.organization },
    update: {},
    create: { id: SAMPLE.organization, name: "AI Enablement Demo Organization" },
  });
  for (const user of SAMPLE.users) {
    await db.user.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id, email: user.email, name: user.name },
    });
    await db.membership.upsert({
      where: { organizationId_userId: { organizationId: SAMPLE.organization, userId: user.id } },
      update: {},
      create: { organizationId: SAMPLE.organization, userId: user.id, role: user.role },
    });
    for (const provider of [FIXTURE_PROVIDERS.EMAIL, FIXTURE_PROVIDERS.CHAT]) {
      const config = JSON.stringify({ corpusPath: sameFixturePath("corpus.json") });
      const existing = await db.sourceGrant.findFirst({
        where: { userId: user.id, provider, status: "ACTIVE" },
      });
      if (existing) {
        if (existing.config !== config) await db.sourceGrant.update({ where: { id: existing.id }, data: { config } });
        continue;
      }
      const adapter = adapterFor(provider);
      await db.sourceGrant.create({
        data: {
          provider,
          accessMode: "READ",
          scopes: JSON.stringify(adapter.describeScopes().map((scope) => scope.scope)),
          accountLabel: adapter.plainName,
          accountIdentity: user.email,
          config,
          organizationId: SAMPLE.organization,
          userId: user.id,
        },
      });
    }
  }
}

/** Sources a person can capture from, with the scope options each offers. */
export async function listSourceOptions(db: Db, userId: string) {
  const grants = await db.sourceGrant.findMany({ where: { userId, status: "ACTIVE" }, orderBy: { provider: "asc" } });
  return Promise.all(
    grants.map(async (grant) => {
      const adapter = adapterFor(grant.provider);
      return {
        grantId: grant.id,
        provider: grant.provider,
        name: grant.accountLabel,
        readOnly: grant.accessMode === "READ",
        permissions: adapter.describeScopes(),
        options: await adapter.listScopeOptions(grant),
      };
    }),
  );
}
