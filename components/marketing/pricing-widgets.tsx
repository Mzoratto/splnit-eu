"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/marketing/local-icon";
import {
  comparisonGroups,
  plans,
  type ComparisonCell,
} from "@/lib/marketing/pricing";
import { PricingCta } from "@/components/marketing/pricing-cta";
import type { Locale } from "@/i18n/routing";

const faqKeys = [
  "cancel",
  "data",
  "setup",
  "legal",
  "discount",
  "cancelData",
] as const;
const planPrices: Record<
  Locale,
  {
    currency: string;
    /** Founding price — what new customers pay now, locked 12 months. */
    monthly: [number, number, number];
    /** List price — shown struck-through while founding pricing is active. */
    listMonthly: [number, number, number];
  }
> = {
  "cs-CZ": {
    currency: "CZK",
    listMonthly: [0, 1990, 5990],
    monthly: [0, 1490, 4990],
  },
  "en-EU": {
    currency: "CZK",
    listMonthly: [0, 1990, 5990],
    monthly: [0, 1490, 4990],
  },
  "it-IT": {
    currency: "CZK",
    listMonthly: [0, 1990, 5990],
    monthly: [0, 1490, 4990],
  },
};

function formatPlanPrice(price: number, locale: Locale, currency: string) {
  if (currency === "CZK") {
    return `${new Intl.NumberFormat(locale).format(price)} Kč`;
  }

  return new Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(price);
}

export function PricingCards() {
  const locale = useLocale() as Locale;
  const t = useTranslations("pricing.cards");
  const priceSet = planPrices[locale] ?? planPrices["cs-CZ"];

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-foreground/62 shadow-sm">
          {t("monthly")}
        </span>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const planKey = plan.key;
          const planName = t(`${planKey}.name`);
          const price = priceSet.monthly[index];
          const features = t.raw(`${planKey}.features`) as string[];
          const card = (
            <div className="flex h-full flex-col rounded-lg bg-white p-7">
              {plan.featured ? (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-white shadow-md shadow-green-200">
                    {t("featured")}
                  </span>
                </div>
              ) : null}
              <div className="mb-6">
                <p
                  className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
                    plan.featured ? "text-primary" : "text-foreground/42"
                  }`}
                >
                  {planName}
                </p>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-4xl font-bold tracking-normal text-foreground transition-opacity">
                    {formatPlanPrice(price, locale, priceSet.currency)}
                  </span>
                  <span className="text-sm text-foreground/45">
                    {t("monthlySuffix")}
                  </span>
                  {priceSet.listMonthly[index] > price ? (
                    <span className="text-sm text-foreground/42 line-through">
                      {formatPlanPrice(
                        priceSet.listMonthly[index],
                        locale,
                        priceSet.currency,
                      )}
                    </span>
                  ) : null}
                </div>
                {priceSet.listMonthly[index] > price ? (
                  <p className="mt-1 text-xs font-medium text-[var(--accent)]">
                    {t("foundingNote")}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-foreground/58">
                  {t(`${planKey}.description`)}
                </p>
              </div>
              <ul className="mb-7 flex-1 space-y-2.5">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-foreground/68"
                  >
                    <Icon
                      icon="solar:check-circle-linear"
                      className="shrink-0 text-status-pass"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.featured ? (
                <div>
                  <PricingCta
                    href={plan.href}
                    label={t(`${planKey}.cta`)}
                    planKey={planKey}
                    planName={planName}
                    featured
                  />
                </div>
              ) : (
                <PricingCta
                  href={plan.href}
                  label={t(`${planKey}.cta`)}
                  planKey={planKey}
                  planName={planName}
                />
              )}
            </div>
          );

          return (
            <article
              key={plan.key}
              className={`plan-card relative rounded-lg border bg-white shadow-sm ${
                plan.featured
                  ? "border-primary shadow-xl shadow-green-100"
                  : "border-border"
              }`}
            >
              {card}
            </article>
          );
        })}
      </div>
    </>
  );
}

export function ComparisonTable() {
  const t = useTranslations("pricing.comparison");
  const cardT = useTranslations("pricing.cards");
  const [openGroups, setOpenGroups] = useState<string[]>(
    comparisonGroups.slice(0, 3).map((group) => group.key),
  );

  function translateCell(cell: ComparisonCell) {
    switch (cell) {
      case "optional":
        return t("optional");
      case "lite":
        return t("lite");
      case "soon":
        return t("soon");
      case "selected":
        return t("selected");
      case "unlimited":
        return t("unlimited");
      default:
        return cell;
    }
  }

  function toggle(group: string) {
    setOpenGroups((current) =>
      current.includes(group)
        ? current.filter((item) => item !== group)
        : [...current, group],
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div className="grid grid-cols-[1.4fr_repeat(3,0.8fr)] border-b border-border bg-surface-muted px-4 py-3 text-xs font-bold text-foreground/68 md:px-6">
        <span>{t("feature")}</span>
        <span>{cardT("free.name")}</span>
        <span>{cardT("sme.name")}</span>
        <span>{cardT("agency.name")}</span>
      </div>
      {comparisonGroups.map((group) => {
        const open = openGroups.includes(group.key);

        return (
          <div key={group.key} className="border-b border-zinc-100 last:border-b-0">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-foreground md:px-6"
              onClick={() => toggle(group.key)}
            >
              {t(`groups.${group.key}`)}
              <Icon
                icon="solar:alt-arrow-down-linear"
                className={`transition-transform ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                {group.rows.map((row) => (
                  <div
                    key={row.key}
                    className="grid grid-cols-[1.4fr_repeat(3,0.8fr)] px-4 py-3 text-xs text-foreground/62 md:px-6"
                  >
                    <span>{t(`features.${row.key}`)}</span>
                    {row.cells.map((cell, index) => (
                      <span
                        key={`${row.key}-${index}`}
                        className={
                          cell === "✓" ? "font-semibold text-status-pass" : ""
                        }
                      >
                        {translateCell(cell)}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FaqAccordion() {
  const t = useTranslations("pricing.faqs");
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-white">
      {faqKeys.map((faqKey, index) => {
        const active = open === index;

        return (
          <div key={faqKey}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-sm font-semibold text-foreground"
              onClick={() => setOpen(active ? -1 : index)}
            >
              {t(`${faqKey}Question`)}
              <Icon
                icon="solar:add-circle-linear"
                className={`shrink-0 text-xl text-foreground/40 transition-transform ${
                  active ? "rotate-45" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ${
                active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-6 text-foreground/62">
                  {t(`${faqKey}Answer`)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
