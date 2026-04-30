"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, Gauge } from "lucide-react";
import { assessFrameworkAction } from "@/app/(app)/frameworks/[frameworkSlug]/actions";
import type { FrameworkAnswer, FrameworkQuestion } from "@/lib/frameworks/questions";
import type { FrameworkSeed } from "@/lib/frameworks/registry";

type AssessmentResult = {
  failingControls: number;
  score: number;
  totalControls: number;
};

const answerOptions: {
  label: string;
  value: FrameworkAnswer;
}[] = [
  { label: "Ano", value: "yes" },
  { label: "Částečně", value: "partial" },
  { label: "Ne", value: "no" },
  { label: "N/A", value: "na" },
];

function chunkQuestions(questions: FrameworkQuestion[]) {
  const chunks: FrameworkQuestion[][] = [];

  for (let index = 0; index < questions.length; index += 4) {
    chunks.push(questions.slice(index, index + 4));
  }

  return chunks;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 108 108">
        <circle
          cx="54"
          cy="54"
          fill="none"
          r="42"
          stroke="currentColor"
          strokeWidth="9"
          className="text-surface-muted"
        />
        <circle
          cx="54"
          cy="54"
          fill="none"
          r="42"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="9"
          className="text-primary ring-track"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-mono text-3xl font-semibold text-primary">
          {score}%
        </span>
      </div>
    </div>
  );
}

export function FrameworkAssessmentWizard({
  framework,
  questions,
}: {
  framework: FrameworkSeed;
  questions: FrameworkQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, FrameworkAnswer>>({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const questionGroups = useMemo(() => chunkQuestions(questions), [questions]);
  const activeQuestions = questionGroups[step] ?? [];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const isLastStep = step === questionGroups.length - 1;

  function selectAnswer(questionId: string, answer: FrameworkAnswer) {
    setAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const nextResult = await assessFrameworkAction(framework.slug, answers);
        setResult(nextResult);
      } catch {
        setError("Vyhodnocení se nepodařilo uložit.");
      }
    });
  }

  if (result) {
    return (
      <section className="space-y-6">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {framework.nameCs}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Gap assessment hotový
          </h1>
          <p className="mt-3 text-sm leading-6 text-foreground/64">
            Výsledek je uložený do stavů kontrol a dashboard se přepočítal.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          <article className="flex items-center justify-center rounded-lg border border-border bg-surface p-6">
            <ScoreRing score={result.score} />
          </article>
          <article className="rounded-lg border border-border bg-surface p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-foreground/58">Kontroly</p>
                <p className="mt-1 font-mono text-3xl font-semibold">
                  {result.totalControls}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/58">Otevřené mezery</p>
                <p className="mt-1 font-mono text-3xl font-semibold text-warning">
                  {result.failingControls}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/58">Stav</p>
                <p className="mt-1 text-lg font-semibold">Baseline</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/frameworks/${framework.slug}`}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
              >
                Otevřít kontroly
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setStep(0);
                }}
                className="rounded-md border border-border px-4 py-3 text-sm"
              >
                Upravit odpovědi
              </button>
            </div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Framework wizard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          {framework.nameCs} assessment
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground/64">
          Odpovědi nastaví počáteční stavy kontrol a připraví gap report.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-5">
        {questionGroups.map((group, index) => {
          const complete = group.every((question) => answers[question.id]);
          const active = step === index;

          return (
            <button
              key={group[0]?.id ?? index}
              type="button"
              onClick={() => setStep(index)}
              className={`flex min-h-12 items-center justify-center rounded-md border px-3 text-sm ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : complete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-border bg-surface text-foreground/62"
              }`}
            >
              Krok {index + 1}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">
                Otázky {step * 4 + 1}-{Math.min((step + 1) * 4, questions.length)}
              </h2>
            </div>
            <p className="mt-1 text-sm text-foreground/58">
              Zodpovězeno {answeredCount} z {questions.length}
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-muted md:w-56">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4">
          {activeQuestions.map((question) => (
            <fieldset
              key={question.id}
              className="rounded-lg border border-border bg-background p-4"
            >
              <legend className="px-1 font-medium">{question.text}</legend>
              <p className="mt-1 text-sm leading-6 text-foreground/58">
                {question.help}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                {answerOptions.map((option) => {
                  const selected = answers[question.id] === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => selectAnswer(question.id, option.value)}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface hover:bg-surface-muted"
                      }`}
                    >
                      {selected ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : null}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Zpět
          </button>
          {isLastStep ? (
            <button
              type="button"
              disabled={pending || !allAnswered}
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Vyhodnotit
              <Check className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setStep((current) => Math.min(questionGroups.length - 1, current + 1))
              }
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              Pokračovat
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
