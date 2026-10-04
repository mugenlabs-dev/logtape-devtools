import { expect, test } from "@playwright/test";
import {
  clickInDevTools,
  emitAllLevels,
  emitLog,
  openDevToolsPanel,
  waitForLogCount,
  waitForPlaygroundReady,
} from "./helpers";

test.describe("Log Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./playground");
    await waitForPlaygroundReady(page);
    await openDevToolsPanel(page);
    await emitAllLevels(page);
    await waitForLogCount(page, 7);
  });

  test("clicking a log row expands it", async ({ page }) => {
    await clickInDevTools(page, "[data-testid='log-row']");
    await page.waitForFunction(
      () => document.querySelector("[data-testid='log-detail']") !== null,
      { timeout: 5000 }
    );
  });

  test("clicking expanded row collapses it", async ({ page }) => {
    await clickInDevTools(page, "[data-testid='log-row']");
    await page.waitForFunction(
      () => document.querySelector("[data-testid='log-detail']") !== null,
      { timeout: 5000 }
    );
    await clickInDevTools(page, "[data-testid='log-row']");
    await expect(page.locator("[data-testid='log-detail']")).toHaveCount(0, { timeout: 3000 });
  });

  test("pause stops showing new logs", async ({ page }) => {
    await clickInDevTools(page, "button[title='Pause live updates']");
    await page.waitForFunction(
      () => {
        const buttons = document.querySelectorAll("button");
        return Array.from(buttons).some((b) => b.textContent?.includes("Resume"));
      },
      { timeout: 5000 }
    );

    const countWhilePaused = await page.locator("[data-testid='log-row']").count();
    await emitLog(page, "info");
    await emitLog(page, "error");
    // Two extra emissions would appear within this window if Pause were still subscribed.
    await page.evaluate(() => new Promise<void>((resolve) => window.setTimeout(resolve, 400)));
    await expect(page.locator("[data-testid='log-row']")).toHaveCount(countWhilePaused);

    await clickInDevTools(page, "button[title='Resume live updates']");
    await expect(page.locator("[data-testid='log-row']")).toHaveCount(countWhilePaused + 2, {
      timeout: 5000,
    });
  });

  test("clear removes all logs", async ({ page }) => {
    await clickInDevTools(page, "button[title='Clear all logs']");
    await page.waitForFunction(
      () => document.querySelector("[data-testid='log-list-empty']") !== null,
      { timeout: 5000 }
    );
  });
});
