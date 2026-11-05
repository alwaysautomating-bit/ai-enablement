import "server-only";
import { createDb, type Db } from "@/lib/db";

const globalForPrisma = globalThis as unknown as {
  prisma: Db | undefined;
};

export const prisma = globalForPrisma.prisma ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
