/**
 * Activation loop happy path.
 *
 * Covers the end-to-end surface from intake completion to confirmed status
 * visible in the controls index, including connector recommendation and the
 * blocked-permission fallback state, all in demo mode (no Clerk/DB required).
 *
 * Happy path: intake → connector recommendation → connector page (OAuth entry
 * point) → first-run results page (controls) → confirmed status visible.
 *
 * Blocked-permission fallback: verified on the controls page demo data which
 * always includes a control with a blocked/missing_permission state showing
 * "Blocked" and "Permission missing" in the ActivationStatus component.
 */

import { expect, test } from "@playwright/test";

test.use({ locale: "cs-CZ" });

test("activation loop: intake completes and recommends a connector", async ({
  page,
}) => {
  await page.goto("/onboarding");

  await expect(
    page.getByRole("heading", { name: "Nastavení organizace" }),
  ).toBeVisible();

  await page.getByLabel("Název firmy").fill("Acme NIS2 s.r.o.");
  await page.getByLabel("IČO").fill("87654321");
  await page.getByLabel("Sektor").selectOption("technology");
  await page.getByLabel("Počet zaměstnanců").selectOption("10-49");
  await page.getByRole("button", { name: /Pokračovat/ }).click();

  // Walk all intake sections
  await expect(page.getByText("Intake · sekce 1 ze 7")).toBeVisible();

  for (let section = 2; section <= 7; section += 1) {
    await page.getByRole("button", { name: "Další sekce" }).click();
    await expect(page.getByText(`Intake · sekce ${section} ze 7`)).toBeVisible();
  }

  await page.getByRole("button", { name: "Dokončit intake" }).click();

  // Connector recommendation dialog appears
  const dialog = page.getByRole("dialog", {
    name: "První mezery jsou připravené",
  });
  await expect(dialog).toBeVisible();

  // Microsoft 365 is always recommended for a technology sector org
  await expect(dialog.getByText("Microsoft 365")).toBeVisible();

  // User clicks through to the integrations/tools page
  await page.getByRole("button", { name: "Pokračovat na nástroje" }).click();
  await expect(
    page.getByRole("heading", { name: "AI nástroje a SaaS inventář" }),
  ).toBeVisible();
});

test("activation loop: connector page shows OAuth entry point", async ({
  page,
}) => {
  await page.goto("/integrations/microsoft365");

  await expect(
    page.getByRole("heading", { name: "Microsoft 365 integrace" }),
  ).toBeVisible();

  // In demo mode the connect button is present but disabled (no Clerk session)
  await expect(
    page.getByRole("button", { name: "Připojit Microsoft 365" }),
  ).toBeDisabled();

  // The demo stub explains why actions are disabled so users understand the
  // connect button is the OAuth entry point
  await expect(
    page.getByText("Akce připojení jsou vypnuté", { exact: false }),
  ).toBeVisible();

  // The test suite section is shown — first-run tests are listed
  await expect(
    page.getByRole("heading", { name: "Automatické testy" }),
  ).toBeVisible();

  // Results placeholder is present before a first run
  await expect(
    page.getByText("Výsledky se zobrazí po prvním automatickém běhu."),
  ).toBeVisible();
});

test("activation loop: controls index shows confirmed activation status after first run", async ({
  page,
}) => {
  await page.goto("/controls");

  // Page heading in Czech locale
  await expect(
    page.getByRole("heading", { name: "Knihovna kontrol" }),
  ).toBeVisible({ timeout: 15_000 });

  // Demo evidence cycle includes assessmentResult: "gap" + collectionStatus: "collected"
  // which renders as "Confirmed gap" — this is the "confirmed status visible" gate
  await expect(page.getByText("Confirmed gap").first()).toBeVisible();
});

test("activation loop: blocked-permission fallback is visible in controls index", async ({
  page,
}) => {
  // Default (focus) view — showDetails=true, so blocked reason text is rendered
  await page.goto("/controls");

  await expect(
    page.getByRole("heading", { name: "Knihovna kontrol" }),
  ).toBeVisible({ timeout: 15_000 });

  // Demo evidence cycle includes blocked/missing_permission state in the first 5 priority controls
  await expect(page.getByText("Blocked").first()).toBeVisible();
  // In focus view showDetails=true — reason text is rendered by ActivationStatus
  await expect(page.getByText("Reason: Permission missing.").first()).toBeVisible();
});

test("activation loop: blocked state preserves last-known passing result in controls focus view", async ({
  page,
}) => {
  // The focus view (default) shows showDetails=true on ActivationStatus
  await page.goto("/controls");

  await expect(
    page.getByRole("heading", { name: "Knihovna kontrol" }),
  ).toBeVisible({ timeout: 15_000 });

  // The activation status component renders the preserved last-known result
  // text when a control is blocked but had a previous passing assessment
  await expect(
    page.getByText("Last confirmed result is still passing while collection is blocked.").first(),
  ).toBeVisible();
});
