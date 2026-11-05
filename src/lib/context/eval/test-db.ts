import Database from "better-sqlite3";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createDb } from "../../db";

/** A fresh, fully migrated SQLite database in a temp directory. */
export function createScratchDatabase() {
  const directory = mkdtempSync(join(tmpdir(), "aiew-context-"));
  const path = join(directory, "eval.db");
  const database = new Database(path);
  database.pragma("foreign_keys = ON");
  const migrationsPath = resolve(process.cwd(), "prisma", "migrations");
  for (const name of readdirSync(migrationsPath, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
    database.exec(readFileSync(join(migrationsPath, name, "migration.sql"), "utf8"));
  }
  database.close();
  return { db: createDb(`file:${path}`), path };
}
