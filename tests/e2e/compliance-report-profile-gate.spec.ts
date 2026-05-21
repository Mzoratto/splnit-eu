import { expect, test } from "@playwright/test";
import {
  expectedComplianceReportFilename,
  mockComplianceReportDownload,
  rscActionSuccess,
} from "./helpers/compliance-report";

test.use({ locale: "cs-CZ" });

test.describe("Compliance report profile gate", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Chromium only");

  test("incomplete profile links to profile and enables export after DIČ save", async ({
    page,
  }) => {
    await mockComplianceReportDownload(page);
    await page.goto("/dashboard?exportProfile=incomplete");

    const button = page.getByRole("button", {
      name: "Stáhnout zprávu o shodě (PDF)",
    });
    await expect(button).toBeDisabled({ timeout: 15_000 });
    await expect(page.getByText("Před exportem vyplňte: DIČ.")).toBeVisible();

    await page.getByRole("link", { name: "Upravit profil společnosti" }).click();
    await expect(page).toHaveURL(
      /\/settings\/organisation\?testProfile=editable-incomplete/,
    );

    await page.route("**/settings/organisation?**", async (route, request) => {
      if (request.method() === "POST" && request.headers()["next-action"]) {
        await route.fulfill({
          body: rscActionSuccess,
          headers: {
            "content-type": "text/x-component",
            "x-action-revalidated": "[[],0,0]",
          },
          status: 200,
        });
        return;
      }

      await route.continue();
    });

    await page.getByLabel("DIČ").fill("CZ12345678");
    await page.getByRole("button", { name: /Uložit změny/ }).click();
    await page.goto("/dashboard");

    const enabledButton = page.getByRole("button", {
      name: "Stáhnout zprávu o shodě (PDF)",
    });
    await expect(enabledButton).toBeEnabled({ timeout: 15_000 });

    const downloadPromise = page.waitForEvent("download");
    await enabledButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(expectedComplianceReportFilename);
  });
});
