// Salinan runtime dari src/db/migrate.ts agar container produksi tidak butuh tsx.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL kosong");
const ssl = process.env.DATABASE_SSL === "true" || url.includes("sslmode=require");
const pool = new pg.Pool({
  connectionString: url,
  max: 1,
  ssl: ssl ? { rejectUnauthorized: false } : undefined,
});
const client = await pool.connect();
try {
  await client.query("select pg_advisory_lock(842611)");
  await client.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);
  const dir = path.resolve(process.cwd(), "drizzle");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    const existing = await client.query("select 1 from schema_migrations where id = $1", [file]);
    if (existing.rowCount) continue;
    const sqlText = await readFile(path.join(dir, file), "utf8");
    const statements = sqlText
      .split("--> statement-breakpoint")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    await client.query("begin");
    try {
      for (const statement of statements) await client.query(statement);
      await client.query("insert into schema_migrations (id) values ($1)", [file]);
      await client.query("commit");
      console.log(`migrasi ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }
} finally {
  try {
    await client.query("select pg_advisory_unlock(842611)");
  } catch {
    /* koneksi sudah ditutup */
  }
  client.release();
  await pool.end();
}
