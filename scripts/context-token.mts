// Issue a personal token so Codex or Claude Code can reach the context MCP server.
//   npm run context:token -- --user user_laura --name "Claude Code"
// The token is printed once. Only its hash is stored.

import "dotenv/config";
import { parseArgs } from "node:util";
import { createDb } from "../src/lib/db";
import { issueClientToken } from "../src/lib/context/principal";
import { ensureSampleContextData } from "../src/lib/context/sample-data";

const { values } = parseArgs({
  options: {
    user: { type: "string", default: "user_laura" },
    name: { type: "string", default: "AI client" },
    "read-only": { type: "boolean", default: false },
  },
});

const db = createDb();
await ensureSampleContextData(db);
const scopes = values["read-only"] ? ["context:read"] : ["context:read", "capture:start"];
const { token } = await issueClientToken(db, values.user!, values.name!, scopes);
console.log(`Token for ${values.user} (${values.name}), scopes ${scopes.join(", ")}:\n\n${token}\n`);
console.log("Store it as AIEW_CLIENT_TOKEN in your MCP client configuration. It will not be shown again.");
await db.$disconnect();
