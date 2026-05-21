import type {
  BrandingConfig,
  ObligationRegime,
  OrgTier,
} from "@/lib/db/schema";
import type {
  EvidenceAssessmentResult,
  EvidenceSource,
} from "@/lib/activation/evidence-state";
import type { NukibControlBlock } from "@/lib/workspaces/types";

export interface Org {
  clerkOrgId: string;
  name: string;
  ico: string | null;
  dic: string | null;
  sidlo: string | null;
  rezimPovinnosti: ObligationRegime;
  tier: OrgTier;
  brandingConfig: BrandingConfig;
}

export interface EvidenceRecord {
  assessmentResult: EvidenceAssessmentResult;
  assessedAt?: Date | null;
  attestationText?: string | null;
  collectedAt: Date | null;
  connectorName?: string | null;
  controlId: string;
  controlKey: string;
  controlName: string;
  evidenceId: string;
  finding?: string | null;
  gapDescription?: string | null;
  nukibBlock: NukibControlBlock;
  recommendation?: string | null;
  source: EvidenceSource | "api";
}

export interface ReportContext {
  org: Org;
  evidenceRecords: EvidenceRecord[];
  workspaceNames: string[];
  connectorNames: string[];
  generatedAt: Date;
}

type EvidenceTone = "pass-api" | "pass-manual" | "gap";

const DEFAULT_NUKIB_BLOCK: NukibControlBlock = {
  blockTitle: "§ Organizační bezpečnost",
  sectionTitle: "Řízení rizik",
};

const DEFAULT_LOGO_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="190" height="48" viewBox="0 0 190 48" role="img" aria-label="splnit.eu"><rect width="190" height="48" rx="8" fill="#0f172a"/><circle cx="25" cy="24" r="10" fill="#2dd4bf"/><path d="M20 24.5l3.5 3.5 7-9" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="46" y="30" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="700">splnit.eu</text></svg>`,
)}`;

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatCzechList(items: string[]): string {
  const cleanItems = items.map((item) => item.trim()).filter(Boolean);

  if (cleanItems.length === 0) {
    return "";
  }

  if (cleanItems.length === 1) {
    return cleanItems[0] ?? "";
  }

  return `${cleanItems.slice(0, -1).join(", ")} a ${cleanItems.at(-1)}`;
}

export function generateScopeStatement(
  workspaceNames: string[],
  connectorNames: string[],
): string {
  const workspaces = formatCzechList(workspaceNames);
  const connectors = formatCzechList(connectorNames);

  if (connectors && workspaces) {
    return `Rozsah posouzení zahrnuje primární cloudové prostředí ${connectors} a hlavní účetní/ERP systémy: ${workspaces}.`;
  }

  if (connectors) {
    return `Rozsah posouzení zahrnuje primární cloudové prostředí ${connectors}.`;
  }

  if (workspaces) {
    return `Rozsah posouzení zahrnuje účetní/ERP systémy: ${workspaces}.`;
  }

  return "Rozsah posouzení zahrnuje dostupné důkazy evidované v aplikaci Splnit.eu.";
}

export function getVyhlaskaRef(
  rezim: ObligationRegime,
  sectionName: string,
): string {
  const cislo = rezim === "vyssi" ? "409" : "410";

  return `Zákon č. 264/2025 Sb., o kybernetické bezpečnosti; vyhláška č. ${cislo}/2025 Sb., § ${sectionName}`;
}

function resolveBranding(org: Org) {
  const hasAgencyLogo = org.tier === "agency" && Boolean(org.brandingConfig.logoUrl);
  const displayName = org.brandingConfig.displayName ?? org.name;

  if (hasAgencyLogo && org.brandingConfig.logoUrl) {
    return {
      footerText: org.brandingConfig.footerText ?? "",
      logoHtml: `<img src="${escapeHtml(org.brandingConfig.logoUrl)}" class="org-logo" alt="${escapeHtml(displayName)}" />`,
    };
  }

  return {
    footerText: "Powered by Splnit.eu",
    logoHtml: `<img src="${DEFAULT_LOGO_DATA_URI}" class="splnit-logo" alt="splnit.eu" />`,
  };
}

