import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";
const html = `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <title>Zpráva o hodnocení stavu kybernetické bezpečnosti</title>
    <style>
      body {
        color: #111827;
        font-family: Arial, sans-serif;
        font-size: 10pt;
        line-height: 1.5;
      }

      h1 {
        font-size: 20pt;
        margin: 0 0 18px;
      }

      .evidence-block {
        border-left: 4px solid;
        margin-bottom: 12px;
        padding: 12px 16px;
      }

      .evidence-pass-api {
        background: #f0faf4;
        border-color: #1a5c3a;
      }

      .evidence-pass-manual {
        background: #f9fafb;
        border-color: #6b7280;
      }

      .evidence-gap {
        background: #fffbeb;
        border-color: #b45309;
      }

      .block-header {
        align-items: center;
        display: flex;
        font-weight: 700;
        gap: 8px;
        margin-bottom: 8px;
      }

      dl {
        display: grid;
        gap: 4px 12px;
        grid-template-columns: 120px 1fr;
        margin: 0;
      }

      dt {
        color: #374151;
        font-weight: 600;
      }

      dd {
        color: #1f2937;
        margin: 0;
      }

      .page-break {
        page-break-before: always;
      }
    </style>
  </head>
  <body>
    <h1>Zpráva o hodnocení stavu kybernetické bezpečnosti</h1>
    <p>Test českých znaků: ě, š, č, ř, ž, ý, á, í, é, ů, ú.</p>

    <div class="evidence-block evidence-pass-api">
      <div class="block-header">
        <span>✓</span>
        <span>Splněno – Automaticky ověřeno</span>
      </div>
      <dl>
        <dt>Opatření</dt><dd>Správa přístupových oprávnění</dd>
        <dt>Zdroj</dt><dd>source=api (Microsoft 365)</dd>
        <dt>Stav</dt><dd>Ověřeno dne 21.05.2026 v 10:30 CEST. Zjištěno 100% vynucení MFA u všech 4 admin účtů.</dd>
        <dt>Právní ref.</dt><dd>Vyhláška č. 410/2025 Sb., § Správa přístupových oprávnění</dd>
      </dl>
    </div>

    <div class="evidence-block evidence-pass-manual">
      <div class="block-header">
        <span>☐</span>
        <span>Deklarováno – Manuální čestné prohlášení</span>
      </div>
      <dl>
        <dt>Opatření</dt><dd>Řízení rizik</dd>
        <dt>Zdroj</dt><dd>source=manual (Sebehodnocení uživatele)</dd>
        <dt>Stav</dt><dd>Deklarováno zástupcem společnosti dne 21.05.2026. Organizace má schválený postup pro posouzení rizik.</dd>
        <dt>Právní ref.</dt><dd>Vyhláška č. 410/2025 Sb., § Řízení rizik</dd>
      </dl>
    </div>

    <div class="page-break"></div>

    <div class="evidence-block evidence-gap">
      <div class="block-header">
        <span>!</span>
        <span>Nesplněno – Identifikovaná mezera</span>
      </div>
      <dl>
        <dt>Opatření</dt><dd>Zajištění úrovně dostupnosti</dd>
        <dt>Zdroj</dt><dd>source=manual (Sebehodnocení uživatele)</dd>
        <dt>Stav</dt><dd>Chybí doložený test obnovy ze zálohy za posledních 12 měsíců.</dd>
        <dt>Doporučení</dt><dd>Proveďte dokumentovaný test obnovy a uložte protokol jako důkaz.</dd>
        <dt>Právní ref.</dt><dd>Vyhláška č. 410/2025 Sb., § Zajištění úrovně dostupnosti</dd>
      </dl>
    </div>
  </body>
</html>`;

async function main(): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
    printBackground: true,
  });
  await browser.close();

  await writeFile("docs/poc-report.pdf", pdf);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
