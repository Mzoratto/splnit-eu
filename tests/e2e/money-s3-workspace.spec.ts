/**
 * Money S3 / S4 (Seyfor) workspace happy path.
 *
 * Covers: navigate to /workspaces/money-s3, all four layer sections visible,
 * submit an attestation answer on Layer 3 (backup), "Attestation saved" message
 * shown after submission, overall progress percentage displayed.
 *
 * Runs on Chromium only. The server action POST is intercepted so the test
 * works without a live Clerk session or database (demo mode).
 *
 * The WorkspaceRenderer form calls submitWorkspaceAttestationAction (a Next.js
 * server action that POSTs to the page URL with a next-action header). We
 * intercept that server action following the same pattern as
 * pohoda-workspace.spec.ts and helios-workspace.spec.ts.
 *
 * The task spec references /api/test/workspace-attestation as the test-only
 * route; that route exists for non-E2E integration testing but the form itself
 * calls a server action — the page.route interception targets the server action
 * POST, which is the actual network call made during attestation submission.
 */

import { expect, test } from "@playwright/test";

// ─── Tests ────────────────────────────────────────────────────────────────────

// Run on Chromium only per task spec (configured via --project=chromium or playwright.config.ts)
test.use({ locale: "cs-CZ" });

test.describe("Money S3 workspace", () => {
  test("page loads with heading, back link, and demo badge", async ({
    page,
  }) => {
    await page.goto("/workspaces/money-s3");

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
    await page.goto("/workspaces/money-s3");

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
    await page.goto("/workspaces/money-s3");

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
    await page.goto("/workspaces/money-s3");

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

  test("attestation form: submit 'yes' answer on Layer 3 backup control, 'Attestation saved' shown after success", async ({
    page,
  }) => {
    // Intercept the test-only JSON API route used when NEXT_PUBLIC_ENABLE_TEST_ROUTES=true.
    // When that env var is set, workspace-renderer.tsx calls /api/test/workspace-attestation
    // instead of the server action — a plain fetch that page.route() can intercept cleanly.
    // We return { assessmentResult: 'pass', controlId: 'test', evidenceId: 'test' } so the
    // client sets submitted=true without needing a live Clerk session or database.
    let actionIntercepted = false;
    await page.route("**/api/test/workspace-attestation", async (route) => {
      actionIntercepted = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          assessmentResult: "pass",
          controlId: "test",
          evidenceId: "test",
        }),
      });
    });

    await page.goto("/workspaces/money-s3");

    await expect(
      page.getByRole("heading", { name: "Money S3 / S4 (Seyfor)" }),
    ).toBeVisible({ timeout: 15_000 });

    // Navigate to Layer 3 (backup)
    await page
      .getByRole("button", { name: "Zálohy a obnova po havárii" })
      .click();

    await expect(
      page.getByRole("heading", { name: "Zálohy a obnova po havárii" }),
    ).toBeVisible();

    // Overall progress is displayed (0% in demo mode)
    const overallProgressbar = page.getByRole("progressbar").first();
    await expect(overallProgressbar).toHaveAttribute("aria-valuenow", "0");

    // Open the second backup control (automated daily backup) — evidenceType: "both"
    // so it shows the attestation form.
    const expandButton = page
      .getByRole("button", { expanded: false })
      .filter({ hasText: /Je záloha databáze Money S3 automatizována/ });

    await expandButton.click();

    // Attestation form is now visible
    await expect(page.getByRole("group", { name: "Your answer" })).toBeVisible();

    // The radio input is sr-only; click its visible label directly.
    // Labels use input[value="yes"] with name matching the control key.
    const yesLabel = page.locator(
      `label:has(input[value="yes"][name="attest-money-s3-backup-automated-daily"])`,
    );
    await yesLabel.click({ force: true });

    // Verify the radio is checked
    await expect(
      page.getByRole("radio", { name: "Yes / Done" }),
    ).toBeChecked();

    // Submit
    await page.getByRole("button", { name: "Save attestation" }).click();

    // "Attestation saved" confirmation is visible
    await expect(
      page.getByText("Attestation saved. Reload to see updated status."),
    ).toBeVisible({ timeout: 10_000 });

    // Verify the server action was actually intercepted (not a no-op)
    expect(actionIntercepted).toBe(true);
  });
});
