"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type TrustCenterPreviewPanelProps = {
  organisationName: string;
  publicUrl: string | null;
  liveStats: {
    accessRequests: number;
    evidenceCount: number;
    lastUpdatedLabel: string;
    passedControls: number;
    publishLabel: string;
    totalControls: number;
    visibleFrameworks: number;
  };
};

const previewSections = [
  {
    title: "Přehled rámců",
    preview: "NIS2 · GDPR · ISO 27001",
    unlock: "Potvrďte automaticky určené rámce v onboarding wizardu.",
  },
  {
    title: "Ověřené oblasti",
    preview: "Identity · Zálohy · Dodavatelé · Incidenty",
    unlock: "Splňte první kontrolu a tato sekce se zveřejní.",
  },
  {
    title: "Dokumenty pro zákazníky",
    preview: "Bezpečnostní přehled · DPA · Vendor response pack",
    unlock: "Nahrajte nebo vygenerujte první sdílitelný důkaz.",
  },
];

export function TrustCenterPreviewPanel({
  organisationName,
  publicUrl,
  liveStats,
}: TrustCenterPreviewPanelProps) {
  const [view, setView] = useState<"preview" | "live">("preview");
  const isPreview = view === "preview";
  const liveSections = [
    {
      detail: `${liveStats.totalControls} relevantních kontrol celkem`,
      label: "Splněné kontroly",
      value: String(liveStats.passedControls),
    },
    {
      detail: "nahrané nebo automaticky sesbírané důkazy",
      label: "Důkazy",
      value: String(liveStats.evidenceCount),
    },
    {
      detail: "čekající nebo zpracované žádosti",
      label: "Přístupy",
      value: String(liveStats.accessRequests),
    },
    {
      detail: liveStats.publishLabel,
      label: "Poslední aktualizace",
      value: liveStats.lastUpdatedLabel,
    },
  ];

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Trust Center preview
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal">
            Ukažte cíl ještě před první splněnou kontrolou
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/64">
            Nový uživatel nevidí prázdnou stránku. Vidí tvar budoucího Trust Centeru,
            zamčené sekce a přesnou akci, která každou sekci odemkne.
          </p>
        </div>
        <div
          aria-label="Přepnout Trust Center zobrazení"
          className="inline-flex rounded-full border border-border bg-background p-1 text-sm font-medium"
          role="tablist"
        >
          <button
            aria-selected={isPreview}
            role="tab"
            type="button"
            onClick={() => setView("preview")}
            className={`rounded-full px-4 py-2 transition ${
              isPreview ? "bg-primary text-primary-foreground" : "text-foreground/62 hover:text-foreground"
            }`}
          >
            Náhled
          </button>
          <button
            aria-selected={!isPreview}
            role="tab"
            type="button"
            onClick={() => setView("live")}
            className={`rounded-full px-4 py-2 transition ${
              !isPreview ? "bg-primary text-primary-foreground" : "text-foreground/62 hover:text-foreground"
            }`}
          >
            Živý stav
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[var(--r-lg)] border border-border bg-background">
        <div className="border-b border-border bg-surface-muted/50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/48">
                splnit.eu/trust/{publicUrl ? publicUrl.split("/").pop() : "vase-firma"}
              </p>
              <h3 className="mt-1 text-xl font-semibold">{organisationName} Trust Center</h3>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isPreview
                  ? "bg-warning/10 text-warning"
                  : "bg-status-pass/10 text-status-pass"
              }`}
            >
              {isPreview ? <Eye className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              {isPreview ? "Preview před publikací" : liveStats.publishLabel}
            </span>
          </div>
        </div>

        {isPreview ? (
          <div className="grid gap-4 p-5 lg:grid-cols-3" role="tabpanel">
            {previewSections.map((section) => (
              <article
                key={section.title}
                className="relative min-h-52 overflow-hidden rounded-lg border border-dashed border-border bg-surface p-4"
              >
                <div className="pointer-events-none select-none blur-[1px]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/38">
                    {section.title}
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-foreground/10" />
                  <div className="mt-2 h-2 w-2/3 rounded-full bg-foreground/10" />
                  <p className="mt-5 text-sm font-medium text-foreground/44">{section.preview}</p>
                </div>
                <div className="absolute inset-x-4 bottom-4 rounded-lg border border-warning/30 bg-background/92 p-3 shadow-sm backdrop-blur">
                  <div className="flex items-start gap-2">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                    <p className="text-xs leading-5 text-foreground/72">{section.unlock}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-5" role="tabpanel">
            <div className="grid gap-4 lg:grid-cols-3">
              {liveSections.map((section) => (
                <article key={section.label} className="rounded-lg border border-status-pass/20 bg-status-pass/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/48">
                    {section.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-status-pass">{section.value}</p>
                  <p className="mt-1 text-sm text-foreground/58">{section.detail}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-border bg-surface p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Veřejný buyer-ready přehled</p>
                  <p className="mt-1 text-sm text-foreground/58">
                    Kategorie se zveřejňují postupně podle splněných kontrol a dostupných důkazů.
                  </p>
                </div>
                {publicUrl ? (
                  <a className="inline-flex items-center gap-2 text-sm font-medium text-primary" href={publicUrl}>
                    Zobrazit Trust Center
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground/46">
                    Publikace zatím vypnutá
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-background p-4 text-sm text-foreground/64">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Každá zamčená sekce má vlastní podmínku odemčení. Uživatel přesně ví, jestli má splnit
          první kontrolu, připojit systém, nebo nahrát důkaz.
        </p>
      </div>
    </section>
  );
}