function formatSource(record: EvidenceRecord): string {
  if (record.source === "connector" || record.source === "api") {
    return `source=api (${record.connectorName ?? "Konektor"})`;
  }

  if (record.source === "manual") {
    return "source=manual (Sebehodnocení uživatele)";
  }

  if (record.source === "intake") {
    return "source=intake (Vstupní dotazník)";
  }

  return "Importovaný záznam";
}

function getEvidenceTone(record: EvidenceRecord): EvidenceTone {
  if (
    record.assessmentResult === "pass" &&
    (record.source === "connector" || record.source === "api")
  ) {
    return "pass-api";
  }

  if (record.assessmentResult === "pass" && record.source === "manual") {
    return "pass-manual";
  }

  return "gap";
}

function evidenceDate(record: EvidenceRecord): Date {
  return record.assessedAt ?? record.collectedAt ?? new Date(0);
}

function renderDefinitionRow(label: string, value: string): string {
  return `<dt>${escapeHtml(label)}</dt><dd>${value}</dd>`;
}

function renderEvidenceBlock(record: EvidenceRecord, org: Org): string {
  const tone = getEvidenceTone(record);
  const date = evidenceDate(record);
  const legalRef = getVyhlaskaRef(
    org.rezimPovinnosti,
    record.nukibBlock.sectionTitle || DEFAULT_NUKIB_BLOCK.sectionTitle,
  );
  const source = formatSource(record);
  const recommendation =
    record.recommendation ??
    "Doplňte chybějící důkaz a ověřte splnění opatření odpovědnou osobou.";

  if (tone === "pass-api") {
    const finding = record.finding ?? "Automatická kontrola potvrdila splnění opatření.";

    return `
      <div class="evidence-block evidence-pass-api">
        <div class="block-header">
          <span class="icon">✓</span>
          <span class="label">Splněno – Automaticky ověřeno</span>
        </div>
        <dl>
          ${renderDefinitionRow("Opatření", escapeHtml(record.controlName))}
          ${renderDefinitionRow("Zdroj", escapeHtml(source))}
          ${renderDefinitionRow("Stav", `Ověřeno dne ${escapeHtml(formatDate(date))} v ${escapeHtml(formatTime(date))} CEST. ${escapeHtml(finding)}`)}
          ${renderDefinitionRow("Právní ref.", escapeHtml(legalRef))}
        </dl>
      </div>`;
  }

  if (tone === "pass-manual") {
    const attestation =
      record.attestationText ?? "Organizace deklarovala splnění opatření formou sebehodnocení.";

    return `
      <div class="evidence-block evidence-pass-manual">
        <div class="block-header">
          <span class="icon">☐</span>
          <span class="label">Deklarováno – Manuální čestné prohlášení</span>
        </div>
        <dl>
          ${renderDefinitionRow("Opatření", escapeHtml(record.controlName))}
          ${renderDefinitionRow("Zdroj", escapeHtml(source))}
          ${renderDefinitionRow("Stav", `Deklarováno zástupcem společnosti dne ${escapeHtml(formatDate(date))}. ${escapeHtml(attestation)}`)}
          ${renderDefinitionRow("Právní ref.", escapeHtml(legalRef))}
        </dl>
      </div>`;
  }

  const gapDescription =
    record.gapDescription ?? record.finding ?? "Opatření není podle dostupných důkazů splněno.";

  return `
    <div class="evidence-block evidence-gap">
      <div class="block-header">
        <span class="icon">!</span>
        <span class="label">Nesplněno – Identifikovaná mezera</span>
      </div>
      <dl>
        ${renderDefinitionRow("Opatření", escapeHtml(record.controlName))}
        ${renderDefinitionRow("Zdroj", escapeHtml(source))}
        ${renderDefinitionRow("Stav", escapeHtml(gapDescription))}
        ${renderDefinitionRow("Doporučení", escapeHtml(recommendation))}
        ${renderDefinitionRow("Právní ref.", escapeHtml(legalRef))}
      </dl>
    </div>`;
}

