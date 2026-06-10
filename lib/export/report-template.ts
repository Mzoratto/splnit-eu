import type {
  BrandingConfig,
  ObligationRegime,
  OrgTier,
} from "@/lib/db/schema";
import type {
  EvidenceAssessmentResult,
  EvidenceSource,
} from "@/lib/activation/evidence-state";
import type {
  FrameworkMapping,
  NukibControlTier,
} from "@/lib/compliance/nukib/types";
import type { AgencyBrandingContext } from "@/lib/pdf/agency-branding";
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
  frameworkMappings?: FrameworkMapping[];
  finding?: string | null;
  gapDescription?: string | null;
  legacyNis2ArticleRef?: string | null;
  legacyZobkSectionRef?: string | null;
  nukibBlock: NukibControlBlock;
  nukibTier?: NukibControlTier;
  recommendation?: string | null;
  source: EvidenceSource | "api";
}

export interface ReportContext {
  agencyBranding?: AgencyBrandingContext | null;
  org: Org;
  evidenceRecords: EvidenceRecord[];
  workspaceNames: string[];
  connectorNames: string[];
  generatedAt: Date;
}

type EvidenceTone = "pass" | "in-progress" | "gap";

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
  sectionReference?: string | null,
): string {
  const cislo = rezim === "vyssi" ? "409" : "410";
  const normalizedSection = normalizeVyhlaskaSectionRef(sectionReference);
  const base = `Zákon č. 264/2025 Sb., o kybernetické bezpečnosti; vyhláška č. ${cislo}/2025 Sb.`;

  return normalizedSection ? `${base}, ${normalizedSection}` : base;
}

function getVyhlaskaNumber(rezim: ObligationRegime): "409" | "410" {
  return rezim === "vyssi" ? "409" : "410";
}

function normalizeVyhlaskaSectionRef(reference: string | null | undefined): string | null {
  const trimmed = reference?.trim();

  if (!trimmed) {
    return null;
  }

  const sectionRef = trimmed.startsWith("§") ? trimmed : `§ ${trimmed}`;

  return /^§\s*\d+[a-zA-Z]?(?:\b|[\s().,;:–-])/.test(sectionRef)
    ? sectionRef
    : null;
}

function formatFrameworkMapping(mapping: FrameworkMapping): string {
  return mapping.title
    ? `${mapping.reference} — ${mapping.title}`
    : mapping.reference;
}

function formatZokbMapping(mapping: FrameworkMapping, org: Org): string {
  const primary = `vyhláška č. ${getVyhlaskaNumber(org.rezimPovinnosti)}/2025 Sb.`;
  const sectionRef = normalizeVyhlaskaSectionRef(mapping.reference);

  if (!sectionRef) {
    return primary;
  }

  return mapping.title
    ? `${primary}, ${sectionRef} — ${mapping.title}`
    : `${primary}, ${sectionRef}`;
}

function formatLegalReference(record: EvidenceRecord, org: Org): string {
  const mappings = record.frameworkMappings ?? [];
  const zokbMappings = mappings.filter((mapping) => mapping.frameworkId === "zokb");
  const nis2Mappings = mappings.filter((mapping) => mapping.frameworkId === "nis2");
  const legacyNis2 = record.legacyNis2ArticleRef?.trim();
  const legacyZokb = record.legacyZobkSectionRef?.trim();
  const nis2References = [
    ...nis2Mappings.map(formatFrameworkMapping),
    legacyNis2,
  ].filter((reference): reference is string => Boolean(reference));

  if (zokbMappings.length > 0) {
    const primary = Array.from(
      new Set(zokbMappings.map((mapping) => formatZokbMapping(mapping, org))),
    ).join("; ");
    const secondary = nis2References.length > 0
      ? ` (${Array.from(new Set(nis2References)).join("; ")})`
      : "";

    return `${primary}${secondary}`;
  }

  if (legacyZokb) {
    const primary = getVyhlaskaRef(org.rezimPovinnosti, legacyZokb);
    return legacyNis2 ? `${primary} (${legacyNis2})` : primary;
  }

  if (legacyNis2) {
    return legacyNis2;
  }

  return getVyhlaskaRef(
    org.rezimPovinnosti,
    record.nukibBlock.sectionTitle || DEFAULT_NUKIB_BLOCK.sectionTitle,
  );
}

