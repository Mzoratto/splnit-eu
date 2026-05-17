import { expect, type Page, test } from "@playwright/test";

const claimPatterns = [
  /\bcompliant\b/i,
  /\bcompliance achieved\b/i,
  /\bfully compliant\b/i,
  /\bcertified\b/i,
  /\bcertification achieved\b/i,
  /\blegally required\b/i,
  /\blegal determination\b/i,
];

const inScopeHeading = /Controls in scope|Kontroly v rozsahu/;
const inScopeFilter = /In-scope controls|Kontroly v rozsahu/;
const outOfScopeFilter = /Out of scope \/ not applicable|Mimo rozsah \/ nerelevantní/;
const priorityGap = /Priority gaps based on your intake|Prioritní mezery podle vašeho vstupu/;
const reasonFromIntake = /Reason from intake|Důvod ze vstupu/;
const noMatchingControls = /No controls match this scope filter|Tomuto filtru rozsahu neodpovídají žádné kontroly/;
const openControlAction = /Open control|Otevřít kontrolu/;

async function visibleBodyText(page: Page) {
  return (await page.locator("body").innerText()).replace(/\s+/g, " ");
}

test.describe("intake prioritization production-readiness smoke", () => {
  test.use({ locale: "en-US" });

  test("controls index defaults to the in-scope view", async ({ page }) => {
    await page.goto("/controls");

    await expect(page.getByRole("heading", { name: inScopeHeading })).toBeVisible();
    await expect(page.getByRole("link", { name: inScopeFilter })).toHaveAttribute("href", "/controls");
    await expect(page.getByRole("link", { name: outOfScopeFilter })).toHaveAttribute(
      "href",
      "/controls?scope=out-of-scope",
    );

    await expect(page).not.toHaveURL(/scope=out-of-scope/);
    await expect(page.getByRole("link", { name: inScopeFilter })).toHaveClass(/bg-primary/);
    await expect(page.getByRole("link", { name: outOfScopeFilter })).not.toHaveClass(/bg-primary/);
  });

  test("out-of-scope and not-applicable controls are behind an explicit filter", async ({ page }) => {
    await page.goto("/controls?scope=out-of-scope");

    await expect(page.getByRole("heading", { name: inScopeHeading })).toBeVisible();
    await expect(page.getByRole("link", { name: outOfScopeFilter })).toHaveClass(/bg-primary/);
    await expect(page.getByRole("link", { name: inScopeFilter })).not.toHaveClass(/bg-primary/);

    const activeControlCount = await page.getByRole("link", { name: openControlAction }).count();

    if (activeControlCount > 0) {
      await expect(page.getByText(/Out of scope|Mimo rozsah|N\/A|Nerelevantní/).first()).toBeVisible();
    } else {
      await expect(page.getByText(noMatchingControls).or(page.getByRole("link", { name: /Choose a framework|Vybrat framework/ }))).toBeVisible();
    }
  });

  test("priority and rationale copy are present only as intake-based guidance", async ({ page }) => {
    await page.goto("/controls?scope=priority");

    await expect(page.getByRole("link", { name: priorityGap })).toHaveClass(/bg-primary/);

    const activeControlCount = await page.getByRole("link", { name: openControlAction }).count();
    if (activeControlCount > 0) {
      await expect(page.getByText(reasonFromIntake).first()).toBeVisible();
    }

    const text = await visibleBodyText(page);
    for (const pattern of claimPatterns) {
      expect(text, `Unexpected compliance/legal claim matched ${pattern}`).not.toMatch(pattern);
    }
  });

  test("dashboard still renders when no intake profile is available", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.locator("body")).toContainText(/Dashboard|Přehled|Readiness|Připravenost/);
    const text = await visibleBodyText(page);
    await expect(page.locator("body")).not.toContainText(/Application error|Unhandled Runtime Error|Internal Server Error/i);

    for (const pattern of claimPatterns) {
      expect(text, `Unexpected compliance/legal claim matched ${pattern}`).not.toMatch(pattern);
    }
  });
});
