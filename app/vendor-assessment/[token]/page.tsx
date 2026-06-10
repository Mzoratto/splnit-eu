import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Building2, CheckCircle2 } from "lucide-react";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getVendorAssessmentByToken } from "@/lib/db/queries/vendors";
import {
  VENDOR_ANSWER_VALUES,
  VENDOR_ASSESSMENT_QUESTIONS,
} from "@/lib/vendors/questions";
import { submitVendorAssessmentAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

function formatMessage(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, value),
    template,
  );
}

function VendorAssessmentUnavailable({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground">
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
              Vendor assessment
            </p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            Assessment unavailable
          </h1>
          <p className="mt-2 text-sm text-foreground/64">{message}</p>
        </div>
      </section>
    </main>
  );
}

export default async function VendorAssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const result = hasDatabaseUrl()
    ? await getVendorAssessmentByToken(token).catch(() => null)
    : null;

  if (!result) {
    notFound();
  }

  if (!result.ok) {
    if (result.reason === "expired") {
      return (
        <VendorAssessmentUnavailable message="This assessment link has expired. Contact your vendor manager for a new link." />
      );
    }

    if (result.reason === "already_submitted") {
      return (
        <VendorAssessmentUnavailable message="This assessment has already been submitted." />
      );
    }

    notFound();
  }

  const data = result.data;

  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const locale = normalizeLocale(data.organisation.locale) ?? requestLocale;
  const copy = getMessagesForLocale(locale);
  const pageCopy = copy.vendorAssessmentPage;
  const assessmentCopy = copy.vendorsPage.assessment;

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground">
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
              {pageCopy.eyebrow}
            </p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            {data.vendor.name}
          </h1>
          <p className="mt-2 text-sm text-foreground/64">
            {formatMessage(pageCopy.requestDescription, {
              organisation: data.organisation.name,
            })}
          </p>
          <p className="mt-3 text-sm text-foreground/64">
            {formatMessage(pageCopy.context, {
              organisation: data.organisation.name,
            })}
          </p>
          {query.submitted === "1" ? (
            <p className="mt-4 inline-flex rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {pageCopy.submitted}
            </p>
          ) : null}
        </div>

        <form
          action={submitVendorAssessmentAction.bind(null, token)}
          className="space-y-4 rounded-lg border border-border bg-surface p-5"
        >
          {VENDOR_ASSESSMENT_QUESTIONS.map((question, index) => (
            <label
              key={question.id}
              className="grid gap-2 rounded-md border border-border p-3 text-sm md:grid-cols-[1fr_180px]"
            >
              <span>
                <span>
                  {index + 1}.{" "}
                  {assessmentCopy.questions[
                    question.id as keyof typeof assessmentCopy.questions
                  ] ?? question.id}
                </span>
                {assessmentCopy.questionNotes[
                  question.id as keyof typeof assessmentCopy.questionNotes
                ] ? (
                  <span className="mt-1 block text-xs text-foreground/58">
                    {
                      assessmentCopy.questionNotes[
                        question.id as keyof typeof assessmentCopy.questionNotes
                      ]
                    }
                  </span>
                ) : null}
              </span>
              <select
                name={question.id}
                defaultValue=""
                required
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                <option value="" disabled>
                  {assessmentCopy.selectPlaceholder}
                </option>
                {VENDOR_ANSWER_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {assessmentCopy.answers[value]}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            {pageCopy.submit}
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
