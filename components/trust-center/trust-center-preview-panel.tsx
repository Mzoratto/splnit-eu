"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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

export function TrustCenterPreviewPanel({
  organisationName,
  publicUrl,
  liveStats,
}: TrustCenterPreviewPanelProps) {
  const t = useTranslations("trustCenterPreview");
  const [view, setView] = useState<"preview" | "live">("preview");
  const isPreview = view === "preview";
  const previewSections = [
    {
      title: t("sections.frameworks.title"),
      preview: t("sections.frameworks.preview"),
      unlock: t("sections.frameworks.unlock"),
    },
    {
      title: t("sections.verified.title"),
      preview: t("sections.verified.preview"),
      unlock: t("sections.verified.unlock"),
    },
    {
      title: t("sections.documents.title"),
      preview: t("sections.documents.preview"),
      unlock: t("sections.documents.unlock"),
    },
  ];
  const liveSections = [
    {
      detail: t("liveSections.controls.detail", {
        count: liveStats.totalControls,
      }),
      label: t("liveSections.controls.label"),
      value: String(liveStats.passedControls),
    },
    {
      detail: t("liveSections.evidence.detail"),
      label: t("liveSections.evidence.label"),
      value: String(liveStats.evidenceCount),
    },
    {
      detail: t("liveSections.access.detail"),
      label: t("liveSections.access.label"),
      value: String(liveStats.accessRequests),
    },
    {
      detail: liveStats.publishLabel,
      label: t("liveSections.updated.label"),
      value: liveStats.lastUpdatedLabel,
    },
  ];

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal">
            {t("title")}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/64">
            {t("description")}
          </p>
        </div>
        <div
          aria-label={t("viewToggleAria")}
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
            {t("previewTab")}
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
            {t("liveTab")}
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
              {isPreview ? t("prePublishPreview") : liveStats.publishLabel}
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
                  <p className="font-medium">{t("publicSummaryTitle")}</p>
                  <p className="mt-1 text-sm text-foreground/58">
                    {t("publicSummaryBody")}
                  </p>
                </div>
                {publicUrl ? (
                  <a className="inline-flex items-center gap-2 text-sm font-medium text-primary" href={publicUrl}>
                    {t("viewTrustCenter")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground/46">
                    {t("publishingDisabled")}
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
        <p>{t("unlockNote")}</p>
      </div>
    </section>
  );
}
