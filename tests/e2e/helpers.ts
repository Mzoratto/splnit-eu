import type { Locator, Page } from "@playwright/test";

export async function checkRadio(locator: Locator): Promise<void> {
  await locator.evaluate(async (element) => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    element.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
    window.scrollBy({ top: 160, behavior: "auto" });
    await new Promise(requestAnimationFrame);
    root.style.scrollBehavior = previousScrollBehavior;
  });
  await locator.check({ force: true });
}

export async function gotoWithRetry(
  page: Page,
  url: string,
  retries = 2,
): Promise<void> {
  for (let i = 0; i <= retries; i++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      return;
    } catch (error) {
      if (i === retries) {
        throw error;
      }
      await page.waitForTimeout(2_000);
    }
  }
}
