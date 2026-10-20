import { expect, type Page, test } from "@playwright/test";
import { emitAllLevels, openDevToolsPanel, waitForPlaygroundReady } from "./helpers";

// Only the deployed site sends the Content-Security-Policy header, so this
// guards the preview run: a stale script hash or a blocked resource fails here.
const recordViolations = async (page: Page) => {
  await page.addInitScript(() => {
    const violations: string[] = [];
    Object.assign(window, { __cspViolations: violations });
    document.addEventListener("securitypolicyviolation", (event) => {
      violations.push(`${event.effectiveDirective} ${event.blockedURI}`);
    });
  });
};

const violations = (page: Page) =>
  page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations);

test.describe("Content Security Policy", () => {
  test.beforeEach(async ({ page }) => {
    await recordViolations(page);
  });

  test("docs page loads and highlights code without violations", async ({ page }) => {
    await page.goto("./docs");
    await expect(page.locator(".shiki").first()).toBeAttached({ timeout: 15_000 });
    expect(await violations(page)).toEqual([]);
  });

  test("playground and devtools panel run without violations", async ({ page }) => {
    await page.goto("./playground");
    await waitForPlaygroundReady(page);
    await openDevToolsPanel(page);
    await emitAllLevels(page);
    expect(await violations(page)).toEqual([]);
  });
});
