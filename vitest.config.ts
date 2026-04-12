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
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          include: ["packages/**/src/**/*.test.ts", "packages/**/src/**/*.test.tsx"],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: "./packages/core/.storybook" })],
        optimizeDeps: {
          include: ["@storybook/addon-vitest/internal/test-utils"],
          exclude: ["react-dom/test-utils"],
        },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["./packages/core/.storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
