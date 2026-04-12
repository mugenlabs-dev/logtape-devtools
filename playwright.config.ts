import { defineConfig } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3001";
const isRemote = process.env.BASE_URL !== undefined;

export default defineConfig({
  forbidOnly: process.env.CI !== undefined,
  fullyParallel: true,
  reporter: "html",
  retries: process.env.CI === undefined ? 0 : 2,
  testDir: "./e2e",
  use: {
    baseURL,
    trace: "on-first-retry",
    ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? {
          extraHTTPHeaders: {
            "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
          },
        }
      : {}),
  },
  workers: process.env.CI === undefined ? undefined : 4,
  ...(isRemote
    ? {}
    : {
        webServer: {
          command: "pnpm build && pnpm dev:demo",
          reuseExistingServer: true,
          timeout: 120_000,
          url: "http://localhost:3001",
        },
      }),
});
