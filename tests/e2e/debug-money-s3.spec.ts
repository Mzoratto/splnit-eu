import { test, expect } from "@playwright/test";
import { checkRadio, gotoWithRetry } from "./helpers";

test("debug intercept", async ({ page }) => {
  const interceptedUrls: string[] = [];

  await page.route('**/*', async (route, request) => {
    if (request.method() === 'POST') {
      interceptedUrls.push(`POST ${request.url()}`);
    }
    if (
      request.method() === "POST" &&
      request.url().includes("/api/test/workspace-attestation")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          assessmentResult: "pass",
          controlId: "test",
          evidenceId: "test",
        }),
      });
      return;
    }
    await route.continue();
  });

  await gotoWithRetry(page, "/workspaces/money-s3");

  await expect(
    page.getByRole("heading", { name: "Money S3 / S4 (Seyfor)" }),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Zálohy a obnova po havárii" }).click();

  const expandButton = page
    .getByRole("button", { expanded: false })
    .filter({ hasText: /Je záloha databáze Money S3 automatizována/ });
  await expandButton.click();

  const yesRadio = page.getByRole("radio", { name: "Ano / hotovo" });
  await checkRadio(yesRadio);
  await expect(yesRadio).toBeChecked();

  await page.getByRole("button", { name: "Uložit prohlášení" }).click();

  await page.waitForTimeout(5000);

  console.log("POST URLs intercepted:", JSON.stringify(interceptedUrls));
  expect(interceptedUrls.length).toBeGreaterThan(0);
});
