import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mockComplianceReportDownload } from "./helpers/compliance-report";

test.use({ locale: "cs-CZ" });

test.describe("Compliance report gap export", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Chromium only");

  test("downloaded PDF text contains gap evidence", async ({ page }) => {
    await mockComplianceReportDownload(page);
    await page.goto("/controls");

    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Stáhnout zprávu o shodě (PDF)" })
      .click();
    const download = await downloadPromise;
    const downloadPath = await download.path();

    expect(downloadPath).toBeTruthy();

    const text = execFileSync("pdftotext", [downloadPath ?? "", "-"], {
      encoding: "utf8",
    });

    expect(text).toContain("Nesplněno");
  });
});
