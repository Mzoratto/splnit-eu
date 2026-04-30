"use client";

import Link from "next/link";
import { useEffect, useMemo, useReducer, useState, useTransition } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  Gauge,
  Plug,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  completeOnboardingStep,
  saveCompanyStep,
  saveFrameworkStep,
  saveToolsStep,
} from "@/app/(app)/onboarding/actions";
import type { FrameworkSeed } from "@/lib/frameworks/registry";
import type { ToolInventoryItem } from "@/lib/onboarding/tools";

type CompanyState = {
  employeeCount: string;
  ico: string;
  name: string;
  sector: string;
};

type WizardState = {
  company: CompanyState;
  selectedFrameworks: string[];
  selectedTools: string[];
  step: number;
};

type WizardAction =
  | { type: "company"; field: keyof CompanyState; value: string }
  | { type: "framework"; slug: string }
  | { type: "tool"; key: string }
  | { type: "step"; step: number };

const sectors = [
  ["technology", "Technologie"],
  ["finance", "Finance"],
  ["healthcare", "Zdravotnictví"],
  ["manufacturing", "Výroba"],
  ["public-sector", "Veřejný sektor"],
  ["professional-services", "Profesionální služby"],
];

const employeeCounts = ["1-9", "10-49", "50-249", "250+"];

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "company":
      return {
        ...state,
        company: {
          ...state.company,
          [action.field]: action.value,
        },
      };

    case "framework":
      return {
        ...state,
        selectedFrameworks: state.selectedFrameworks.includes(action.slug)
          ? state.selectedFrameworks.filter((slug) => slug !== action.slug)
          : [...state.selectedFrameworks, action.slug],
      };

    case "tool":
      return {
        ...state,
        selectedTools: state.selectedTools.includes(action.key)
          ? state.selectedTools.filter((key) => key !== action.key)
          : [...state.selectedTools, action.key],
      };

    case "step":
      return { ...state, step: action.step };
  }
}

function calculateInitialScore(state: WizardState) {
  const frameworkScore = Math.min(state.selectedFrameworks.length * 8, 32);
  const toolingScore = Math.min(state.selectedTools.length * 3, 30);
  const companyScore = state.company.name && state.company.sector ? 18 : 0;

  return Math.min(100, 20 + frameworkScore + toolingScore + companyScore);
}

function ScoreReveal({ score }: { score: number }) {
  const [visibleScore, setVisibleScore] = useState(0);
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (visibleScore / 100) * circumference;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisibleScore(score));

    return () => window.cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative h-40 w-40">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          fill="none"
          r="48"
          stroke="currentColor"
          strokeWidth="10"
          className="text-surface-muted"
        />
        <circle
          cx="60"
          cy="60"
          fill="none"
          r="48"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="10"
          className="text-primary ring-track"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-mono text-4xl font-semibold text-primary">
          {visibleScore}%
        </span>
      </div>
    </div>
  );
}

