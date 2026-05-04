"use client";

import Link from "next/link";
import { useLocale, useMessages } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, Gauge } from "lucide-react";
import { assessFrameworkAction } from "@/app/(app)/frameworks/[frameworkSlug]/actions";
import { normalizeLocale } from "@/i18n/routing";
import type { FrameworkAnswer, FrameworkQuestion } from "@/lib/frameworks/questions";
import type { FrameworkSeed } from "@/lib/frameworks/registry";

type AssessmentResult = {
  failingControls: number;
  score: number;
  totalControls: number;
};

type FrameworkWizardCopy = {
  answers: Record<FrameworkAnswer, string>;
  answered: string;
  back: string;
  controls: string;
  editAnswers: string;
  error: string;
  intro: string;
  next: string;
  openGaps: string;
  questions: Record<string, { help?: string; text: string }>;
  questionRange: string;
  resultBody: string;
  resultTitle: string;
  scoreStatus: string;
  status: string;
  step: string;
  submit: string;
  totalControls: string;
};

type FrameworkWizardMessages = {
  frameworkWizard: FrameworkWizardCopy;
};

function chunkQuestions(questions: FrameworkQuestion[]) {
  const chunks: FrameworkQuestion[][] = [];

  for (let index = 0; index < questions.length; index += 4) {
    chunks.push(questions.slice(index, index + 4));
  }

  return chunks;
}

function humanizeQuestionId(id: string) {
  return id
    .split("_")
    .map((word) =>
      word.length <= 3 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
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
  const locale = normalizeLocale(useLocale()) ?? "cs-CZ";
  const copy = (useMessages() as FrameworkWizardMessages).frameworkWizard;
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
  const answerOptions: {
    label: string;
    value: FrameworkAnswer;
  }[] = [
    { label: copy.answers.yes, value: "yes" },
    { label: copy.answers.partial, value: "partial" },
    { label: copy.answers.no, value: "no" },
    { label: copy.answers.na, value: "na" },
  ];

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
        setError(copy.error);
      }
    });
  }

  function questionText(question: FrameworkQuestion) {
    if (locale === "cs-CZ") {
      return question.text;
    }

    return copy.questions[question.id]?.text ?? `${humanizeQuestionId(question.id)}?`;
  }

  function questionHelp(question: FrameworkQuestion) {
    if (locale === "cs-CZ") {
      return question.help;
    }

    return copy.questions[question.id]?.help ?? "";
  }

  if (result) {
    return (
      <section className="space-y-6">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {locale === "cs-CZ" ? framework.nameCs : framework.nameEn}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {copy.resultTitle}
          </h1>
          <p className="mt-3 text-sm leading-6 text-foreground/64">
            {copy.resultBody}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          <article className="flex items-center justify-center rounded-lg border border-border bg-surface p-6">
            <ScoreRing score={result.score} />
          </article>
          <article className="rounded-lg border border-border bg-surface p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-foreground/58">{copy.totalControls}</p>
                <p className="mt-1 font-mono text-3xl font-semibold">
                  {result.totalControls}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/58">{copy.openGaps}</p>
                <p className="mt-1 font-mono text-3xl font-semibold text-warning">
                  {result.failingControls}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/58">{copy.status}</p>
                <p className="mt-1 text-lg font-semibold">{copy.scoreStatus}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/frameworks/${framework.slug}`}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
              >
                {copy.controls}
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
                {copy.editAnswers}
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
          {locale === "cs-CZ" ? framework.nameCs : framework.nameEn} assessment
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground/64">
          {copy.intro}
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
              {interpolate(copy.step, { step: index + 1 })}
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
                {interpolate(copy.questionRange, {
                  from: step * 4 + 1,
                  to: Math.min((step + 1) * 4, questions.length),
                })}
              </h2>
            </div>
            <p className="mt-1 text-sm text-foreground/58">
              {interpolate(copy.answered, {
                answered: answeredCount,
                total: questions.length,
              })}
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
              <legend className="px-1 font-medium">{questionText(question)}</legend>
              {questionHelp(question) ? (
                <p className="mt-1 text-sm leading-6 text-foreground/58">
                  {questionHelp(question)}
                </p>
              ) : null}
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
            {copy.back}
          </button>
          {isLastStep ? (
            <button
              type="button"
              disabled={pending || !allAnswered}
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.submit}
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
              {copy.next}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
