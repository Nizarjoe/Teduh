import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { sessions, users } from "@/db/schema";
import { AppError } from "@/lib/errors";
import { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_COOKIE = "teduh_session";
const SESSION_SECONDS = 60 * 60 * 24 * 14;

let dummyHash: Promise<string> | null = null;

function dummyPasswordHash(): Promise<string> {
  dummyHash ??= hashPassword("dummy-password-not-used");
  return dummyHash;
}

export function sessionCookieName(): string {
  return SESSION_COOKIE;
}

export function sessionMaxAge(): number {
  return SESSION_SECONDS;
}

export async function loginAdmin(email: string, password: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  const user = rows[0];
  const hash = user?.passwordHash ?? (await dummyPasswordHash());
  const ok = await verifyPassword(password, hash);
  if (!user || !ok || user.role !== "admin") return null;
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await db.insert(sessions).values({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000),
  });
  return token;
}

export async function logoutToken(token: string | null): Promise<void> {
  if (!token) return;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await getDb().delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function getAdmin(): Promise<{ id: string; name: string; email: string } | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const rows = await getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);
  const row = rows[0];
  if (!row || row.role !== "admin" || row.expiresAt.getTime() < Date.now()) return null;
  return { id: row.id, name: row.name, email: row.email };
}

export async function requireAdmin(): Promise<{ id: string; name: string; email: string }> {
  const admin = await getAdmin();
  if (!admin) throw new AppError("auth", "Masuk dulu.", 401);
  return admin;
}

export function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/admin";
  if (!value.startsWith("/admin") || value.startsWith("//") || value.includes("\\") || value.includes("://")) {
    return "/admin";
  }
  return value;
}