function resolveBranding(ctx: ReportContext) {
  const agencyBranding = ctx.agencyBranding;

  if (agencyBranding) {
    const displayName = agencyBranding.displayName;

    return {
      footerClassName: "footer agency-footer",
      footerText: agencyBranding.poweredByText,
      isAgency: true,
      logoHtml: agencyBranding.logoUrl
        ? `<img src="${escapeHtml(agencyBranding.logoUrl)}" class="org-logo" alt="${escapeHtml(agencyBranding.logoAltText ?? displayName)}" />`
        : `<div class="agency-wordmark">${escapeHtml(displayName)}</div>`,
      primaryColour: agencyBranding.primaryColour ?? "#0f766e",
    };
  }

  const org = ctx.org;
  const hasAgencyLogo = org.tier === "agency" && Boolean(org.brandingConfig.logoUrl);
  const displayName = org.brandingConfig.displayName ?? org.name;

  if (hasAgencyLogo && org.brandingConfig.logoUrl) {
    return {
      footerClassName: "footer",
      footerText: org.brandingConfig.footerText ?? "",
      isAgency: false,
      logoHtml: `<img src="${escapeHtml(org.brandingConfig.logoUrl)}" class="org-logo" alt="${escapeHtml(displayName)}" />`,
      primaryColour: "#0f766e",
    };
  }

  return {
    footerClassName: "footer",
    footerText: "Powered by Splnit.eu",
    isAgency: false,
    logoHtml: `<img src="${DEFAULT_LOGO_DATA_URI}" class="splnit-logo" alt="splnit.eu" />`,
    primaryColour: "#0f766e",
  };
}

function formatSource(record: EvidenceRecord): string {
  if (record.source === "connector" || record.source === "api") {
    return `API/konektor: ${record.connectorName ?? "nezadaný konektor"}`;
  }

  if (record.source === "manual") {
    return "Manuální podklad";
  }

  if (record.source === "intake") {
    return "Vstupní dotazník";
  }

  return "Importovaný záznam";
}

function getEvidenceTone(record: EvidenceRecord): EvidenceTone {
  if (record.assessmentResult === "pass") {
    return "pass";
  }

  if (
    record.assessmentResult === "gap" ||
    (record.assessmentResult as string) === "fail"
  ) {
    return "gap";
  }

  return "in-progress";
}

function evidenceDate(record: EvidenceRecord): Date {
  return record.assessedAt ?? record.collectedAt ?? new Date(0);
}

function renderDefinitionRow(label: string, value: string): string {
  return `<dt>${escapeHtml(label)}</dt><dd>${value}</dd>`;
}

function formatProgressDescription(record: EvidenceRecord): string {
  if (record.assessmentResult === "manual_review") {
    return "Hodnocení probíhá; záznam vyžaduje ruční posouzení.";
  }

  if (record.assessmentResult === "warning") {
    return "Hodnocení probíhá; záznam vyžaduje doplňující kontrolu.";
  }

  if (record.assessmentResult === "not_applicable") {
    return "Opatření bylo označeno jako mimo aktuální rozsah.";
  }

  return "Hodnocení probíhá; výsledek zatím nebyl určen.";
}

function renderEvidenceBlock(
  record: EvidenceRecord,
  org: Org,
  generatedAt: Date,
): string {
  const tone = getEvidenceTone(record);
  const date = evidenceDate(record);
  const legalRef = formatLegalReference(record, org);
  const source = formatSource(record);
  const recommendation =
    record.recommendation ??
    "Doplňte chybějící důkaz a ověřte splnění opatření odpovědnou osobou.";

  if (tone === "pass") {
    const isManual = record.source === "manual";
    const evidenceClass = isManual ? "evidence-pass-manual" : "evidence-pass-api";
    const label = isManual
      ? "Doloženo - manuálně posouzený podklad"
      : "Doloženo - automaticky získaný podklad";
    const finding = record.finding ?? "Stav je doložen dostupnými podklady.";
    const status =
      `Stav k datu generování (${formatDate(generatedAt)}) podle podkladů evidovaných dne ${formatDate(date)}. ${finding}`;

    if (isManual) {
      const attestation =
        record.attestationText ?? "Organizace doložila stav opatření manuálně evidovaným podkladem.";

      return `
        <div class="evidence-block ${evidenceClass}">
          <div class="block-header">
            <span class="icon">☐</span>
            <span class="label">${escapeHtml(label)}</span>
          </div>
          <dl>
            ${renderDefinitionRow("Opatření", escapeHtml(record.controlName))}
            ${renderDefinitionRow("Zdroj", escapeHtml(source))}
            ${renderDefinitionRow("Stav", escapeHtml(`${status} ${attestation}`))}
            ${renderDefinitionRow("Právní ref.", escapeHtml(legalRef))}
          </dl>
        </div>`;
    }

    return `
      <div class="evidence-block ${evidenceClass}">
        <div class="block-header">
          <span class="icon">✓</span>
          <span class="label">${escapeHtml(label)}</span>
        </div>
        <dl>
          ${renderDefinitionRow("Opatření", escapeHtml(record.controlName))}
          ${renderDefinitionRow("Zdroj", escapeHtml(source))}
          ${renderDefinitionRow("Stav", escapeHtml(status))}
          ${renderDefinitionRow("Právní ref.", escapeHtml(legalRef))}
        </dl>
      </div>`;
  }

  if (tone === "in-progress") {
    const progressDescription = record.finding ?? formatProgressDescription(record);

    return `
      <div class="evidence-block evidence-in-progress">
        <div class="block-header">
          <span class="icon">i</span>
          <span class="label">Vyžaduje posouzení - hodnocení probíhá</span>
        </div>
        <dl>
          ${renderDefinitionRow("Opatření", escapeHtml(record.controlName))}
          ${renderDefinitionRow("Zdroj", escapeHtml(source))}
          ${renderDefinitionRow("Stav", `Stav k datu generování (${escapeHtml(formatDate(generatedAt))}) vyžaduje posouzení. ${escapeHtml(progressDescription)} Podklad byl evidován dne ${escapeHtml(formatDate(date))}.`)}
          ${renderDefinitionRow("Právní ref.", escapeHtml(legalRef))}
        </dl>
      </div>`;
  }

  const gapDescription =
    record.gapDescription ??
    record.finding ??
    "Dostupné podklady ukazují na mezeru vůči zaznamenanému opatření.";
  const gapLabel = "Identifikovaná mezera";

  return `
    <div class="evidence-block evidence-gap">
      <div class="block-header">
        <span class="icon">!</span>
        <span class="label">${escapeHtml(gapLabel)}</span>
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
            ${records.map((record) => renderEvidenceBlock(record, ctx.org, ctx.generatedAt)).join("")}`,
        )
        .join("");

      return `
        <h2${index === 0 ? ' class="detail-heading"' : ""}>${escapeHtml(group.blockTitle)}</h2>
        ${sections}`;
    })
    .join("");
}

