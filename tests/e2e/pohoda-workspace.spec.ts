/**
 * Pohoda workspace happy path.
 *
 * Covers: navigate to /workspaces/pohoda, all four layer sections visible,
 * backup controls, NIS2/ZoKB references, and initial progress state.
 */

import { expect, test } from "@playwright/test";

// ─── Tests ────────────────────────────────────────────────────────────────────

// Run on Chromium only per task spec (configured via --project=chromium or playwright.config.ts)
test.use({ locale: "cs-CZ" });

test.describe("Pohoda workspace", () => {
  test("page loads with heading, back link, and demo badge", async ({
    page,
  }) => {
    await page.goto("/workspaces/pohoda");

    // Page heading
    await expect(
      page.getByRole("heading", { name: "Pohoda (Stormware)" }),
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
    await page.goto("/workspaces/pohoda");

    await expect(
      page.getByRole("heading", { name: "Pohoda (Stormware)" }),
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

  test("clicking Layer 3 (backup) tab makes it active and shows backup controls", async ({
    page,
  }) => {
    await page.goto("/workspaces/pohoda");

    await expect(
      page.getByRole("heading", { name: "Pohoda (Stormware)" }),
    ).toBeVisible({ timeout: 15_000 });

    const backupTab = page.getByRole("button", {
      name: "Zálohy a obnova po havárii",
    });

    // Tab starts inactive (not selected)
    await backupTab.click();

    // After click the section heading for that layer appears
    await expect(
      page.getByRole("heading", { name: "Zálohy a obnova po havárii" }),
    ).toBeVisible();

    // All four backup control question headings should be present
    await expect(
      page.getByText(
        /Provádíte pravidelnou Údržbu databáze Pohody/,
      ),
    ).toBeVisible();
    await expect(
      page.getByText(/Je záloha databáze Pohody automatizována/),
    ).toBeVisible();
    await expect(
      page.getByText(/Jsou zálohy ukládány mimo primární lokalitu/),
    ).toBeVisible();
    await expect(
      page.getByText(/Provádíte minimálně jednou ročně dokumentovaný test obnovy/),
    ).toBeVisible();
  });

  test("Layer 1 (infrastructure) is active by default", async ({ page }) => {
    await page.goto("/workspaces/pohoda");

    await expect(
      page.getByRole("heading", { name: "Pohoda (Stormware)" }),
    ).toBeVisible({ timeout: 15_000 });

    // The infrastructure section heading is visible without any click
    await expect(
      page.getByRole("heading", {
        name: "Infrastruktura a zabezpečení úložiště",
      }),
    ).toBeVisible();
  });

  test("Layer 3 backup control shows NIS2 and ZoKB article references", async ({
    page,
  }) => {
    await page.goto("/workspaces/pohoda");

    await expect(
      page.getByRole("heading", { name: "Pohoda (Stormware)" }),
    ).toBeVisible({ timeout: 15_000 });

    await page
      .getByRole("button", { name: "Zálohy a obnova po havárii" })
      .click();

    // NIS2 article reference for backup controls
    await expect(page.getByText("Article 21(2)(c)").first()).toBeVisible();

    // ZoKB section reference
    await expect(page.getByText(/ZoKB.*§ 8/).first()).toBeVisible();
  });
});
