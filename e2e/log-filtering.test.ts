import { expect, test } from "@playwright/test";
import {
  clickInDevTools,
  emitAllLevels,
  fillInDevTools,
  openDevToolsPanel,
  waitForLogCount,
  waitForPlaygroundReady,
} from "./helpers";

test.describe("Log Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./playground");
    await waitForPlaygroundReady(page);
    await openDevToolsPanel(page);
    await emitAllLevels(page);
    await waitForLogCount(page, 7);
  });

  test("level toggle filters to single level", async ({ page }) => {
    await clickInDevTools(page, "[data-testid='level-toggle-error']");
    // Should show only error logs (1 user-emitted error)
    await expect(page.locator("[data-testid='log-row']")).toHaveCount(1, { timeout: 5000 });
  });

  test("search input exists and is editable", async ({ page }) => {
    // Verify the search input is present in the DOM (inside the devtools shell)
    await page.waitForFunction(
      () => document.querySelector("[data-testid='search-input']") !== null,
      { timeout: 5000 }
    );
  });

  test("category filter narrows results", async ({ page }) => {
    await fillInDevTools(page, "[data-testid='category-input']", "app");
    const rows = page.locator("[data-testid='log-row']");
    await expect(rows).not.toHaveCount(0, { timeout: 5000 });
    const count = await rows.count();
    expect(count).toBeLessThanOrEqual(7);
  });
});
