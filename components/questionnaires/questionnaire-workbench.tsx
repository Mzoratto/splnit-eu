"use client";

import { useActionState, useMemo } from "react";
import { useLocale, useMessages } from "next-intl";
import { Download, FileSpreadsheet, Loader2, Sparkles } from "lucide-react";
import {
  answerQuestionnaireAction,
  type QuestionnaireActionState,
} from "@/app/(app)/questionnaires/actions";
import { normalizeLocale } from "@/i18n/routing";

const initialState: QuestionnaireActionState = {
  error: null,
  rateLimit: null,
  result: null,
};

type QuestionnaireWorkbenchCopy = {
  inputTitle: string;
  pasteLabel: string;
  uploadLabel: string;
  sampleQuestions: string[];
  generate: string;
  rateLimitTitle: string;
  rateLimitBody: string;
  remaining: string;
  reset: string;
  notAvailable: string;
  resultsTitle: string;
  resultMeta: string;
  noResultSubtitle: string;
  emptyBody: string;
  evidence: string;
  legal: string;
  policies: string;
  none: string;
};

type QuestionnaireMessages = {
  questionnairePage: {
    workbench: QuestionnaireWorkbenchCopy;
  };
};

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function QuestionnaireWorkbench({
  canGenerate,
  organisationName,
}: {
  canGenerate: boolean;
  organisationName: string;
}) {
  const locale = normalizeLocale(useLocale()) ?? "cs-CZ";
  const copy = (useMessages() as QuestionnaireMessages).questionnairePage.workbench;
  const [state, formAction, pending] = useActionState(
    answerQuestionnaireAction,
    initialState,
  );
  const payload = useMemo(
    () => (state.result ? JSON.stringify(state.result) : ""),
    [state.result],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.35fr]">
      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">{copy.inputTitle}</h2>
        </div>
        <form
          action={formAction}
          className="mt-5 space-y-4"
        >
          <input name="locale" type="hidden" value={locale} />
          <label className="grid gap-2 text-sm">
            {copy.pasteLabel}
            <textarea
              name="questionnaire"
              rows={12}
              placeholder={copy.sampleQuestions.join("\n")}
              disabled={!canGenerate || pending}
              className="resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6"
            />
          </label>
          <label className="grid gap-2 text-sm">
            {copy.uploadLabel}
            <input
              name="file"
              type="file"
              accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
              disabled={!canGenerate || pending}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={!canGenerate || pending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {copy.generate}
          </button>
        </form>

        {state.error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {state.error}
          </p>
        ) : null}

        <div className="mt-5 rounded-md bg-surface-muted p-4 text-sm text-foreground/64">
          <p className="font-medium text-foreground">{copy.rateLimitTitle}</p>
          <p className="mt-1">
            {copy.rateLimitBody}
          </p>
          {state.rateLimit ? (
            <p className="mt-1">
              {copy.remaining}: {state.rateLimit.remaining ?? copy.notAvailable} ·{" "}
              {copy.reset}{" "}
              {state.rateLimit.resetAt
                ? state.rateLimit.resetAt.slice(0, 10)
                : copy.notAvailable}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold">{copy.resultsTitle}</h2>
            <p className="mt-1 text-sm text-foreground/58">
              {state.result
                ? interpolate(copy.resultMeta, {
                    count: state.result.questionCount,
                    model: state.result.model,
                  })
                : copy.noResultSubtitle}
            </p>
          </div>
          {state.result ? (
            <div className="flex flex-wrap gap-2">
              <form action="/api/questionnaires/export/pdf" method="post">
                <input name="payload" type="hidden" value={payload} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
                >
                  PDF
                  <Download className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
              <form action="/api/questionnaires/export/xlsx" method="post">
                <input name="payload" type="hidden" value={payload} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
                >
                  XLSX
                  <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          ) : null}
        </div>

        {state.result ? (
          <div className="space-y-4 p-5">
            <div className="rounded-md bg-surface-muted p-4 text-sm leading-6 text-foreground/70">
              {state.result.summary}
            </div>
            <div className="divide-y divide-border rounded-md border border-border">
              {state.result.answers.map((answer, index) => (
                <article key={`${answer.question}-${index}`} className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {index + 1}. {answer.question}
                    </p>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-medium ${confidenceClass(
                        answer.confidence,
                      )}`}
                    >
                      {answer.confidence}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    {answer.answer}
                  </p>
                  <div className="mt-3 grid gap-2 text-xs text-foreground/58 md:grid-cols-3">
                    <p>
                      {copy.evidence}:{" "}
                      {answer.evidenceRefs.join(", ") || copy.none}
                    </p>
                    <p>
                      {copy.legal}: {answer.legalRefs.join(", ") || copy.none}
                    </p>
                    <p>
                      {copy.policies}: {answer.policyRefs.join(", ") || copy.none}
                    </p>
                  </div>
                  {answer.notes ? (
                    <p className="mt-2 text-xs leading-5 text-foreground/58">
                      {answer.notes}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid min-h-96 place-items-center p-5 text-center text-sm text-foreground/58">
            <div>
              <Sparkles className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
              <p className="mt-3 max-w-sm">
                {interpolate(copy.emptyBody, { organisation: organisationName })}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function confidenceClass(confidence: "high" | "medium" | "low") {
  if (confidence === "high") {
    return "bg-emerald-50 text-emerald-800";
  }

  if (confidence === "medium") {
    return "bg-amber-50 text-amber-900";
  }

  return "bg-surface-muted text-foreground/64";
}
