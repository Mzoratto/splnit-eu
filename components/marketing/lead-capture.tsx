"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { Icon } from "@/components/marketing/local-icon";

type CompanySize = "under50" | "mid" | "large";
type Industry = "it" | "manufacturing" | "finance" | "other";
type BadgeState = "active" | "secondary" | "dimmed" | "idle";

const companySizes: Array<{ label: string; value: CompanySize }> = [
  { label: "<50", value: "under50" },
  { label: "50-250", value: "mid" },
  { label: "250+", value: "large" },
];

const industries: Industry[] = ["it", "manufacturing", "finance", "other"];

const regulationBadges: Array<{
  id: string;
  label: string;
  state: (size: CompanySize, industries: Industry[]) => BadgeState;
}> = [
  {
    id: "nis2",
    label: "NIS2",
    state: (size, selectedIndustries) =>
      size !== "under50" ||
      selectedIndustries.some((item) => item === "it" || item === "finance")
        ? "active"
        : "idle",
  },
  {
    id: "gdpr",
    label: "GDPR",
    state: () => "active",
  },
  {
    id: "csrd",
    label: "CSRD",
    state: (size) =>
      size === "large" ? "active" : size === "mid" ? "secondary" : "dimmed",
  },
  {
    id: "iso27001",
    label: "ISO 27001",
    state: (_size, selectedIndustries) =>
      selectedIndustries.some((item) => item === "it" || item === "finance")
        ? "secondary"
        : "idle",
  },
  {
    id: "euAiAct",
    label: "EU AI Act",
    state: (_size, selectedIndustries) =>
      selectedIndustries.includes("it") ? "secondary" : "dimmed",
  },
];

const badgeClass: Record<BadgeState, string> = {
  active:
    "scale-105 border-[var(--accent)] bg-[var(--accent)] text-[var(--text-on-accent)] ring-2 ring-[var(--accent-border)]",
  secondary:
    "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent)]",
  dimmed:
    "pointer-events-none border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-muted)] opacity-40 grayscale",
  idle: "border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]",
};

