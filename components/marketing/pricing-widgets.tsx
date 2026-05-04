"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
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
    monthly: [number, number, number];
    annual: [number, number, number];
  }
> = {
  "cs-CZ": {
    annual: [0, 1225, 3100],
    currency: "CZK",
    monthly: [0, 1475, 3725],
  },
  "en-EU": {
    annual: [0, 49, 124],
    currency: "EUR",
    monthly: [0, 59, 149],
  },
  "it-IT": {
    annual: [0, 49, 124],
    currency: "EUR",
    monthly: [0, 59, 149],
  },
};

export function PricingCards() {
  const locale = useLocale() as Locale;
  const t = useTranslations("pricing.cards");
  const [annual, setAnnual] = useState(false);
  const priceSet = planPrices[locale] ?? planPrices["cs-CZ"];
  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        currency: priceSet.currency,
        maximumFractionDigits: 0,
        style: "currency",
      }),
    [locale, priceSet.currency],
  );

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-medium text-zinc-600">{t("monthly")}</span>
        <button
          type="button"
          className="relative flex h-[22px] w-10 items-center rounded-full bg-blue-600"
          aria-label={t("billingToggle")}
          aria-pressed={annual}
          onClick={() => setAnnual((value) => !value)}
        >
          <span
            className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              annual ? "translate-x-[18px]" : ""
            }`}
          />
        </button>
        <span className="text-sm font-medium text-zinc-600">{t("annual")}</span>
        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          {t("saving")}
        </span>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const planKey = plan.key;
          const planName = t(`${planKey}.name`);
          const price = annual ? priceSet.annual[index] : priceSet.monthly[index];
          const features = t.raw(`${planKey}.features`) as string[];
          const card = (
            <div className="flex h-full flex-col rounded-[21px] bg-white p-7">
              {plan.featured ? (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-semibold text-white shadow-md shadow-blue-200">
                    {t("featured")}
                  </span>
                </div>
              ) : null}
              <div className="mb-6">
                <p
                  className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
                    plan.featured ? "text-blue-500" : "text-zinc-400"
                  }`}
                >
                  {planName}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-zinc-900 transition-opacity">
                    {formatCurrency.format(price)}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {annual && price > 0 ? t("annualSuffix") : t("monthlySuffix")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {t(`${planKey}.description`)}
                </p>
              </div>
              <ul className="mb-7 flex-1 space-y-2.5">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-xs text-zinc-600"
                  >
                    <Icon
                      icon="solar:check-circle-linear"
                      className="shrink-0 text-emerald-500"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.featured ? (
                <div className="rounded-full bg-gradient-to-b from-blue-400 to-blue-700 p-px">
                  <PricingCta
                    href={plan.href}
                    label={t(`${planKey}.cta`)}
                    planName={planName}
                    featured
                  />
                </div>
              ) : (
                <PricingCta
                  href={plan.href}
                  label={t(`${planKey}.cta`)}
                  planName={planName}
                />
              )}
            </div>
          );

          return (
            <article
              key={plan.key}
              className={`plan-card relative rounded-[22px] p-px shadow-sm ${
                plan.featured
                  ? "shadow-xl"
                  : "grad-border"
              }`}
              style={
                plan.featured
                  ? {
                      background:
                        "linear-gradient(180deg,#93C5FD,#3B82F6,#1D4ED8)",
                    }
                  : undefined
              }
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
    <div className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1.4fr_repeat(3,0.8fr)] border-b border-zinc-100 bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-600 md:px-6">
        <span>{t("feature")}</span>
        <span>{cardT("free.name")}</span>
        <span>{cardT("starter.name")}</span>
        <span>{cardT("business.name")}</span>
      </div>
      {comparisonGroups.map((group) => {
        const open = openGroups.includes(group.key);

        return (
          <div key={group.key} className="border-b border-zinc-100 last:border-b-0">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-zinc-900 md:px-6"
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
                    className="grid grid-cols-[1.4fr_repeat(3,0.8fr)] px-4 py-3 text-xs text-zinc-600 md:px-6"
                  >
                    <span>{t(`features.${row.key}`)}</span>
                    {row.cells.map((cell, index) => (
                      <span
                        key={`${row.key}-${index}`}
                        className={
                          cell === "✓" ? "font-semibold text-emerald-600" : ""
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
    <div className="divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white">
      {faqKeys.map((faqKey, index) => {
        const active = open === index;

        return (
          <div key={faqKey}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-sm font-semibold text-zinc-900"
              onClick={() => setOpen(active ? -1 : index)}
            >
              {t(`${faqKey}Question`)}
              <Icon
                icon="solar:add-circle-linear"
                className={`shrink-0 text-xl text-zinc-400 transition-transform ${
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
                <p className="px-5 pb-5 text-sm leading-6 text-zinc-500">
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
