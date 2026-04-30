import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Mail, ShieldCheck } from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import { getVendorDetail } from "@/lib/db/queries/vendors";
import {
  VENDOR_ANSWER_OPTIONS,
  VENDOR_ASSESSMENT_QUESTIONS,
} from "@/lib/vendors/questions";
import {
  saveVendorAssessmentAction,
  sendVendorQuestionnaireAction,
} from "../actions";

export const dynamic = "force-dynamic";

async function loadVendor(vendorId: string) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return vendorId === "demo-cloud"
      ? {
          assessments: [],
          vendor: {
            category: "cloud",
            clerkOrgId: "demo",
            createdAt: new Date(),
            id: "demo-cloud",
            lastAssessedAt: null,
            name: "Demo Cloud Provider",
            nextReviewAt: null,
            riskTier: "medium",
            status: "pending",
            website: "https://example.com",
          },
        }
      : null;
  }

  const session = await auth();

  if (!session.orgId) {
    return null;
  }

  return getVendorDetail({
    clerkOrgId: session.orgId,
    vendorId,
  }).catch(() => null);
}

function getAnswer(
  answers: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = answers?.[key];
  return typeof value === "string" ? value : "partial";
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  const detail = await loadVendor(vendorId);

  if (!detail) {
    notFound();
  }

  const latestAssessment = detail.assessments[0] ?? null;
  const canMutate = detail.vendor.clerkOrgId !== "demo";

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Vendor risk
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {detail.vendor.name}
          </h1>
          <p className="mt-2 text-sm text-foreground/64">
            {detail.vendor.category ?? "n/a"} · {detail.vendor.website ?? "bez webu"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-foreground/58">Risk tier</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-primary">
            {detail.vendor.riskTier ?? "pending"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr]">
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">12-question assessment</h2>
          </div>
          <form
            action={saveVendorAssessmentAction.bind(null, detail.vendor.id)}
            className="mt-5 space-y-4"
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
                  defaultValue={getAnswer(latestAssessment?.answers, question.id)}
                  disabled={!canMutate}
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
              disabled={!canMutate}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Uložit assessment
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Vendor questionnaire</h2>
            </div>
            <form
              action={sendVendorQuestionnaireAction.bind(null, detail.vendor.id)}
              className="mt-5 space-y-4"
            >
              <label className="grid gap-2 text-sm">
                Email dodavatele
                <input
                  name="email"
                  required
                  type="email"
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <button
                type="submit"
                disabled={!canMutate}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Odeslat dotazník
                <Mail className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </article>

          <article className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-semibold">Historie assessmentů</h2>
            </div>
            <div className="divide-y divide-border">
              {detail.assessments.length ? (
                detail.assessments.map((assessment) => (
                  <div key={assessment.id} className="p-5">
                    <p className="font-medium">
                      {assessment.score ?? "-"}% · {assessment.status}
                    </p>
                    <p className="mt-1 text-sm text-foreground/58">
                      {assessment.assessedAt?.toISOString().slice(0, 10) ??
                        "bez data"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-5 text-sm text-foreground/58">
                  Assessment zatím není vyplněný.
                </p>
              )}
            </div>
          </article>
        </section>
      </div>
    </section>
  );
}
