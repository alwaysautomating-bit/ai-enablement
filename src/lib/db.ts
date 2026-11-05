import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, type Prisma } from "../generated/prisma/client";

// Shared by the Next.js server, the MCP server, and scripts. Kept free of
// "server-only" so non-Next processes (MCP over stdio, evaluation) can use it.

export type Db = PrismaClient;
/** Either the client or an interactive transaction; services accept both. */
export type DbClient = PrismaClient | Prisma.TransactionClient;

export function createDb(databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db"): Db {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({ adapter });
}
