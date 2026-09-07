import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

// Lazy on purpose. This module used to throw at import time when
// DATABASE_URL was unset — which, inside the Vercel function bundle, crashed
// the ENTIRE api with FUNCTION_INVOCATION_FAILED, taking down even routes
// that never touch the database (the chat concierge). Now the pool is built
// on first query, so a missing DB config degrades to failing DB routes only.
let _db: NodePgDatabase<typeof schema> | null = null;

function realDb(): NodePgDatabase<typeof schema> {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _db = drizzle(pool, { schema });
  }
  return _db;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = realDb() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
});
