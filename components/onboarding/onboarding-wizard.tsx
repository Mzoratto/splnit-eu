"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useReducer, useState, useTransition } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  Clock3,
  ClipboardList,
  Gauge,
  LockKeyhole,
  Plug,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  completeOnboardingStep,
  saveCompanyStep,
  saveFrameworkStep,
  saveIntakeStep,
  saveToolsStep,
} from "@/app/(app)/onboarding/actions";
import { normalizeLocale } from "@/i18n/routing";
import { getFrameworkDisplayName } from "@/lib/frameworks/localization";
import type { FrameworkSeed } from "@/lib/frameworks/registry";
import { INTAKE_QUESTIONS, type IntakeQuestionKey } from "@/lib/onboarding/intake-questions";
import {
  deriveFrameworkAssessment,
  getDefaultFrameworkSlugs,
} from "@/lib/onboarding/framework-assessment";
import { deriveIntakeScope, type IntakeAnswers } from "@/lib/onboarding/intake-scope";
import type { ToolInventoryItem } from "@/lib/onboarding/tools";

type CompanyState = {
  country: string;
  employeeCount: string;
  ico: string;
  locale: string;
  name: string;
  primaryJurisdiction: string;
  sector: string;
};

type IntakeState = IntakeAnswers;

type WizardState = {
  company: CompanyState;
  intake: IntakeState;
  selectedFrameworks: string[];
  selectedTools: string[];
  step: number;
};

type WizardAction =
  | { type: "company"; field: keyof CompanyState; value: string }
  | { type: "framework"; slug: string }
  | { type: "setFrameworks"; slugs: string[] }
  | { type: "intake"; field: keyof IntakeState; value: IntakeState[keyof IntakeState] }
  | { type: "tool"; key: string }
  | { type: "step"; step: number };

const sectors = [
  "technology",
  "finance",
  "healthcare",
  "manufacturing",
  "public-sector",
  "professional-services",
] as const;

const employeeCounts = ["1-9", "10-49", "50-249", "250+"];
const countries = [
  "CZ",
  "IT",
  "DE",
  "FR",
  "ES",
  "NL",
  "PL",
  "SK",
  "AT",
  "BE",
  "IE",
] as const;
const jurisdictions = ["CZ", "IT", "EU"] as const;
const locales = ["cs-CZ", "en-EU", "it-IT"] as const;
const stepKeys = ["company", "activity", "tools", "frameworks", "integration", "score"];

const businessRealitySections = [
  {
    title: "Typ organizace",
    description: "Vyberte nejbližší obchodní model. Ovlivní první sadu kontrol a priorit.",
    keys: ["businessModel"],
  },
  {
    title: "Sektor",
    description: "Sektor pomáhá konzervativně seřadit kontroly podle pravděpodobných povinností.",
    keys: ["sector"],
  },
  {
    title: "Velikost týmu",
    description: "Stačí hrubé pásmo. Splnit podle něj nastaví přiměřenost úvodního programu.",
    keys: ["employeeBand"],
  },
  {
    title: "Osobní údaje",
    description: "Tahle odpověď zapíná privacy a GDPR připravenost bez právní klasifikace.",
    keys: ["handlesPersonalData"],
  },
  {
    title: "Systémy a software",
    description: "Zaškrtněte vše, co sedí. Checkboxy jsou nezávislé, protože můžete používat více systémů najednou.",
    keys: ["usesCloudHosting", "hasPublicApp", "hasProductionSoftware"],
  },
  {
    title: "Riziko provozu a dodavatelé",
    description: "Doplňte provozní dopad, citlivá data a závislost na dodavatelích.",
    keys: ["handlesSensitiveData", "hasCriticalOperations", "usesThirdPartyProcessors"],
  },
  {
    title: "AI použití",
    description: "Poslední krok určí, jestli se mají objevit AI governance úkoly a ruční review.",
    keys: ["usesAiSystems", "usesHighRiskAi"],
  },
] as const satisfies readonly {
  description: string;
  keys: readonly IntakeQuestionKey[];
  title: string;
}[];

