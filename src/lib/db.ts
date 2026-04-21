import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function resolveDatabaseUrl() {
  if (!process.env.VERCEL) {
    return undefined;
  }

  const bundledDatabasePath = path.join(process.cwd(), "prisma", "dev.db");
  const runtimeDatabasePath = path.join("/tmp", "pr-practice-preview.db");

  if (!fs.existsSync(runtimeDatabasePath)) {
    if (!fs.existsSync(bundledDatabasePath)) {
      throw new Error(`Bundled SQLite database not found at ${bundledDatabasePath}`);
    }

    fs.copyFileSync(bundledDatabasePath, runtimeDatabasePath);
  }

  return `file:${runtimeDatabasePath}`;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
