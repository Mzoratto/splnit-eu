import { expect, test } from "@playwright/test";
import {
  expectedComplianceReportFilename,
  mockComplianceReportDownload,
} from "./helpers/compliance-report";

test.use({ locale: "cs-CZ" });

test.describe("Compliance report happy path", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Chromium only");

  test("export downloads PDF with expected filename", async ({ page }) => {
    await mockComplianceReportDownload(page);
    await page.goto("/dashboard");

    const button = page.getByRole("button", {
      name: "Stáhnout zprávu o shodě (PDF)",
    });
    await expect(button).toBeEnabled({ timeout: 15_000 });

    const downloadPromise = page.waitForEvent("download");
    await button.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(expectedComplianceReportFilename);
  });
});
