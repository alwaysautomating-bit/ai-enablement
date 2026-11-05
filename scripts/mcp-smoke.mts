// Smoke-test the stdio MCP server exactly as Codex or Claude Code would launch it.
//   npm run context:mcp-smoke -- --user user_laura --query "Turner invoice approval"
// Issues a short-lived read-only token for the chosen user, starts the server as a child
// process, lists its tools, runs one search, then revokes the token.

import { config } from "dotenv";
import { parseArgs } from "node:util";

config({ quiet: true });

const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");
const { createDb } = await import("../src/lib/db");
const { issueClientToken } = await import("../src/lib/context/principal");
const { ensureSampleContextData } = await import("../src/lib/context/sample-data");

const { values } = parseArgs({
  options: {
    user: { type: "string", default: "user_laura" },
    query: { type: "string", default: "Turner invoice approval" },
  },
});

const db = createDb();
await ensureSampleContextData(db);
const { token, id } = await issueClientToken(db, values.user!, "mcp-smoke", ["context:read"]);

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["--import", "tsx", "scripts/mcp-server.mts"],
  env: { ...process.env, AIEW_CLIENT_TOKEN: token } as Record<string, string>,
  stderr: "pipe",
});
const client = new Client({ name: "mcp-smoke", version: "0.1.0" });
try {
  await client.connect(transport);
  const tools = await client.listTools();
  console.log(`Tools: ${tools.tools.map((tool) => tool.name).join(", ")}`);
  const response = await client.callTool({ name: "search_context", arguments: { query: values.query, include_unreviewed: true } });
  const text = (response.content as Array<{ type: string; text: string }>)[0]?.text ?? "{}";
  const body = JSON.parse(text) as {
    confirmed: Array<{ statement: string; operationalTime: { from: string | null; to: string | null }; provenance: unknown[] }>;
    candidates: unknown[];
  };
  console.log(`As ${values.user}: ${body.confirmed.length} confirmed, ${body.candidates.length} unreviewed candidates`);
  for (const item of body.confirmed) {
    console.log(`  · ${item.statement} [${item.operationalTime.from ?? "?"} → ${item.operationalTime.to ?? "now"}] (${item.provenance.length} sources)`);
  }
} finally {
  await client.close();
  await db.clientAccessToken.update({ where: { id }, data: { revokedAt: new Date() } });
  await db.$disconnect();
}