export function OnboardingWizard({
  frameworks,
  initialCompany,
  initialFrameworks,
  initialTools,
  tools,
}: {
  frameworks: FrameworkSeed[];
  initialCompany: CompanyState;
  initialFrameworks: string[];
  initialTools: string[];
  tools: ToolInventoryItem[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, dispatch] = useReducer(reducer, {
    company: initialCompany,
    selectedFrameworks: initialFrameworks,
    selectedTools: initialTools,
    step: 1,
  });
  const score = useMemo(() => calculateInitialScore(state), [state]);

  function runStep(action: () => Promise<void>, nextStep: number) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        dispatch({ type: "step", step: nextStep });
      } catch {
        setError("Uložení kroku se nepodařilo.");
      }
    });
  }

  function finishOnboarding() {
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboardingStep({ initialScore: score });
        window.location.href = "/dashboard";
      } catch {
        setError("Dokončení onboardingu se nepodařilo.");
      }
    });
  }

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Onboarding
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          Nastavení organizace
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/64">
          Pět kroků nastaví základní profil, frameworky, nástroje a první doporučenou integraci.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-5">
        {["Firma", "Frameworky", "Nástroje", "Integrace", "Skóre"].map(
          (label, index) => {
            const active = state.step === index + 1;
            const complete = state.step > index + 1;

            return (
              <button
                key={label}
                type="button"
                onClick={() => dispatch({ type: "step", step: index + 1 })}
                className={`flex min-h-12 items-center justify-center rounded-md border px-3 text-sm ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : complete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-border bg-surface text-foreground/62"
                }`}
              >
                {label}
              </button>
            );
          },
        )}
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {state.step === 1 ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-6 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Údaje o firmě</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Název firmy
              <input
                value={state.company.name}
                onChange={(event) =>
                  dispatch({ type: "company", field: "name", value: event.target.value })
                }
                className="rounded-md border border-border bg-background px-3 py-2"
                required
              />
            </label>
            <label className="grid gap-2 text-sm">
              IČO
              <input
                value={state.company.ico}
                onChange={(event) =>
                  dispatch({ type: "company", field: "ico", value: event.target.value })
                }
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Sektor
              <select
                value={state.company.sector}
                onChange={(event) =>
                  dispatch({ type: "company", field: "sector", value: event.target.value })
                }
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {sectors.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Počet zaměstnanců
              <select
                value={state.company.employeeCount}
                onChange={(event) =>
                  dispatch({
                    type: "company",
                    field: "employeeCount",
                    value: event.target.value,
                  })
                }
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {employeeCounts.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={pending || state.company.name.trim().length < 2}
              onClick={() =>
                runStep(
                  () =>
                    saveCompanyStep({
                      employeeCount: state.company.employeeCount,
                      ico: state.company.ico,
                      name: state.company.name,
                      sector: state.company.sector,
                    }),
                  2,
                )
              }
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Pokračovat
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {state.step === 2 ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-6 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Vyberte frameworky</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {frameworks.map((framework) => {
              const selected = state.selectedFrameworks.includes(framework.slug);

              return (
                <button
                  key={framework.slug}
                  type="button"
                  onClick={() => dispatch({ type: "framework", slug: framework.slug })}
                  className={`min-h-32 rounded-lg border p-4 text-left ${
                    selected
                      ? "border-primary bg-blue-50"
                      : "border-border bg-background hover:bg-surface-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{framework.nameCs}</p>
                      <p className="mt-1 text-xs text-foreground/58">
                        {framework.regulator}
                      </p>
                    </div>
                    {selected ? <Check className="h-5 w-5 text-primary" /> : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/64">
                    {framework.descriptionCs}
                  </p>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "step", step: 1 })}
              className="rounded-md border border-border px-4 py-3 text-sm"
            >
              Zpět
            </button>
            <button
              type="button"
              disabled={pending || state.selectedFrameworks.length === 0}
              onClick={() =>
                runStep(
                  () =>
                    saveFrameworkStep({
                      frameworkSlugs: state.selectedFrameworks,
                    }),
                  3,
                )
              }
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Uložit frameworky
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {state.step === 3 ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">AI nástroje a SaaS inventář</h2>
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            {tools.map((tool) => {
              const selected = state.selectedTools.includes(tool.key);

              return (
                <button
                  key={tool.key}
                  type="button"
                  onClick={() => dispatch({ type: "tool", key: tool.key })}
                  className={`min-h-20 rounded-md border p-3 text-left text-sm ${
                    selected
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-border bg-background hover:bg-surface-muted"
                  }`}
                >
                  <span className="font-medium">{tool.name}</span>
                  <span className="mt-1 block text-xs text-foreground/52">
                    {tool.category}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "step", step: 2 })}
              className="rounded-md border border-border px-4 py-3 text-sm"
            >
              Zpět
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                runStep(
                  () => saveToolsStep({ toolKeys: state.selectedTools }),
                  4,
                )
              }
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Uložit nástroje
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {state.step === 4 ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-6 flex items-center gap-3">
            <Plug className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Doporučená integrace</h2>
          </div>
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="text-lg font-semibold">Microsoft 365</p>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              První automatické kontroly pokryjí MFA, Conditional Access, hosty a privilegované role.
            </p>
            <Link
              href="/integrations/microsoft365"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
            >
              Otevřít nastavení integrace
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "step", step: 3 })}
              className="rounded-md border border-border px-4 py-3 text-sm"
            >
              Zpět
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "step", step: 5 })}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              Zobrazit skóre
              <Gauge className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {state.step === 5 ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <ScoreReveal score={score} />
            <div>
              <p className="text-sm text-foreground/58">Úvodní skóre</p>
              <h2 className="mt-1 text-2xl font-semibold">První baseline je připravená</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/64">
                Skóre vychází z vybraných frameworků a inventáře nástrojů. Automatické testy ho zpřesní po připojení integrací.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "step", step: 4 })}
              className="rounded-md border border-border px-4 py-3 text-sm"
            >
              Zpět
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={finishOnboarding}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Dokončit onboarding
              <Check className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