function groupEvidence(records: EvidenceRecord[]) {
  const groups = new Map<
    string,
    {
      blockTitle: string;
      sections: Map<string, EvidenceRecord[]>;
    }
  >();

  for (const record of records) {
    // TODO: Replace this fallback once connector-only controls carry explicit NÚKIB grouping metadata.
    const block = record.nukibBlock ?? DEFAULT_NUKIB_BLOCK;
    const blockTitle = block.blockTitle || DEFAULT_NUKIB_BLOCK.blockTitle;
    const sectionTitle = block.sectionTitle || DEFAULT_NUKIB_BLOCK.sectionTitle;
    const group =
      groups.get(blockTitle) ??
      {
        blockTitle,
        sections: new Map<string, EvidenceRecord[]>(),
      };
    const section = group.sections.get(sectionTitle) ?? [];

    section.push(record);
    group.sections.set(sectionTitle, section);
    groups.set(blockTitle, group);
  }

  return Array.from(groups.values());
}

function renderEvidenceSections(ctx: ReportContext): string {
  const groups = groupEvidence(ctx.evidenceRecords);

  if (groups.length === 0) {
    return `
      <h2>Podrobné posouzení bezpečnostních opatření</h2>
      <p class="muted">K datu vygenerování nejsou evidovány žádné důkazy k posouzení.</p>`;
  }

  return groups
    .map((group, index) => {
      const sections = Array.from(group.sections.entries())
        .map(
          ([sectionTitle, records]) => `
            <h3>${escapeHtml(sectionTitle)}</h3>
            ${records.map((record) => renderEvidenceBlock(record, ctx.org)).join("")}`,
        )
        .join("");

      return `
        <h2${index === 0 ? ' class="detail-heading"' : ""}>${escapeHtml(group.blockTitle)}</h2>
        ${sections}`;
    })
    .join("");
}

function renderStyles(): string {
  return `
    <style>
      @page {
        size: A4;
        margin: 20mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        color: #111827;
        font-family: 'Noto Sans', Arial, sans-serif;
        font-size: 10pt;
        line-height: 1.5;
        margin: 0;
      }

      h1 {
        color: #0f172a;
        font-size: 24pt;
        line-height: 1.18;
        margin: 36mm 0 12mm;
      }

      h2 {
        color: #0f172a;
        font-size: 17pt;
        line-height: 1.25;
        margin: 0 0 10mm;
        page-break-before: always;
      }

      h3 {
        color: #1f2937;
        font-size: 13pt;
        margin: 0 0 6mm;
      }

      p {
        margin: 0;
      }

      .cover {
        min-height: 245mm;
        position: relative;
      }

      .logo-row {
        align-items: center;
        display: flex;
        justify-content: flex-start;
        min-height: 18mm;
      }

      .splnit-logo,
      .org-logo {
        max-height: 18mm;
        max-width: 58mm;
        object-fit: contain;
      }

      .subtitle {
        color: #475569;
        font-size: 12pt;
        margin-bottom: 12mm;
      }

      .identity-grid {
        border-top: 1px solid #d1d5db;
        display: grid;
        gap: 4mm 8mm;
        grid-template-columns: 40mm 1fr;
        margin-top: 10mm;
        padding-top: 8mm;
      }

      .identity-grid dt,
      .summary-table th {
        color: #374151;
        font-weight: 700;
      }

      .identity-grid dd {
        margin: 0;
      }

      .scope {
        background: #f8fafc;
        border-left: 4px solid #0f766e;
        margin-top: 12mm;
        padding: 5mm;
      }

      .footer {
        bottom: 0;
        color: #64748b;
        font-size: 9pt;
        position: absolute;
      }

      .summary-table {
        border-collapse: collapse;
        width: 100%;
      }

      .summary-table th,
      .summary-table td {
        border-bottom: 1px solid #e5e7eb;
        padding: 5mm 3mm;
        text-align: left;
      }

      .summary-table td {
        color: #0f172a;
        font-size: 16pt;
        font-weight: 700;
        text-align: right;
      }

      .evidence-block {
        border-left: 4px solid;
        font-family: 'Noto Sans', Arial, sans-serif;
        font-size: 10pt;
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
        font-weight: bold;
        gap: 8px;
        margin-bottom: 8px;
      }

      .evidence-pass-api .icon {
        color: #1a5c3a;
      }

      .evidence-pass-manual .icon {
        color: #6b7280;
      }

      .evidence-gap .icon {
        color: #b45309;
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

      .muted {
        color: #64748b;
      }

      @media print {
        .evidence-block {
          page-break-inside: avoid;
        }

        h2:first-of-type {
          page-break-before: always;
        }
      }
    </style>`;
}

