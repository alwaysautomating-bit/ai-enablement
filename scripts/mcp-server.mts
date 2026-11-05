// Stdio MCP server for Codex and Claude Code.
//
// Launch from any directory; the server moves to the repository root so the local
// database and sample corpus resolve. Stdout carries the MCP protocol only, so nothing
// else may print to it.
//
//   AIEW_CLIENT_TOKEN=<token from `npm run context:token`> npx tsx scripts/mcp-server.ts

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), ".."));

const { config } = await import("dotenv");
config({ quiet: true });

const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
const { createDb } = await import("../src/lib/db");
const { resolveClientToken } = await import("../src/lib/context/principal");
const { selectExtractionModel } = await import("../src/lib/context/extraction/select");
const { createContextMcpServer } = await import("../src/mcp/context-server");

const db = createDb();
const resolved = await resolveClientToken(db, process.env.AIEW_CLIENT_TOKEN);
if (!resolved) {
  console.error("AIEW_CLIENT_TOKEN is missing, revoked, or unknown. Create one with: npm run context:token -- --user <userId>");
  process.exit(1);
}

const server = createContextMcpServer({
  db,
  principal: resolved.principal,
  scopes: resolved.scopes,
  model: () => selectExtractionModel(),
});
await server.connect(new StdioServerTransport());
console.error(`AI Enablement context server ready for ${resolved.principal.displayName}.`);
