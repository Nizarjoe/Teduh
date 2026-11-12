import { describe, expect, it } from "vitest";
import { createMemoryLimiter } from "@/lib/rate-limit";

describe("pembatas memori", () => {
  it("menolak setelah batas", async () => {
    const limiter = createMemoryLimiter();
    const first = await limiter.hit("kunci", 2, 60_000);
    const second = await limiter.hit("kunci", 2, 60_000);
    const third = await limiter.hit("kunci", 2, 60_000);
    expect(first.ok && second.ok && !third.ok).toBe(true);
  });
});
