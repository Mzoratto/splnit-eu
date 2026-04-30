"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { comparisonGroups, faqs, plans } from "@/lib/marketing/pricing";

export function PricingCards() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-medium text-zinc-600">Měsíčně</span>
        <button
          type="button"
          className="relative flex h-[22px] w-10 items-center rounded-full bg-blue-600"
          aria-label="Přepnout fakturaci"
          aria-pressed={annual}
          onClick={() => setAnnual((value) => !value)}
        >
          <span
            className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              annual ? "translate-x-[18px]" : ""
            }`}
          />
        </button>
        <span className="text-sm font-medium text-zinc-600">Ročně</span>
        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          Ušetřete 2 měsíce
        </span>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = annual ? plan.annual : plan.monthly;
          const card = (
            <div className="flex h-full flex-col rounded-[21px] bg-white p-7">
              {plan.featured ? (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-semibold text-white shadow-md shadow-blue-200">
                    Nejoblíbenější
                  </span>
                </div>
              ) : null}
              <div className="mb-6">
                <p
                  className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
                    plan.featured ? "text-blue-500" : "text-zinc-400"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-zinc-900 transition-opacity">
                    €{price}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {annual && price > 0 ? "/měsíc ročně" : "/měsíc"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">{plan.description}</p>
              </div>
              <ul className="mb-7 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
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
                  <Link
                    href={plan.href}
                    className="block rounded-full bg-blue-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
                  >
                    {plan.cta}
                  </Link>
                </div>
              ) : (
                <Link
                  href={plan.href}
                  className="block rounded-full border border-zinc-200 bg-white py-2.5 text-center text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          );

          return (
            <article
              key={plan.name}
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
  const [openGroups, setOpenGroups] = useState<string[]>(
    comparisonGroups.slice(0, 3).map((group) => group.name),
  );

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
        <span>Funkce</span>
        <span>Zdarma</span>
        <span>Starter</span>
        <span>Business</span>
      </div>
      {comparisonGroups.map((group) => {
        const open = openGroups.includes(group.name);

        return (
          <div key={group.name} className="border-b border-zinc-100 last:border-b-0">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-zinc-900 md:px-6"
              onClick={() => toggle(group.name)}
            >
              {group.name}
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
                    key={row[0]}
                    className="grid grid-cols-[1.4fr_repeat(3,0.8fr)] px-4 py-3 text-xs text-zinc-600 md:px-6"
                  >
                    {row.map((cell, index) => (
                      <span
                        key={`${row[0]}-${index}`}
                        className={cell === "✓" ? "font-semibold text-emerald-600" : ""}
                      >
                        {cell}
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

export function RoiCalculator() {
  const [hours, setHours] = useState(20);
  const [rate, setRate] = useState(600);
  const current = hours * rate;
  const splnit = 1475;
  const savings = Math.max(current - splnit, 0);
  const format = useMemo(
    () =>
      new Intl.NumberFormat("cs-CZ", {
        maximumFractionDigits: 0,
      }),
    [],
  );

  return (
    <div className="rounded-[2rem] border border-blue-100 bg-blue-50/40 p-8 md:p-10">
      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">
        Kolik vám Splnit.eu ušetří?
      </h3>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Slider
          label="Hodin měsíčně na compliance"
          value={hours}
          min={0}
          max={100}
          suffix=" hodin/měsíc"
          onChange={setHours}
        />
        <Slider
          label="Hodinová sazba vašeho týmu"
          value={rate}
          min={200}
          max={2000}
          suffix=" Kč/hod"
          onChange={setRate}
        />
      </div>
      <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-5 text-sm text-zinc-700">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Současné náklady" value={`${format.format(current)} Kč/měsíc`} />
          <Metric label="Splnit.eu Starter" value={`${format.format(splnit)} Kč/měsíc`} />
          <Metric label="Úspora" value={`${format.format(savings)} Kč/měsíc`} highlight />
        </div>
      </div>
      <Link
        href="/sign-up"
        className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
      >
        Začít šetřit →
      </Link>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-zinc-700">{label}</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
          {value.toLocaleString("cs-CZ")}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-blue-600"
      />
    </label>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-400">{label}</p>
      <p
        className={`mt-1 font-mono text-xl font-semibold ${
          highlight ? "text-emerald-600" : "text-zinc-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function FaqAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white">
      {faqs.map((faq, index) => {
        const active = open === index;

        return (
          <div key={faq.question}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-sm font-semibold text-zinc-900"
              onClick={() => setOpen(active ? -1 : index)}
            >
              {faq.question}
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
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
