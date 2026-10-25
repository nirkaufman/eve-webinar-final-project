import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { resolve } from "node:path";

import * as schema from "./schema";

export const DB_FILE = process.env.PASS_DB_FILE ?? resolve(process.cwd(), "pass.db");

/**
 * One connection per process. The eve runtime, the seed script and drizzle-kit
 * each get their own, which is fine: SQLite handles concurrent readers, and WAL
 * mode keeps writes from blocking them.
 */
const globalForDb = globalThis as unknown as { passDb?: ReturnType<typeof createDb> };

function createDb() {
  const sqlite = new Database(DB_FILE);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db = (globalForDb.passDb ??= createDb());

export * from "./schema";
