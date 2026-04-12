import { expect, test } from "@playwright/test";
import {
  emitAllLevels,
  openDevToolsPanel,
  waitForLogCount,
  waitForPlaygroundReady,
} from "./helpers";

test.describe("DevTools Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./playground");
    await waitForPlaygroundReady(page);
  });

  test("opens the devtools panel", async ({ page }) => {
    await openDevToolsPanel(page);
    // Toolbar is inside TanStack DevTools shell — check via DOM dimensions
    await page.waitForFunction(
      () =>
        (document.querySelector("[data-testid='toolbar']")?.getBoundingClientRect().height ?? 0) >
        0,
      { timeout: 10_000 }
    );
  });

  test("shows log list after opening", async ({ page }) => {
    await openDevToolsPanel(page);
    // The log list or empty state should exist in the DOM
    await page.waitForFunction(
      () =>
        document.querySelector("[data-testid='log-list']") !== null ||
        document.querySelector("[data-testid='log-list-empty']") !== null,
      { timeout: 10_000 }
    );
  });

  test("emitted logs appear in the panel", async ({ page }) => {
    await openDevToolsPanel(page);
    await emitAllLevels(page);
    // At least 6 user-emitted logs + 1 meta log
    const rows = page.locator("[data-testid='log-row']");
    await expect(rows).toHaveCount(7, { timeout: 10_000 });
  });

  test("shows all level badges", async ({ page }) => {
    await openDevToolsPanel(page);
    await emitAllLevels(page);
    await waitForLogCount(page, 7);
    const body = page.locator("body");
    await expect(body).toContainText("TRC");
    await expect(body).toContainText("DBG");
    await expect(body).toContainText("INF");
    await expect(body).toContainText("WRN");
    await expect(body).toContainText("ERR");
    await expect(body).toContainText("FTL");
  });

  test("shows log count", async ({ page }) => {
    await openDevToolsPanel(page);
    await emitAllLevels(page);
    await waitForLogCount(page, 7);
    // The log count text lives inside the devtools shell and may report as
    // hidden to Playwright. Check via DOM text content instead.
    // The count and "logs" label are now in separate elements.
    await page.waitForFunction(
      () => {
        const toolbar = document.querySelector("[data-testid='toolbar']");
        if (!toolbar) {
          return false;
        }
        const spans = toolbar.querySelectorAll("span");
        return Array.from(spans).some((s) => /^\d+$/.test(s.textContent?.trim() ?? ""));
      },
      { timeout: 5000 }
    );
  });
});