export function LeadCapture({
  source = "splnit.eu lead capture",
  title,
  subtitle,
  cta,
  resources,
}: {
  source?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  resources?: string[];
}) {
  const t = useTranslations("leadCapture");
  const [companySize, setCompanySize] = useState<CompanySize>("mid");
  const [selectedIndustries, setSelectedIndustries] = useState<Industry[]>([
    "it",
  ]);
  const [activatedBadge, setActivatedBadge] = useState<string | null>("nis2");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const resolvedTitle = title ?? t("title");
  const resolvedSubtitle = subtitle ?? t("subtitle");
  const resolvedCta = cta ?? t("cta");

  function chooseCompanySize(size: CompanySize) {
    setCompanySize(size);
    const firstActive = regulationBadges.find(
      (badge) => badge.state(size, selectedIndustries) === "active",
    );
    setActivatedBadge(firstActive?.id ?? null);
  }

  function toggleIndustry(industry: Industry) {
    const next = selectedIndustries.includes(industry)
      ? selectedIndustries.filter((item) => item !== industry)
      : [...selectedIndustries, industry];
    const firstActive = regulationBadges.find(
      (badge) => badge.state(companySize, next) === "active",
    );

    setSelectedIndustries(next);
    setActivatedBadge(firstActive?.id ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const response = await fetch("/api/newsletter", {
      body: JSON.stringify({ email, source }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (response.ok) {
      setEmail("");
      setStatus("success");
      return;
    }

    setStatus("error");
  }

  return (
    <div className="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-8 text-center md:p-14">
      <div className="section-tag mx-auto mb-5 w-fit">
        <Icon icon="solar:clipboard-check-linear" aria-hidden="true" />
        {t("tag")}
      </div>
      <h3 className="mb-2 text-2xl font-bold tracking-normal text-foreground md:text-3xl">
        {resolvedTitle}
      </h3>
      <p className="mb-8 text-sm text-foreground/62">{resolvedSubtitle}</p>

      {resources ? (
        <div className="mb-8 flex flex-wrap justify-center gap-2.5">
          {resources.map((resource) => (
            <span
              key={resource}
              className="rounded-full border border-[var(--accent-border)] bg-surface px-4 py-2 text-sm font-semibold text-foreground/70"
            >
              {resource}
            </span>
          ))}
        </div>
      ) : (
        <div className="mx-auto mb-8 grid max-w-4xl gap-4 text-left lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
            <fieldset
              className="grid gap-3"
              aria-label={t("companySize")}
            >
              <legend className="text-xs font-bold uppercase text-foreground/60">
                {t("companySize")}
              </legend>
              <div className="grid grid-cols-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1">
                {companySizes.map((size) => {
                  const active = companySize === size.value;

                  return (
                    <button
                      key={size.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => chooseCompanySize(size.value)}
                      className={`min-h-10 rounded-md px-3 text-sm font-semibold transition-all duration-[var(--duration-base)] ${
                        active
                          ? "bg-[var(--color-brand-700)] text-white shadow-[var(--shadow-sm)]"
                          : "text-foreground/62 hover:bg-white hover:text-foreground"
                      }`}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-5">
              <p className="mb-3 text-xs font-bold uppercase text-foreground/60">
                {t("industry")}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {industries.map((industry) => {
                  const active = selectedIndustries.includes(industry);

                  return (
                    <button
                      key={industry}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleIndustry(industry)}
                      className={`flex min-h-10 items-center justify-between rounded-lg border px-3 text-sm font-semibold transition-all duration-[var(--duration-base)] ${
                        active
                          ? "border-[var(--color-brand-700)] bg-[var(--color-brand-100)] text-[var(--color-brand-700)]"
                          : "border-[var(--color-border)] bg-white text-foreground/62 hover:border-[var(--color-brand-400)] hover:text-foreground"
                      }`}
                    >
                      {t(`industries.${industry}`)}
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          active ? "bg-[var(--color-logo-green)]" : "bg-[var(--border-strong)]"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
            <p className="mb-3 text-xs font-bold uppercase text-foreground/60">
              {t("matchingRegulations")}
            </p>
            <div
              className="flex flex-wrap gap-2"
              aria-live="polite"
              aria-label={t("matchingRegulations")}
            >
              {regulationBadges.map((badge) => {
                const state = badge.state(companySize, selectedIndustries);

                return (
                  <span
                    key={badge.id}
                    className={`inline-flex min-h-9 items-center rounded-lg border px-3 text-xs font-bold transition-all duration-[var(--duration-base)] ease-[var(--ease-out-expo)] ${badgeClass[state]} ${
                      activatedBadge === badge.id && state === "active"
                        ? "badge-just-activated"
                        : ""
                    }`}
                    onAnimationEnd={() => setActivatedBadge(null)}
                  >
                    {badge.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {status === "success" ? (
        <div
          id="lead-capture-success"
          role="status"
          aria-live="polite"
          className="mx-auto flex max-w-md items-center justify-center gap-1.5 rounded-full border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-4 py-2 text-sm font-semibold text-[var(--status-pass)]"
        >
          <Icon icon="solar:check-circle-linear" aria-hidden="true" />
          {t("success")}
        </div>
      ) : (
        <form
          className="mx-auto flex max-w-md flex-col justify-center gap-2.5 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <label htmlFor="lead-capture-email" className="sr-only">
            {t("placeholder")}
          </label>
          <input
            id="lead-capture-email"
            type="email"
            required
            value={email}
            aria-describedby="lead-capture-status lead-capture-footnote"
            aria-invalid={status === "error"}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status === "error") {
                setStatus("idle");
              }
            }}
            placeholder={t("placeholder")}
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm text-foreground shadow-sm placeholder:text-foreground/38 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-11 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? t("loading") : resolvedCta}
          </button>
        </form>
      )}
      <p
        id="lead-capture-status"
        role={status === "error" ? "alert" : "status"}
        aria-live={status === "error" ? "assertive" : "polite"}
        className={
          status === "error"
            ? "mt-3 text-xs font-semibold text-[var(--status-fail)]"
            : "sr-only"
        }
      >
        {status === "error" ? t("error") : status === "loading" ? t("loading") : ""}
      </p>
      <p id="lead-capture-footnote" className="mt-3 text-xs text-foreground/42">
        {t("footnote")}
      </p>
    </div>
  );
}
