import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function setupVercelSqlite() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    try {
      const sourceDb = path.join(process.cwd(), "prisma", "dev.db");
      const targetDb = path.join("/tmp", "dev.db");

      if (!fs.existsSync(targetDb) && fs.existsSync(sourceDb)) {
        fs.copyFileSync(sourceDb, targetDb);
        console.log("[PRISMA] Successfully copied SQLite database to writable /tmp/dev.db");
      }
      process.env.DATABASE_URL = `file:${targetDb}`;
    } catch (err) {
      console.warn("[PRISMA] Could not copy SQLite database to /tmp:", err);
    }
  }
}

setupVercelSqlite();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
