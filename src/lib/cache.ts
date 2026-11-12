import Redis from "ioredis";
import { logger } from "@/lib/logger";

const memory = new Map<string, { expires: number; value: string }>();
let redis: Redis | null = null;
let redisFailed = false;

function client(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url || redisFailed) return null;
  try {
    redis ??= new Redis(url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 1500,
    });
    return redis;
  } catch {
    redisFailed = true;
    return null;
  }
}

export async function cachedJson<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const local = memory.get(key);
  if (local && local.expires > now) return JSON.parse(local.value) as T;

  const redisClient = client();
  if (redisClient) {
    try {
      if (redisClient.status === "wait" || redisClient.status === "end") await redisClient.connect();
      const hit = await redisClient.get(key);
      if (hit) {
        memory.set(key, { expires: now + ttlMs, value: hit });
        return JSON.parse(hit) as T;
      }
    } catch {
      redisFailed = true;
      logger.warn("Redis tidak tersedia untuk cache. Memakai memori proses.");
    }
  }

  const value = await load();
  const encoded = JSON.stringify(value);
  memory.set(key, { expires: now + ttlMs, value: encoded });
  if (redisClient && !redisFailed) {
    try {
      await redisClient.psetex(key, ttlMs, encoded);
    } catch {
      redisFailed = true;
    }
  }
  return value;
}
