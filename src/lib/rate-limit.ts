import Redis from "ioredis";
import { logger } from "@/lib/logger";

type Hit = { ok: boolean; remaining: number };

export function createMemoryLimiter() {
  const hits = new Map<string, number[]>();
  return {
    async hit(key: string, limit: number, windowMs: number): Promise<Hit> {
      const now = Date.now();
      const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { ok: false, remaining: 0 };
      }
      recent.push(now);
      hits.set(key, recent);
      return { ok: true, remaining: limit - recent.length };
    },
  };
}

const memory = createMemoryLimiter();
let redis: Redis | null = null;
let redisFailed = false;

async function hitRedis(key: string, limit: number, windowMs: number): Promise<Hit> {
  const url = process.env.REDIS_URL;
  if (!url || redisFailed) return memory.hit(key, limit, windowMs);
  try {
    if (!redis) {
      redis = new Redis(url, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
        connectTimeout: 1500,
      });
    }
    if (redis.status === "wait" || redis.status === "end") await redis.connect();
    const redisKey = `rl:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) await redis.pexpire(redisKey, windowMs);
    return { ok: count <= limit, remaining: Math.max(limit - count, 0) };
  } catch {
    redisFailed = true;
    logger.warn("Redis tidak tersedia. Pembatas permintaan memakai memori proses.");
    return memory.hit(key, limit, windowMs);
  }
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<Hit> {
  if (!process.env.REDIS_URL) return memory.hit(key, limit, windowMs);
  return hitRedis(key, limit, windowMs);
}

export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || "local";
}
