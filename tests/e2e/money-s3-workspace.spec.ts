/**
 * Money S3 / S4 (Seyfor) workspace happy path.
 *
 * Covers: navigate to /workspaces/money-s3, all four layer sections visible,
 * backup controls, and overall progress percentage displayed.
 */

import { expect, test } from "@playwright/test";
import { gotoWithRetry } from "./helpers";

// ─── Tests ────────────────────────────────────────────────────────────────────

// Run on Chromium only per task spec (configured via --project=chromium or playwright.config.ts)
test.use({ locale: "cs-CZ" });

test.describe("Money S3 workspace", () => {
  test("page loads with heading, back link, and demo badge", async ({
    page,
  }) => {
    await gotoWithRetry(page, "/workspaces/money-s3");

    // Page heading
    await expect(
      page.getByRole("heading", { name: "Money S3 / S4 (Seyfor)" }),
    ).toBeVisible({ timeout: 15_000 });

    // Back navigation link
    await expect(
      page.getByRole("link", { name: /Zpět na přehled kontrol/ }),
    ).toBeVisible();

    // Demo mode badge is shown when no Clerk session is present
    await expect(
      page.getByText(/Demo — přihlaste se s organizací/),
    ).toBeVisible();
  });

  test("all four layer tabs are visible and initial progress is 0%", async ({
    page,
  }) => {
    await gotoWithRetry(page, "/workspaces/money-s3");

    await expect(
      page.getByRole("heading", { name: "Money S3 / S4 (Seyfor)" }),
    ).toBeVisible({ timeout: 15_000 });

    // Four layer tab buttons must be present
    const layerTitles = [
      "Infrastruktura a zabezpečení úložiště",
      "Řízení přístupu a správa identit",
      "Zálohy a obnova po havárii",
      "Zabezpečení API a propojení",
    ];

    for (const title of layerTitles) {
      await expect(page.getByRole("button", { name: title })).toBeVisible();
    }

    // Overall progress starts at 0%
    const progressbar = page.getByRole("progressbar").first();
    await expect(progressbar).toBeVisible();
    await expect(progressbar).toHaveAttribute("aria-valuenow", "0");

    // The numeric label also reads "0%"
    await expect(page.getByText("0%").first()).toBeVisible();
  });

  test("Layer 1 (infrastructure) is active by default", async ({ page }) => {
    await gotoWithRetry(page, "/workspaces/money-s3");

    await expect(
      page.getByRole("heading", { name: "Money S3 / S4 (Seyfor)" }),
    ).toBeVisible({ timeout: 15_000 });

    // The infrastructure section heading is visible without any click
    await expect(
      page.getByRole("heading", {
        name: "Infrastruktura a zabezpečení úložiště",
      }),
    ).toBeVisible();
  });

  test("clicking Layer 3 (backup) tab makes it active and shows backup controls", async ({
    page,
  }) => {
    await gotoWithRetry(page, "/workspaces/money-s3");

    await expect(
      page.getByRole("heading", { name: "Money S3 / S4 (Seyfor)" }),
    ).toBeVisible({ timeout: 15_000 });

    await page
      .getByRole("button", { name: "Zálohy a obnova po havárii" })
      .click();

    // After click the section heading for that layer appears
    await expect(
      page.getByRole("heading", { name: "Zálohy a obnova po havárii" }),
    ).toBeVisible();

    // All four backup control question headings should be present
    await expect(
      page.getByText(/Provádíte pravidelnou údržbu databáze Money S3/),
    ).toBeVisible();
    await expect(
      page.getByText(/Je záloha databáze Money S3 automatizována/),
    ).toBeVisible();
    await expect(
      page.getByText(/Jsou zálohy Money S3 ukládány mimo primární lokalitu/),
    ).toBeVisible();
    await expect(
      page.getByText(/Provádíte minimálně jednou ročně dokumentovaný test obnovy databáze Money S3/),
    ).toBeVisible();
  });

});
