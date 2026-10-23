import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#": new URL("packages/core/src", import.meta.url).pathname,
    },
  },
  test: {
    coverage: {
      exclude: ["**/*.stories.tsx", "**/*.test.{ts,tsx}", "**/index.ts"],
      include: ["packages/core/src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text-summary", "html"],
      // Floors just under the combined unit + Storybook coverage, so CI fails
      // if a change drops it noticeably.
      thresholds: { branches: 86, functions: 95, lines: 95, statements: 95 },
    },
    projects: [
      {
        extends: true,
        test: {
          environment: "jsdom",
          globals: true,
          include: ["packages/**/src/**/*.test.ts", "packages/**/src/**/*.test.tsx"],
          name: "unit",
        },
      },
      {
        extends: true,
        optimizeDeps: {
          exclude: ["react-dom/test-utils"],
          include: ["@storybook/addon-vitest/internal/test-utils"],
        },
        plugins: [storybookTest({ configDir: "./packages/core/.storybook" })],
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright(),
          },
          name: "storybook",
          setupFiles: ["./packages/core/.storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
