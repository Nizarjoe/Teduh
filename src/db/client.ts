import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "@/db/schema";
import { getEnv } from "@/lib/env";

export type Database = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { pool?: Pool; db?: Database };

function sslOption(url: string, enabled: boolean): PoolConfig["ssl"] {
  if (enabled || url.includes("sslmode=require")) return { rejectUnauthorized: false };
  return undefined;
}

export function getDb(): Database {
  if (globalForDb.db) return globalForDb.db;
  const env = getEnv();
  const pool =
    globalForDb.pool ??
    new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      ssl: sslOption(env.DATABASE_URL, env.DATABASE_SSL),
    });
  const db = drizzle(pool, { schema });
  globalForDb.pool = pool;
  globalForDb.db = db;
  return db;
}

export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type Db = Database | Tx;
