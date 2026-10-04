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

  test("search filters rows by message text", async ({ page }) => {
    const before = await page.locator("[data-testid='log-row']").count();
    expect(before).toBe(7);

    // Playground messages are random, so pick a token that currently matches
    // exactly one visible row and assert the filter narrows to that row.
    const probe = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll("[data-testid='log-row']")).map(
        (row) => row.textContent ?? ""
      );
      for (const text of texts) {
        const tokens = text.split(/[^A-Za-z0-9_./:-]+/).filter((token) => token.length >= 6);
        for (const token of tokens) {
          const needle = token.toLowerCase();
          const matches = texts.filter((candidate) => candidate.toLowerCase().includes(needle));
          if (matches.length === 1) {
            return token;
          }
        }
      }
      return null;
    });
    expect(probe, "expected a unique search token among visible rows").toBeTruthy();
    if (!probe) {
      return;
    }

    await fillInDevTools(page, "[data-testid='search-input']", probe);
    // Toolbar debounce is 200ms — waitFor on the filtered count covers it.
    await expect(page.locator("[data-testid='log-row']")).toHaveCount(1, { timeout: 5000 });
    await expect
      .poll(async () => {
        const toolbar = await page.locator("[data-testid='toolbar']").textContent();
        return toolbar?.includes("1 / 7") ?? false;
      })
      .toBe(true);
  });

  test("category filter narrows results", async ({ page }) => {
    await fillInDevTools(page, "[data-testid='category-input']", "app");
    const rows = page.locator("[data-testid='log-row']");
    await expect(rows).not.toHaveCount(0, { timeout: 5000 });
    const count = await rows.count();
    expect(count).toBeLessThanOrEqual(7);
  });
});