function renderStyles(primaryColour = "#0f766e"): string {
  const safePrimaryColour = /^#[0-9a-f]{6}$/i.test(primaryColour)
    ? primaryColour
    : "#0f766e";

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

      .agency-wordmark {
        color: #0f172a;
        font-size: 18pt;
        font-weight: 700;
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
        border-left: 4px solid ${safePrimaryColour};
        margin-top: 12mm;
        padding: 5mm;
      }

      .footer {
        bottom: 0;
        color: #64748b;
        font-size: 9pt;
        position: absolute;
      }

      .agency-footer {
        font-size: 8pt;
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

      .evidence-in-progress {
        background: #f8fafc;
        border-color: #64748b;
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

      .evidence-in-progress .icon {
        color: #64748b;
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
  const tones = ctx.evidenceRecords.map(getEvidenceTone);
  const passed = tones.filter((tone) => tone === "pass").length;
  const gaps = tones.filter((tone) => tone === "gap").length;
  const inProgress = tones.filter((tone) => tone === "in-progress").length;
  const evidencePosture = total > 0
    ? `${Math.round((passed / total) * 100)} % doloženo`
    : "dosud nehodnoceno";
  const vyhlaskaNumber = getVyhlaskaNumber(ctx.org.rezimPovinnosti);
  const rezimLabel =
    ctx.org.rezimPovinnosti === "vyssi"
      ? "Vyšší povinnosti (vyhláška č. 409/2025 Sb.)"
      : "Nižší povinnosti (vyhláška č. 410/2025 Sb.)";
  const branding = resolveBranding(ctx);
  const footer = branding.footerText
    ? `<p class="${branding.footerClassName}">${escapeHtml(branding.footerText)}</p>`
    : "";

  return `<!doctype html>
    <html lang="cs">
      <head>
        <meta charset="utf-8" />
        <title>Zpráva o hodnocení stavu kybernetické bezpečnosti (NIS2 / ZoKB)</title>
        ${renderStyles(branding.primaryColour)}
      </head>
      <body>
        <section class="cover">
          <div class="logo-row">${branding.logoHtml}</div>
          <h1>Zpráva o hodnocení stavu kybernetické bezpečnosti (NIS2 / ZoKB)</h1>
          <p class="subtitle">Přehled bezpečnostních opatření dle vyhlášky č. ${vyhlaskaNumber}/2025 Sb.</p>

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
              <th>Stav doložených opatření</th>
              <td>${escapeHtml(evidencePosture)}</td>
            </tr>
            <tr>
              <th>Počet doložených opatření</th>
              <td>${escapeHtml(passed)}</td>
            </tr>
            <tr>
              <th>Počet opatření k posouzení</th>
              <td>${escapeHtml(inProgress)}</td>
            </tr>
            <tr>
              <th>Počet identifikovaných mezer</th>
              <td>${escapeHtml(gaps)}</td>
            </tr>
          </tbody>
        </table>

        ${renderEvidenceSections(ctx)}
      </body>
    </html>`;
}
