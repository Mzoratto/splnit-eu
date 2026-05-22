import { chromium } from "playwright";
import { getOrgWithEvidence } from "@/lib/db/queries/export";
import {
  renderReportTemplate,
  type ReportContext,
} from "@/lib/export/report-template";
import { resolveAgencyBranding } from "@/lib/pdf/agency-branding";

export function getComplianceReportFilename(ico: string, date = new Date()): string {
  const isoDate = date.toISOString().slice(0, 10);
  const safeIco = ico.replaceAll(/[^0-9]/g, "");

  return `zprava-kyberneticka-bezpecnost-${safeIco}-${isoDate}.pdf`;
}

export async function renderComplianceReportPdf(ctx: ReportContext): Promise<Buffer> {
  const html = renderReportTemplate(ctx);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
      printBackground: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function generateComplianceReport(orgId: string): Promise<Buffer> {
  const [ctx, agencyBranding] = await Promise.all([
    getOrgWithEvidence(orgId),
    resolveAgencyBranding(orgId),
  ]);

  return renderComplianceReportPdf({
    ...ctx,
    agencyBranding,
  });
}
