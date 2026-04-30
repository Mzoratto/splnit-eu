import { notFound } from "next/navigation";
import { Building2, CheckCircle2 } from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import { getVendorAssessmentByToken } from "@/lib/db/queries/vendors";
import {
  VENDOR_ANSWER_OPTIONS,
  VENDOR_ASSESSMENT_QUESTIONS,
} from "@/lib/vendors/questions";
import { submitVendorAssessmentAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function VendorAssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const data = hasDatabaseUrl()
    ? await getVendorAssessmentByToken(token).catch(() => null)
    : null;

  if (!data) {
    notFound();
  }

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
            {data.vendor.name}
          </h1>
          <p className="mt-2 text-sm text-foreground/64">
            {data.organisation.name} žádá o vyplnění supply-chain bezpečnostního
            dotazníku.
          </p>
          {query.submitted === "1" ? (
            <p className="mt-4 inline-flex rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Dotazník byl odeslán.
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
                {index + 1}. {question.label}
              </span>
              <select
                name={question.id}
                defaultValue="partial"
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {VENDOR_ANSWER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            Odeslat assessment
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
