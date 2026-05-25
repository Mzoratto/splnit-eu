// Helios workspace happy path.
//
// Covers: navigate to /workspaces/helios, all four layer sections visible,
// covering manufacturing role hierarchy and user account management.

import { expect, test } from "@playwright/test";

// ─── Tests ────────────────────────────────────────────────────────────────────

// Run on Chromium only per task spec (configured via --project=chromium or playwright.config.ts)
test.use({ locale: "cs-CZ" });

test.describe("Helios workspace", () => {
  test("page loads with heading, back link, and demo badge", async ({
    page,
  }) => {
    await page.goto("/workspaces/helios");

    // Page heading
    await expect(
      page.getByRole("heading", { name: "Helios (Asseco)" }),
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
    await page.goto("/workspaces/helios");

    await expect(
      page.getByRole("heading", { name: "Helios (Asseco)" }),
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

  test("clicking Layer 2 (IAM) tab makes it active and shows IAM controls", async ({
    page,
  }) => {
    await page.goto("/workspaces/helios");

    await expect(
      page.getByRole("heading", { name: "Helios (Asseco)" }),
    ).toBeVisible({ timeout: 15_000 });

    const iamTab = page.getByRole("button", {
      name: "Řízení přístupu a správa identit",
    });

    await iamTab.click();

    // After click the section heading for that layer appears
    await expect(
      page.getByRole("heading", { name: "Řízení přístupu a správa identit" }),
    ).toBeVisible();

    // IAM controls for Helios manufacturing role hierarchy
    await expect(
      page.getByText(/Jsou uživatelé Heliosu spravováni s individuálními účty/),
    ).toBeVisible();
    await expect(
      page.getByText(/Jsou uživatelská oprávnění v Heliosu nastavena podle hierarchie rolí/),
    ).toBeVisible();
    await expect(
      page.getByText(/Existuje formální proces pro správu přístupu externích pracovníků/),
    ).toBeVisible();
  });

  test("Layer 1 (infrastructure) is active by default", async ({ page }) => {
    await page.goto("/workspaces/helios");

    await expect(
      page.getByRole("heading", { name: "Helios (Asseco)" }),
    ).toBeVisible({ timeout: 15_000 });

    // The infrastructure section heading is visible without any click
    await expect(
      page.getByRole("heading", {
        name: "Infrastruktura a zabezpečení úložiště",
      }),
    ).toBeVisible();
  });

  test("Layer 2 IAM controls show NIS2 and ZoKB article references", async ({
    page,
  }) => {
    await page.goto("/workspaces/helios");

    await expect(
      page.getByRole("heading", { name: "Helios (Asseco)" }),
    ).toBeVisible({ timeout: 15_000 });

    await page
      .getByRole("button", { name: "Řízení přístupu a správa identit" })
      .click();

    // NIS2 article reference for IAM controls
    await expect(page.getByText("Article 21(2)(i)").first()).toBeVisible();

    // ZoKB section reference
    await expect(page.getByText(/ZoKB.*§ 7/).first()).toBeVisible();
  });
});