export function renderReportTemplate(ctx: ReportContext): string {
  const total = ctx.evidenceRecords.length;
  const passed = ctx.evidenceRecords.filter((record) => record.assessmentResult === "pass").length;
  const gaps = ctx.evidenceRecords.filter((record) => record.assessmentResult === "gap").length;
  const compliancePct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const rezimLabel =
    ctx.org.rezimPovinnosti === "vyssi"
      ? "Vyšší povinnosti (vyhláška č. 409/2025 Sb.)"
      : "Nižší povinnosti (vyhláška č. 410/2025 Sb.)";
  const branding = resolveBranding(ctx.org);
  const footer = branding.footerText
    ? `<p class="footer">${escapeHtml(branding.footerText)}</p>`
    : "";

  return `<!doctype html>
    <html lang="cs">
      <head>
        <meta charset="utf-8" />
        <title>Zpráva o hodnocení stavu kybernetické bezpečnosti (NIS2 / ZoKB)</title>
        ${renderStyles()}
      </head>
      <body>
        <section class="cover">
          <div class="logo-row">${branding.logoHtml}</div>
          <h1>Zpráva o hodnocení stavu kybernetické bezpečnosti (NIS2 / ZoKB)</h1>
          <p class="subtitle">Zákon č. 264/2025 Sb., o kybernetické bezpečnosti</p>

          <dl class="identity-grid">
            ${renderDefinitionRow("Název společnosti", escapeHtml(ctx.org.name))}
            ${renderDefinitionRow("IČO", escapeHtml(ctx.org.ico ?? "Neuvedeno"))}
            ${renderDefinitionRow("DIČ", escapeHtml(ctx.org.dic ?? "Neuvedeno"))}
            ${renderDefinitionRow("Sídlo", escapeHtml(ctx.org.sidlo ?? "Neuvedeno"))}
            ${renderDefinitionRow("Datum vygenerování", escapeHtml(formatDate(ctx.generatedAt)))}
            ${renderDefinitionRow("Verze dokumentu", escapeHtml(`v${ctx.generatedAt.getFullYear()}.1`))}
            ${renderDefinitionRow("Režim povinností", escapeHtml(rezimLabel))}
          </dl>

          <p class="scope">${escapeHtml(generateScopeStatement(ctx.workspaceNames, ctx.connectorNames))}</p>
          ${footer}
        </section>

        <h2>Manažerské shrnutí</h2>
        <table class="summary-table">
          <tbody>
            <tr>
              <th>Celková shoda</th>
              <td>${escapeHtml(compliancePct)} %</td>
            </tr>
            <tr>
              <th>Počet splněných opatření</th>
              <td>${escapeHtml(passed)}</td>
            </tr>
            <tr>
              <th>Počet kritických mezer</th>
              <td>${escapeHtml(gaps)}</td>
            </tr>
          </tbody>
        </table>

        ${renderEvidenceSections(ctx)}
      </body>
    </html>`;
}
