import "dotenv/config";
import Database from "better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
if (!rawUrl.startsWith("file:")) {
  throw new Error("The local migration runner only supports SQLite file URLs.");
}

const databasePath = resolve(process.cwd(), rawUrl.slice("file:".length));
const migrationsPath = resolve(process.cwd(), "prisma", "migrations");
const database = new Database(databasePath);
database.pragma("foreign_keys = ON");
database.exec(`
  CREATE TABLE IF NOT EXISTS "_AppMigration" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const applied = database
  .prepare('SELECT "name" FROM "_AppMigration"')
  .all()
  .map((row) => (row as { name: string }).name);

const migrations = readdirSync(migrationsPath, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

// Databases created before this runner tracked versions already contain the initial
// tables. Only that first migration may be recorded without executing; every later
// migration must run, or its tables would silently never exist.
const INITIAL_MIGRATION = migrations[0];

for (const name of migrations) {
  if (applied.includes(name)) continue;
  const sql = readFileSync(join(migrationsPath, name, "migration.sql"), "utf8");
  const hasProductTables = database
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'Organization'")
    .get();
  const alreadyPresent = name === INITIAL_MIGRATION && hasProductTables;

  database.transaction(() => {
    if (!alreadyPresent) database.exec(sql);
    database.prepare('INSERT INTO "_AppMigration" ("name") VALUES (?)').run(name);
  })();
  console.log(`Applied migration ${name}`);
}

database.close();
