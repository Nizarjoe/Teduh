import { describe, expect, it } from "vitest";
import { assertCsrf } from "@/lib/csrf";

function requestWith(headers: Record<string, string>): Request {
  return new Request("http://localhost:3000/api/checkout", { method: "POST", headers });
}

describe("csrf", () => {
  it("menerima cookie dan header yang sama", async () => {
    await expect(
      assertCsrf(
        requestWith({
          origin: "http://localhost:3000",
          "x-forwarded-host": "localhost:3000",
          cookie: "teduh_csrf=abc",
          "x-csrf-token": "abc",
        }),
      ),
    ).resolves.toBeUndefined();
  });

  it("menolak token yang berbeda", async () => {
    await expect(
      assertCsrf(
        requestWith({
          origin: "http://localhost:3000",
          "x-forwarded-host": "localhost:3000",
          cookie: "teduh_csrf=abc",
          "x-csrf-token": "lain",
        }),
      ),
    ).rejects.toMatchObject({ status: 403 });
  });
});
