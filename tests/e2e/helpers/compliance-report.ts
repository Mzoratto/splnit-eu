import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";

export const expectedComplianceReportFilename =
  "zprava-kyberneticka-bezpecnost-12345678-2026-05-21.pdf";

export const rscActionSuccess = '0:{"a":null,"f":null}\n';

const pdfWithGap = readFileSync("docs/poc-report.pdf");

export async function mockComplianceReportDownload(page: Page) {
  await page.route("**/api/export/compliance-report?**", async (route) => {
    await route.fulfill({
      body: pdfWithGap,
      headers: {
        "content-disposition": `attachment; filename="${expectedComplianceReportFilename}"`,
        "content-type": "application/pdf",
      },
      status: 200,
    });
  });
}
