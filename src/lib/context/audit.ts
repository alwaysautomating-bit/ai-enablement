import type { DbClient } from "../db";
import type { Principal } from "./types";

type AuditClient = Pick<DbClient, "auditEvent">;

/**
 * Append-only audit events for context capture. Metadata holds ids and counts only —
 * never message content, quotes, credentials, or tokens.
 */
export async function audit(
  db: AuditClient,
  principal: Principal,
  eventType: string,
  objectType: string,
  objectId: string,
  metadata: Record<string, string | number | boolean | null> = {},
) {
  await db.auditEvent.create({
    data: {
      eventType,
      objectType,
      objectId,
      metadata: JSON.stringify({ ...metadata, via: principal.via, client: principal.clientName ?? null }),
      organizationId: principal.organizationId,
      actorId: principal.userId,
    },
  });
}
