import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

loadEnv();

const baseURL = process.env.APP_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command:
      "rm -rf .next/standalone/public .next/standalone/.next/static && cp -r public .next/standalone/public && mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static && cd .next/standalone && node server.js",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: "3000",
      HOSTNAME: "127.0.0.1",
    },
  },
});
