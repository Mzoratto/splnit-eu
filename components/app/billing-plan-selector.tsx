"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { createCheckoutSession } from "@/lib/stripe/actions";
import type { BillablePlanKey, BillingInterval } from "@/lib/stripe/plans";

export type BillingPlanCard = {
  key: BillablePlanKey;
  name: string;
  description: string;
  features: string[];
  monthlyCzk: number;
  annualCzk: number;
  listMonthlyCzk: number;
};

export type BillingPlanSelectorCopy = {
  monthly: string;
  yearly: string;
  yearlyBadge: string;
  perMonth: string;
  perYear: string;
  listPrefix: string;
  subscribe: string;
};

export function BillingPlanSelector({
  plans,
  annualEnabled,
  canManage,
  locale,
  copy,
}: {
  plans: BillingPlanCard[];
  annualEnabled: boolean;
  canManage: boolean;
  locale: string;
  copy: BillingPlanSelectorCopy;
}) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const format = (value: number) => `${new Intl.NumberFormat(locale).format(value)} Kč`;

  return (
    <div>
      {annualEnabled ? (
        <div className="mb-5 flex w-fit items-center gap-1 rounded-full border border-border bg-surface-muted p-1">
          {(["monthly", "yearly"] as const).map((value) => {
            const active = interval === value;

            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setInterval(value)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]"
                    : "text-foreground/62 hover:text-foreground"
                }`}
              >
                {value === "monthly" ? copy.monthly : copy.yearly}
                {value === "yearly" ? (
                  <span
                    className={`mono rounded-full px-2 py-0.5 text-[10px] ${
                      active ? "bg-white/20 text-white" : "bg-[var(--accent-subtle)] text-[var(--accent)]"
                    }`}
                  >
                    {copy.yearlyBadge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => {
          const isYearly = interval === "yearly";
          const amount = isYearly ? plan.annualCzk : plan.monthlyCzk;
          const suffix = isYearly ? copy.perYear : copy.perMonth;
          const showList = !isYearly && plan.listMonthlyCzk > plan.monthlyCzk;

          return (
            <article
              key={plan.key}
              className="flex min-h-[340px] flex-col rounded-lg border border-border bg-white p-5 shadow-xs"
            >
              <div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-semibold text-primary">
                    {format(amount)}
                  </span>
                  <span className="text-sm text-foreground/45">{suffix}</span>
                  {showList ? (
                    <span className="text-sm text-foreground/42 line-through">
                      {format(plan.listMonthlyCzk)}
                    </span>
                  ) : null}
                </p>
                <p className="mt-4 text-sm leading-6 text-foreground/64">
                  {plan.description}
                </p>
              </div>

              <ul className="mt-6 grid gap-2 text-sm text-foreground/70">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <ShieldCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <form
                className="mt-auto pt-6"
                action={createCheckoutSession.bind(null, plan.key, interval)}
              >
                <button
                  type="submit"
                  disabled={!canManage}
                  className="btn btn-primary min-h-11 w-full disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {copy.subscribe}
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
