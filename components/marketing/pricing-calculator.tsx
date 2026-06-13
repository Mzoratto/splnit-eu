"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  CALCULATOR_MAX_ICO,
  CALCULATOR_MIN_ICO,
  computeCalculatorEstimate,
  type BillingInterval,
} from "@/lib/marketing/pricing-calculator";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale, type Locale } from "@/i18n/routing";

function formatCzk(value: number, locale: Locale): string {
  return `${new Intl.NumberFormat(locale).format(value)} Kč`;
}

export function PricingCalculator() {
  const t = useTranslations("pricingCalculator");
  const locale = normalizeLocale(useLocale()) ?? "cs-CZ";
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [count, setCount] = useState(2);

  const estimate = useMemo(
    () => computeCalculatorEstimate(count, interval),
    [count, interval],
  );

  const planName =
    estimate.plan === "custom"
      ? t("planCustom")
      : estimate.plan === "agency"
        ? t("planAgency")
        : t("planSme");

  return (
    <div className="mx-auto max-w-xl rounded-[var(--r-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-md)] md:p-8">
      {/* Interval toggle */}
      <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border bg-surface-muted p-1">
        {(["monthly", "yearly"] as const).map((value) => {
          const active = interval === value;

          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setInterval(value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]"
                  : "text-foreground/62 hover:text-foreground"
              }`}
            >
              {t(value)}
              {value === "yearly" ? (
                <span
                  className={`mono rounded-full px-2 py-0.5 text-[10px] ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[var(--accent-subtle)] text-[var(--accent)]"
                  }`}
                >
                  {t("yearlyBadge")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* IČO stepper */}
      <p className="mt-8 text-center text-sm text-foreground/62">{t("icoLabel")}</p>
      <div className="mt-3 flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label={t("decrease")}
          onClick={() => setCount((c) => Math.max(CALCULATOR_MIN_ICO, c - 1))}
          disabled={count <= CALCULATOR_MIN_ICO}
          className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface text-foreground transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
        </button>
        <span className="mono w-16 text-center text-5xl font-bold text-foreground">
          {count}
        </span>
        <button
          type="button"
          aria-label={t("increase")}
          onClick={() => setCount((c) => Math.min(CALCULATOR_MAX_ICO, c + 1))}
          disabled={count >= CALCULATOR_MAX_ICO}
          className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface text-[var(--accent)] transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
        </button>
      </div>

      {/* Slider */}
      <div className="mt-6 rounded-xl border border-border bg-surface-muted p-4">
        <input
          type="range"
          min={CALCULATOR_MIN_ICO}
          max={CALCULATOR_MAX_ICO}
          value={count}
          aria-label={t("icoLabel")}
          onChange={(event) => setCount(Number(event.target.value))}
          className="pricing-range w-full"
        />
        <div className="mono mt-2 flex justify-between text-xs text-foreground/42">
          <span>1</span>
          <span>10</span>
          <span>20</span>
          <span>{CALCULATOR_MAX_ICO}+</span>
        </div>
      </div>

      <p className="mt-5 text-center text-sm font-semibold text-[var(--accent)]">
        {t("icoCount", { count })}
      </p>

      <div className="my-5 border-t border-border" />

      {estimate.plan === "custom" || estimate.monthlyTotal === null ? (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {t("customTitle")}
          </h3>
          <p className="mt-2 text-sm leading-6 text-foreground/62">
            {t("customBody")}
          </p>
          <Link
            href={getLocalizedMarketingPath("/early-access", locale)}
            className="btn btn-primary mt-5"
          >
            {t("customCta")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-foreground/62">{t("recommendedPlan")}</span>
              <span className="font-semibold text-foreground">{planName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground/62">{t("perIco")}</span>
              <span className="mono font-semibold text-foreground">
                {formatCzk(estimate.perIcoMonthly ?? 0, locale)}
                <span className="font-normal text-foreground/48"> {t("perMonthSuffix")}</span>
              </span>
            </div>
            {estimate.foundingActive && estimate.listMonthlyTotal ? (
              <div className="flex items-center justify-between rounded-lg border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-3 py-2">
                <span className="font-semibold text-[var(--status-pass)]">
                  ✓ {t("founding")}
                </span>
                <span className="mono font-semibold text-[var(--status-pass)]">
                  −{formatCzk(estimate.listMonthlyTotal - estimate.monthlyTotal, locale)}
                  <span className="font-normal"> {t("perMonthSuffix")}</span>
                </span>
              </div>
            ) : null}
            {interval === "yearly" ? (
              <div className="flex items-center justify-between rounded-lg border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-3 py-2">
                <span className="font-semibold text-[var(--status-pass)]">
                  ✓ {t("yearlySaving")}
                </span>
                <span className="mono font-semibold text-[var(--status-pass)]">
                  {formatCzk(estimate.annualSavings, locale)}
                  <span className="font-normal"> {t("perYearSuffix")}</span>
                </span>
              </div>
            ) : null}
          </div>

          <div className="my-5 border-t border-border" />

          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold text-foreground">
              {interval === "yearly" ? t("totalYear") : t("totalMonth")}
            </span>
            <span className="mono text-4xl font-bold text-[var(--accent)]">
              {formatCzk(estimate.intervalTotal ?? 0, locale)}
            </span>
          </div>

          <Link
            href={getLocalizedMarketingPath("/early-access", locale)}
            className="btn btn-primary mt-6 w-full justify-center"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </Link>
        </>
      )}

      <p className="mt-4 text-center text-xs leading-5 text-foreground/48">
        {t("disclaimer")}
      </p>
    </div>
  );
}
