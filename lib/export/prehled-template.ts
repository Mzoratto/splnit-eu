import { PREHLED_RETENTION_NOTE, REVIEW_DISCLAIMER } from "@/lib/export/constants";
import type { PrehledStatus } from "@/lib/regulations/vbo-n/prehled";
import { VBO_N_CONTROLS, VBO_N_SPEC } from "@/lib/regulations/vbo-n/spec";

export type PrehledSnapshotEntry = {
  baselineId: string;
  status: PrehledStatus;
  implementationNote: string | null;
  plannedDate: string | null;
  priority: string | null;
  responsiblePerson: string | null;
  justification: string | null;
};

export type PrehledExportContext = {
  organisationName: string;
  ico: string | null;
  generatedAt: Date;
  versionNumber: number;
  entries: PrehledSnapshotEntry[];
};

const STATUS_LABELS: Record<PrehledStatus, string> = {
  nezavedeno: "Nezavedeno",
  planovano: "Plánováno",
  zavedeno: "Zavedeno",
};

const PRIORITY_LABELS: Record<string, string> = {
  nizka: "nízká",
  stredni: "střední",
  vysoka: "vysoká",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatCzechDate(value: Date | string): string {
  return new Intl.DateTimeFormat("cs-CZ", { dateStyle: "long" }).format(
    new Date(value),
  );
}

function renderEntryDetails(entry: PrehledSnapshotEntry): string {
  if (entry.status === "zavedeno") {
    return `<p class="detail"><strong>Popis zavedení:</strong> ${escapeHtml(entry.implementationNote ?? "")}</p>`;
  }

  if (entry.status === "planovano") {
    const priority = PRIORITY_LABELS[entry.priority ?? ""] ?? entry.priority ?? "";
    return `<p class="detail"><strong>Termín:</strong> ${escapeHtml(entry.plannedDate ?? "")} · <strong>Priorita:</strong> ${escapeHtml(priority)} · <strong>Odpovědná osoba:</strong> ${escapeHtml(entry.responsiblePerson ?? "")}</p>`;
  }

  // nezavedeno — odůvodnění is mandatory and must be rendered.
  return `<p class="detail"><strong>Odůvodnění:</strong> ${escapeHtml(entry.justification ?? "")}</p>`;
}

export function renderPrehledTemplate(ctx: PrehledExportContext): string {
  const entriesById = new Map(ctx.entries.map((entry) => [entry.baselineId, entry]));

  const tierSections = (["neopominutelné", "vyhodnotitelné"] as const)
    .map((tier) => {
      const tierControls = VBO_N_CONTROLS.filter((control) => control.tier === tier);
      const areas = [...new Set(tierControls.map((control) => control.area))];

      const areaBlocks = areas
        .map((area) => {
          const rows = tierControls
            .filter((control) => control.area === area)
            .map((control) => {
              const entry = entriesById.get(control.id);
              const statusLabel = entry ? STATUS_LABELS[entry.status] : "Nevyplněno";
              const details = entry ? renderEntryDetails(entry) : "";

              return `<div class="control">
                <p class="control-head"><span class="mono">${escapeHtml(control.id)}</span> · ${escapeHtml(control.ref)} · <strong>${statusLabel}</strong></p>
                <p class="control-text">${escapeHtml(control.control)}</p>
                ${details}
              </div>`;
            })
            .join("\n");

          return `<section class="area"><h3>${escapeHtml(area)}</h3>${rows}</section>`;
        })
        .join("\n");

      const tierTitle =
        tier === "neopominutelné"
          ? "Neopominutelná opatření (vždy vyžadována)"
          : "Vyhodnotitelná opatření (posuzovaná)";

      return `<section class="tier"><h2>${tierTitle}</h2>${areaBlocks}</section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8" />
<style>
  body { font-family: "Inter", system-ui, sans-serif; font-size: 11px; color: #0f172a; line-height: 1.5; }
  .mono { font-family: "JetBrains Mono", monospace; }
  header { border-bottom: 2px solid #1e3a6e; padding-bottom: 12px; margin-bottom: 18px; }
  h1 { font-size: 18px; margin: 0; }
  .meta { color: #475569; margin-top: 6px; }
  h2 { font-size: 14px; margin: 22px 0 8px; color: #1e3a6e; }
  h3 { font-size: 12px; margin: 14px 0 6px; }
  .control { border-top: 1px solid #e2e8f0; padding: 7px 0; }
  .control-head { margin: 0; color: #334155; }
  .control-text { margin: 3px 0 0; }
  .detail { margin: 3px 0 0; color: #475569; }
  footer { margin-top: 26px; border-top: 1px solid #e2e8f0; padding-top: 10px; color: #64748b; font-size: 9px; }
</style>
</head>
<body>
<header>
  <h1>Přehled bezpečnostních opatření</h1>
  <p class="meta">vyhláška č. 410/2025 Sb., § 3 odst. 2 — režim nižších povinností</p>
  <p class="meta"><strong>Organizace:</strong> ${escapeHtml(ctx.organisationName)}${ctx.ico ? ` · IČO ${escapeHtml(ctx.ico)}` : ""}</p>
  <p class="meta"><strong>Datum:</strong> ${formatCzechDate(ctx.generatedAt)} · <strong>Verze dokumentu:</strong> ${ctx.versionNumber}</p>
</header>
${tierSections}
<footer>
  <p>${escapeHtml(REVIEW_DISCLAIMER)}</p>
  <p>${escapeHtml(PREHLED_RETENTION_NOTE)} (${escapeHtml(VBO_N_SPEC.meta.legal_basis.join(", "))})</p>
</footer>
</body>
</html>`;
}
