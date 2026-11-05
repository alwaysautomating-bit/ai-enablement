import { createHash, randomBytes } from "node:crypto";
import type { Db } from "../db";
import type { Principal } from "./types";

// Principal resolution. The web session resolver is a local development stand-in until
// Auth.js lands (roadmap Phase 0); AI clients authenticate with personal tokens. Both
// produce the same Principal, so nothing downstream changes when real sign-in arrives.

export async function principalForUser(
  db: Db,
  userId: string,
  via: Principal["via"],
  clientName?: string,
): Promise<Principal | null> {
  const user = await db.user.findUnique({ where: { id: userId }, include: { memberships: true } });
  const membership = user?.memberships[0];
  if (!user || !membership) return null;
  return {
    userId: user.id,
    organizationId: membership.organizationId,
    displayName: user.name,
    emails: [user.email.toLowerCase()],
    via,
    clientName,
  };
}

const TOKEN_PREFIX = "aiew_";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export const CLIENT_SCOPES = ["context:read", "capture:start"] as const;

/** Issue a personal AI-client token. The plaintext is returned once and never stored. */
export async function issueClientToken(db: Db, userId: string, name: string, scopes: readonly string[] = CLIENT_SCOPES) {
  const principal = await principalForUser(db, userId, "WEB");
  if (!principal) throw new Error("That user does not belong to an organization.");
  const token = `${TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
  const record = await db.clientAccessToken.create({
    data: {
      name,
      tokenHash: hashToken(token),
      scopes: JSON.stringify(scopes),
      organizationId: principal.organizationId,
      userId,
    },
  });
  return { token, id: record.id };
}

export async function resolveClientToken(db: Db, token: string | undefined) {
  if (!token || !token.startsWith(TOKEN_PREFIX)) return null;
  const record = await db.clientAccessToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.revokedAt) return null;
  await db.clientAccessToken.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } });
  const principal = await principalForUser(db, record.userId, "MCP_CLIENT", record.name);
  if (!principal || principal.organizationId !== record.organizationId) return null;
  return { principal, scopes: JSON.parse(record.scopes) as string[] };
}
