import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const openDevToolsPanel = async (page: Page) => {
  const openButton = page.getByRole("button", {
    name: "Open TanStack Devtools",
  });
  if (await openButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await openButton.click();
  }
  // TanStack DevTools renders plugins inside a SolidJS shell with its own
  // panel sizing. The plugin toolbar may exist in DOM but be hidden behind
  // overflow: hidden until the panel fully expands. Use waitForFunction to
  // confirm the toolbar element has non-zero dimensions.
  await page.waitForFunction(
    () => {
      const toolbar = document.querySelector("[data-testid='toolbar']");
      if (!toolbar) {
        return false;
      }
      const rect = toolbar.getBoundingClientRect();
      return rect.height > 0 && rect.width > 0;
    },
    { timeout: 15_000 }
  );
};

export const emitLog = async (page: Page, level: string) => {
  const button = page.locator("button.rounded-md.px-4.py-2").filter({ hasText: level });
  await button.click();
};

export const emitAllLevels = async (page: Page) => {
  const levels = ["trace", "debug", "info", "warning", "error", "fatal"];
  for (const level of levels) {
    await emitLog(page, level);
  }
};

export const waitForLogCount = async (page: Page, count: number) => {
  await expect(page.locator("[data-testid='log-row']")).toHaveCount(count, {
    timeout: 10_000,
  });
};

export const startAutoLog = async (page: Page) => {
  await page.locator("button").filter({ hasText: "Start Auto-Log" }).click();
};

export const waitForPlaygroundReady = async (page: Page) => {
  await page.waitForSelector("button.rounded-md.px-4.py-2", { timeout: 15_000 });
};

/**
 * Click an element inside the TanStack DevTools panel via JS.
 * Playwright can't normally click elements rendered inside the devtools shell
 * because they are "outside the viewport" or report as hidden.
 */
export const clickInDevTools = async (page: Page, selector: string) => {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null;
    el?.click();
  }, selector);
};

/**
 * Set a React controlled input value inside the DevTools panel via JS.
 * Uses the native value setter to trigger React's synthetic onChange.
 */
export const fillInDevTools = async (page: Page, selector: string, value: string) => {
  await page.evaluate(
    ({ sel, val }) => {
      const input = document.querySelector(sel) as HTMLInputElement | null;
      if (!input) {
        return;
      }
      // React 19 intercepts input events. We need to use the native setter
      // and dispatch both input and change events to trigger React's onChange.
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(input, val);
      } else {
        input.value = val;
      }
      input.dispatchEvent(new InputEvent("input", { bubbles: true, data: val }));
    },
    { sel: selector, val: value }
  );
};
