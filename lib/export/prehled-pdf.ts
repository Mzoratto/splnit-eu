import { chromium } from "playwright";
import {
  renderPrehledTemplate,
  type PrehledExportContext,
} from "@/lib/export/prehled-template";

export function getPrehledFilename(versionNumber: number, createdAt: Date): string {
  const isoDate = new Date(createdAt).toISOString().slice(0, 10);

  return `prehled-bezpecnostnich-opatreni-v${versionNumber}-${isoDate}.pdf`;
}

export async function renderPrehledPdf(ctx: PrehledExportContext): Promise<Buffer> {
  const html = renderPrehledTemplate(ctx);
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
