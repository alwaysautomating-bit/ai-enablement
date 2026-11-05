import "dotenv/config";
import Database from "better-sqlite3";
import { copyFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

// Clears demo activity (questions asked, suggestions, reviews, timelines, research runs) so the
// next walkthrough starts clean. Sample users, source grants, and MCP access tokens are kept, and
// the sample data re-seeds itself on the next page load. A backup is written first.

const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
if (!rawUrl.startsWith("file:")) throw new Error("demo:reset only supports the local SQLite database.");
const databasePath = resolve(process.cwd(), rawUrl.slice("file:".length));

const backupDirectory = join("output", "demo-backups");
mkdirSync(backupDirectory, { recursive: true });
const backup = join(backupDirectory, `dev-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
copyFileSync(databasePath, backup);

const ACTIVITY_TABLES = [
  "Relationship",
  "OperationalFact",
  "ReviewDecision",
  "AssertionEvidence",
  "Assertion",
  "EntityAlias",
  "OpEntity",
  "SourceIdentity",
  "CaptureEvidence",
  "Conversation",
  "Evidence",
  "CaptureScope",
  "Capture",
  "Approval",
  "ReviewItem",
  "RunSource",
  "RunRevision",
  "Run",
];

const database = new Database(databasePath);
database.pragma("foreign_keys = OFF");
database.transaction(() => {
  for (const table of ACTIVITY_TABLES) {
    const { changes } = database.prepare(`DELETE FROM "${table}"`).run();
    if (changes) console.log(`  ${table}: ${changes} removed`);
  }
})();
database.close();

console.log(`Demo data cleared. Backup: ${backup}`);