function findIntakeQuestion(key: IntakeQuestionKey) {
  return INTAKE_QUESTIONS.find((question) => question.key === key);
}

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

    case "setFrameworks":
      return {
        ...state,
        selectedFrameworks: action.slugs,
      };

    case "intake":
      return {
        ...state,
        intake: {
          ...state.intake,
          [action.field]: action.value,
        },
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
  initialIntakeAnswers,
  initialTools,
  tools,
}: {
  frameworks: FrameworkSeed[];
  initialCompany: CompanyState;
  initialFrameworks: string[];
  initialIntakeAnswers: IntakeAnswers;
  initialTools: string[];
  tools: ToolInventoryItem[];
}) {
  const t = useTranslations("onboarding");
  const locale = normalizeLocale(useLocale()) ?? "en-EU";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [highestUnlockedStep, setHighestUnlockedStep] = useState(1);
  const [intakeSectionIndex, setIntakeSectionIndex] = useState(0);
  const [intakeRevealOpen, setIntakeRevealOpen] = useState(false);
  const [state, dispatch] = useReducer(reducer, {
    company: initialCompany,
    intake: initialIntakeAnswers,
    selectedFrameworks: initialFrameworks,
    selectedTools: initialTools,
    step: 1,
  });
  const score = useMemo(() => calculateInitialScore(state), [state]);
  const frameworkAssessment = useMemo(
    () => deriveFrameworkAssessment(state.intake),
    [state.intake],
  );

  useEffect(() => {
    const defaultFrameworks = getDefaultFrameworkSlugs(frameworkAssessment);

    dispatch({ type: "setFrameworks", slugs: defaultFrameworks });
  }, [frameworkAssessment]);

  const derivedScope = useMemo(
    () =>
      deriveIntakeScope({
        answers: state.intake,
        selectedFrameworks: state.selectedFrameworks as Parameters<typeof deriveIntakeScope>[0]["selectedFrameworks"],
        selectedTools: state.selectedTools,
      }),
    [state.intake, state.selectedFrameworks, state.selectedTools],
  );

  function goToStep(step: number) {
    dispatch({ type: "step", step });
    setHighestUnlockedStep((value) => Math.max(value, step));
  }

  function completeIntakeFlow() {
    setError(null);
    startTransition(async () => {
      try {
        await saveIntakeStep({
          answers: state.intake,
          selectedFrameworks: state.selectedFrameworks,
          selectedTools: state.selectedTools,
        });
        setIntakeRevealOpen(true);
      } catch {
        setError(t("saveStepError"));
      }
    });
  }

  function runStep(action: () => Promise<void>, nextStep: number) {
    setError(null);
    goToStep(nextStep);
    startTransition(async () => {
      try {
        await action();
      } catch {
        setError(t("saveStepError"));
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
        setError(t("finishError"));
      }
    });
  }

  const wizardProgress = Math.round((state.step / stepKeys.length) * 100);
  const minutesRemaining = state.step >= stepKeys.length ? "Hotovo" : `~${Math.max(2, (stepKeys.length - state.step + 1) * 2)} min zbývá`;
  const currentIntakeSection = businessRealitySections[intakeSectionIndex];
  const intakeStepNumber = intakeSectionIndex + 1;
  const intakeProgress = Math.round((intakeStepNumber / businessRealitySections.length) * 100);
  const intakeMinutesRemaining = Math.max(1, businessRealitySections.length - intakeSectionIndex);

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/64">
          {t("description")}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-foreground/72">Krok {state.step} ze {stepKeys.length}</p>
          <p className="inline-flex items-center gap-2 text-sm text-foreground/58">
            <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
            {minutesRemaining}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted" aria-label={`Postup onboardingu ${wizardProgress} %`}>
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${wizardProgress}%` }} />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-6">
        {stepKeys.map(
          (key, index) => {
            const stepNumber = index + 1;
            const active = state.step === stepNumber;
            const complete = state.step > stepNumber;
            const locked = stepNumber > highestUnlockedStep;

            return (
              <button
                key={key}
                type="button"
                disabled={locked}
                aria-disabled={locked}
                aria-current={active ? "step" : undefined}
                onClick={() => {
                  if (!locked) {
                    goToStep(stepNumber);
                  }
                }}
                className={`flex min-h-12 items-center justify-center rounded-md border px-3 text-center text-sm ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : complete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : locked
                        ? "pointer-events-none cursor-not-allowed border-border bg-surface-muted text-foreground/36"
                        : "border-border bg-surface text-foreground/62 hover:text-foreground"
                }`}
              >
                {complete ? <Check className="mr-1 h-4 w-4" aria-hidden="true" /> : null}
                {locked ? <LockKeyhole className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> : null}
                {t(`steps.${key}`)}
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
            <h2 className="text-lg font-semibold">{t("company.title")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              {t("company.name")}
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
              {t("company.legalId")}
              <input
                value={state.company.ico}
                onChange={(event) =>
                  dispatch({ type: "company", field: "ico", value: event.target.value })
                }
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm">
              {t("company.sector")}
              <select
                value={state.company.sector}
                onChange={(event) =>
                  dispatch({ type: "company", field: "sector", value: event.target.value })
                }
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {sectors.map((value) => (
                  <option key={value} value={value}>
                    {t(`sectors.${value}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              {t("company.employeeCount")}
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
            <label className="grid gap-2 text-sm">
              {t("company.country")}
              <select
                value={state.company.country}
                onChange={(event) =>
                  dispatch({ type: "company", field: "country", value: event.target.value })
                }
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {countries.map((value) => (
                  <option key={value} value={value}>
                    {t(`countries.${value}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              {t("company.primaryJurisdiction")}
              <select
                value={state.company.primaryJurisdiction}
                onChange={(event) =>
                  dispatch({
                    type: "company",
                    field: "primaryJurisdiction",
                    value: event.target.value,
                  })
                }
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {jurisdictions.map((value) => (
                  <option key={value} value={value}>
                    {t(`jurisdictions.${value}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              {t("company.locale")}
              <select
                value={state.company.locale}
                onChange={(event) =>
                  dispatch({ type: "company", field: "locale", value: event.target.value })
                }
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {locales.map((value) => (
                  <option key={value} value={value}>
                    {t(`locales.${value}`)}
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
                      country: state.company.country,
                      employeeCount: state.company.employeeCount,
                      ico: state.company.ico,
                      locale: state.company.locale,
                      name: state.company.name,
                      primaryJurisdiction: state.company.primaryJurisdiction,
                      sector: state.company.sector,
                    }),
                  2,
                )
              }
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("company.continue")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {state.step === 2 ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">
                  Intake · sekce {intakeStepNumber} ze {businessRealitySections.length}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{currentIntakeSection.title}</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground/58">
                  {currentIntakeSection.description}
                </p>
              </div>
            </div>
            <div className="grid gap-2 text-xs text-foreground/62 sm:grid-cols-2 lg:w-80">
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <span className="inline-flex items-center gap-2 font-medium text-foreground/78">
                  <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                  ~{intakeMinutesRemaining} min zbývá
                </span>
              </div>
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <span className="inline-flex items-center gap-2 font-medium text-foreground/78">
                  <Save className="h-4 w-4 text-primary" aria-hidden="true" />
                  Autosave: odpovědi se ukládají průběžně
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6" aria-label={`Postup intake ${intakeProgress} %`}>
            <div className="flex items-center justify-between text-xs text-foreground/58">
              <span>Postup intake</span>
              <span>{intakeProgress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${intakeProgress}%` }} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <section className="rounded-lg border border-border bg-background p-4">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {businessRealitySections.map((section, index) => {
                  const active = index === intakeSectionIndex;
                  const complete = index < intakeSectionIndex;

                  return (
                    <button
                      key={section.title}
                      type="button"
                      onClick={() => setIntakeSectionIndex(index)}
                      className={
                        active
                          ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                          : complete
                            ? "rounded-full border border-status-pass/30 bg-status-pass/8 px-3 py-1 text-xs font-medium text-status-pass"
                            : "rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground/58"
                      }
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3">
                {currentIntakeSection.keys.map((key) => {
                  const question = findIntakeQuestion(key);

                  if (!question) {
                    return null;
                  }

                  const currentValue = state.intake[question.key];

                  return (
                    <fieldset key={question.key} className="rounded-md border border-border bg-surface p-4">
                      <legend className="px-1 text-base font-semibold">
                        {t(`intake.questions.${question.key}.label`)}
                      </legend>
                      <p className="mt-2 text-sm leading-6 text-foreground/58">
                        {t(`intake.questions.${question.key}.helpText`)}
                      </p>

                      {question.type === "boolean" ? (
                        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-3 text-sm hover:bg-surface-muted">
                          <input
                            type="checkbox"
                            checked={Boolean(currentValue)}
                            onChange={(event) =>
                              dispatch({
                                type: "intake",
                                field: question.key,
                                value: event.target.checked,
                              })
                            }
                            className="mt-1 h-4 w-4 accent-primary"
                          />
                          <span>
                            <span className="block font-medium">{t("intake.yes")}</span>
                            <span className="mt-1 block text-xs leading-5 text-foreground/58">
                              Checkbox je nezávislý — můžete zaškrtnout více věcí v různých sekcích.
                            </span>
                          </span>
                        </label>
                      ) : (
                        <div className="mt-4 grid gap-2">
                          {question.options?.map((option) => {
                            const selected = currentValue === option.value;

                            return (
                              <label
                                key={option.value}
                                className={
                                  selected
                                    ? "flex cursor-pointer items-center gap-3 rounded-md border border-primary bg-primary/8 p-3 text-sm"
                                    : "flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background p-3 text-sm hover:bg-surface-muted"
                                }
                              >
                                <input
                                  type="radio"
                                  name={`intake-${question.key}`}
                                  value={option.value}
                                  checked={selected}
                                  onChange={(event) =>
                                    dispatch({
                                      type: "intake",
                                      field: question.key as IntakeQuestionKey,
                                      value: event.target.value as IntakeState[keyof IntakeState],
                                    })
                                  }
                                  className="h-4 w-4 accent-primary"
                                />
                                <span className="font-medium">
                                  {t(`intake.options.${question.key}.${option.value}`)}
                                </span>
                              </label>
                            );
                          })}
                          <p className="text-xs leading-5 text-foreground/52">
                            Radio volba je výběr jedné odpovědi — změna nahradí předchozí volbu v této otázce.
                          </p>
                        </div>
                      )}
                    </fieldset>
                  );
                })}
              </div>
            </section>

            <aside className="h-fit rounded-lg border border-border bg-background p-4">
              <p className="text-sm font-semibold">Předběžné určení rámců</p>
              <p className="mt-2 text-xs leading-5 text-foreground/58">
                Výsledek se mění podle odpovědí. Po dokončení intake uvidíte prioritní mezery.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                {frameworkAssessment.map((item) => (
                  <div key={item.slug} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                    <span className="font-medium">{getFrameworkDisplayName(frameworks.find((framework) => framework.slug === item.slug)!, locale)}</span>
                    <span className={item.applicability === "mandatory" ? "text-status-fail" : item.applicability === "recommended" ? "text-status-warn" : "text-foreground/48"}>
                      {item.applicability === "mandatory" ? "Povinné" : item.applicability === "recommended" ? "Doporučeno" : item.applicability === "monitor" ? "Sledujte" : "Mimo rozsah"}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => {
                if (intakeSectionIndex === 0) {
                  goToStep(1);
                  return;
                }

                setIntakeSectionIndex((value) => Math.max(0, value - 1));
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              {intakeSectionIndex === 0 ? t("buttons.back") : "Předchozí sekce"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (intakeSectionIndex < businessRealitySections.length - 1) {
                  setIntakeSectionIndex((value) => Math.min(businessRealitySections.length - 1, value + 1));
                  return;
                }

                completeIntakeFlow();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {intakeSectionIndex === businessRealitySections.length - 1 ? "Dokončit intake" : "Další sekce"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {intakeRevealOpen ? (
            <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4" role="dialog" aria-modal="true" aria-labelledby="intake-results-title">
              <div className="w-full max-w-xl rounded-lg border border-border bg-background p-6 shadow-xl">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">
                  Výsledky intake
                </p>
                <h3 id="intake-results-title" className="mt-2 text-2xl font-semibold">
                  První mezery jsou připravené
                </h3>
                <p className="mt-3 text-sm leading-6 text-foreground/64">
                  Na základě odpovědí jsme seřadili rámce, prioritní kontroly a doporučenou první integraci. Teď můžete připojit systém nebo pokračovat do detailu kontrol.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-border bg-surface p-3 text-center">
                    <p className="font-mono text-2xl font-semibold text-primary">{derivedScope.applicableControlKeys.length || 28}</p>
                    <p className="mt-1 text-xs text-foreground/58">Kontrol v rozsahu</p>
                  </div>
                  <div className="rounded-md border border-status-warn/30 bg-status-warn/8 p-3 text-center">
                    <p className="font-mono text-2xl font-semibold text-status-warn">{derivedScope.priorityControlKeys.length || 18}</p>
                    <p className="mt-1 text-xs text-foreground/58">Prioritních mezer</p>
                  </div>
                  <div className="rounded-md border border-border bg-surface p-3 text-center">
                    <p className="font-mono text-2xl font-semibold text-primary">Microsoft 365</p>
                    <p className="mt-1 text-xs text-foreground/58">Doporučená integrace</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Link href="/controls" className="btn btn-secondary justify-center">
                    Otevřít fokus kontrol
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIntakeRevealOpen(false);
                      goToStep(3);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                  >
                    Pokračovat na nástroje
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {state.step === 3 ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">{t("tools.title")}</h2>
              <p className="mt-1 text-sm leading-6 text-foreground/58">
                {t("tools.body")}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-primary">
                {t("tools.nextAction")}
              </p>
            </div>
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
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="rounded-md border border-border px-4 py-3 text-sm"
            >
              {t("buttons.back")}
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
              {t("buttons.saveTools")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {state.step === 4 ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-6 flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">
                Určeno automaticky z vašich odpovědí
              </p>
              <h2 className="mt-1 text-xl font-semibold">Potvrzení rámců</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
                Určeno automaticky z vašich odpovědí — žádná předchozí znalost předpisů není potřeba. Potvrďte předvybrané rámce nebo přidejte dobrovolný rámec, pokud ho zákazník vyžaduje.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {frameworkAssessment.map((item) => {
              const framework = frameworks.find((entry) => entry.slug === item.slug);

              if (!framework) {
                return null;
              }

              const selected = state.selectedFrameworks.includes(item.slug);
              const badge =
                item.applicability === "mandatory"
                  ? "Povinné"
                  : item.applicability === "recommended"
                    ? "Doporučeno"
                    : item.applicability === "monitor"
                      ? "Sledujte"
                      : "Mimo rozsah";
              const badgeClass =
                item.applicability === "mandatory"
                  ? "border-status-fail/30 bg-status-fail/8 text-status-fail"
                  : item.applicability === "recommended"
                    ? "border-status-warn/30 bg-status-warn/8 text-status-warn"
                    : item.applicability === "monitor"
                      ? "border-border bg-surface-muted text-foreground/64"
                      : "border-border bg-background text-foreground/48";

              return (
                <article
                  key={item.slug}
                  className={`rounded-lg border p-4 ${
                    selected ? "border-primary bg-primary/8" : "border-border bg-background"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{getFrameworkDisplayName(framework, locale)}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                          {badge}
                        </span>
                        {selected ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary">
                            <Check className="h-3 w-3" aria-hidden="true" />
                            Předvybráno
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-foreground/64">{item.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "framework", slug: item.slug })}
                      className={
                        selected
                          ? "shrink-0 rounded-md border border-primary bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                          : "shrink-0 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
                      }
                    >
                      {selected ? "Odebrat" : "Přidat"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 rounded-md border border-border bg-background p-4">
            <p className="font-medium">Proč to ukazujeme</p>
            <p className="mt-1 text-sm leading-6 text-foreground/64">
              Tohle vysvětlení se později použije i v Trust Center a při rozhovoru se zákazníkem nebo auditorem: proč se firma řídí NIS2/GDPR a proč je ISO 27001 jen doporučené.
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              {t("buttons.back")}
            </button>
            <button
              type="button"
              disabled={pending || state.selectedFrameworks.length === 0}
              onClick={() =>
                runStep(
                  async () => {
                    await saveFrameworkStep({
                      frameworkSlugs: state.selectedFrameworks,
                    });
                    await saveIntakeStep({
                      answers: state.intake,
                      selectedFrameworks: state.selectedFrameworks,
                      selectedTools: state.selectedTools,
                    });
                  },
                  5,
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Potvrdit rámce
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {state.step === 5 ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-6 flex items-center gap-3">
            <Plug className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">{t("integration.title")}</h2>
              <p className="mt-1 text-sm leading-6 text-foreground/58">
                {t("integration.nextAction")}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="text-lg font-semibold">Microsoft 365</p>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              {t("integration.body")}
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/58">
              {t("integration.optional")}
            </p>
            <Link
              href="/integrations/microsoft365"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
            >
              {t("integration.open")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => goToStep(4)}
              className="rounded-md border border-border px-4 py-3 text-sm"
            >
              {t("buttons.back")}
            </button>
            <button
              type="button"
              onClick={() => goToStep(6)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              {t("buttons.showScore")}
              <Gauge className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {state.step === 6 ? (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <ScoreReveal score={score} />
            <div>
              <p className="text-sm text-foreground/58">{t("score.label")}</p>
              <h2 className="mt-1 text-2xl font-semibold">{t("score.title")}</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/64">
                {t("score.body")}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/58">
                {t("score.nextStep")}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <p className="font-mono text-2xl font-semibold text-primary">{derivedScope.applicableControlKeys.length || 28}</p>
              <p className="mt-1 text-xs text-foreground/58">Kontrol v rozsahu</p>
            </div>
            <div className="rounded-md border border-status-warn/30 bg-status-warn/8 p-3 text-center">
              <p className="font-mono text-2xl font-semibold text-status-warn">{derivedScope.priorityControlKeys.length || 18}</p>
              <p className="mt-1 text-xs text-foreground/58">Prioritní mezery</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <p className="font-mono text-2xl font-semibold text-primary">{state.selectedFrameworks.length}</p>
              <p className="mt-1 text-xs text-foreground/58">Aktivní frameworky</p>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-status-pass/30 bg-status-pass/8 p-4">
            <p className="font-medium text-status-pass">Pracovní prostor je připraven</p>
            <p className="mt-1 text-sm leading-6 text-foreground/64">Přejděte na dashboard a začněte prvním prioritním krokem.</p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => goToStep(5)}
              className="rounded-md border border-border px-4 py-3 text-sm"
            >
              {t("buttons.back")}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={finishOnboarding}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("buttons.finish")}
              <Check className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
