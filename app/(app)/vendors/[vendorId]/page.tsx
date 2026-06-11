import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { Mail, ShieldCheck } from "lucide-react";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { getVendorDetail } from "@/lib/db/queries/vendors";
import {
  getVendorQuestionSet,
  normalizeVendorQuestionnaireTemplate,
  VENDOR_ASSESSMENT_QUESTIONS,
  VENDOR_ANSWER_VALUES,
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
          detail: {
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
          },
          organisationLocale: null,
        }
      : null;
  }

  const session = await auth();

  if (!session.orgId) {
    return null;
  }

  const [organisation, detail] = await Promise.all([
    getOrganisationByClerkOrgId(session.orgId).catch(() => null),
    getVendorDetail({
      clerkOrgId: session.orgId,
      vendorId,
    }).catch(() => null),
  ]);

  return detail
    ? {
        detail,
        organisationLocale: organisation?.locale ?? null,
      }
    : null;
}

function getAnswer(
  answers: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = answers?.[key];
  return typeof value === "string" &&
    (VENDOR_ANSWER_VALUES as readonly string[]).includes(value)
    ? value
    : "";
}

function getDeliveryValue(
  answers: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = answers?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function formatDate(
  value: Date | string | null | undefined,
  locale: Locale,
  emptyLabel: string,
) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale).format(new Date(value));
}

function deliveryStatusClass(status: string | null) {
  if (status === "sent") {
    return "bg-emerald-50 text-emerald-800";
  }

  if (status === "failed") {
    return "bg-red-50 text-red-800";
  }

  return "bg-amber-50 text-amber-900";
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const data = await loadVendor(vendorId);

  if (!data) {
    notFound();
  }

  const locale = normalizeLocale(data.organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).vendorsPage;
  const { detail } = data;
  const latestAssessment = detail.assessments[0] ?? null;
  const latestQuestionnaire =
    detail.assessments.find((assessment) =>
      ["sent", "email_skipped", "email_failed"].includes(assessment.status),
    ) ?? null;
  const latestDeliveryStatus = getDeliveryValue(
    latestQuestionnaire?.answers,
    "deliveryStatus",
  );
  const latestDeliveryMessage = getDeliveryValue(
    latestQuestionnaire?.answers,
    "deliveryMessage",
  );
  const latestDeliveryTo = getDeliveryValue(latestQuestionnaire?.answers, "deliveryTo");
  const latestSubmittedQuestionnaire =
    detail.assessments.find(
      (assessment) =>
        assessment.status === "submitted" &&
        normalizeVendorQuestionnaireTemplate(assessment.template) !== "basic",
    ) ?? null;
  const submittedTemplate = latestSubmittedQuestionnaire
    ? normalizeVendorQuestionnaireTemplate(latestSubmittedQuestionnaire.template)
    : null;
  const latestDeliveryUpdatedAt = getDeliveryValue(
    latestQuestionnaire?.answers,
    "deliveryUpdatedAt",
  );
  const canMutate = detail.vendor.clerkOrgId !== "demo";

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {copy.detail.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {detail.vendor.name}
          </h1>
          <p className="mt-2 text-sm text-foreground/64">
            {detail.vendor.category ?? copy.emptyValue} ·{" "}
            {detail.vendor.website ?? copy.detail.noWebsite}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-foreground/58">{copy.detail.riskTier}</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-primary">
            {detail.vendor.riskTier
              ? copy.riskTiers[detail.vendor.riskTier as keyof typeof copy.riskTiers] ??
                detail.vendor.riskTier
              : copy.statuses.pending}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr]">
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.assessment.title}</h2>
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
                  <span>
                    {index + 1}.{" "}
                    {copy.assessment.questions[
                      question.id as keyof typeof copy.assessment.questions
                    ] ?? question.id}
                  </span>
                  {copy.assessment.questionNotes[
                    question.id as keyof typeof copy.assessment.questionNotes
                  ] ? (
                    <span className="mt-1 block text-xs text-foreground/58">
                      {
                        copy.assessment.questionNotes[
                          question.id as keyof typeof copy.assessment.questionNotes
                        ]
                      }
                    </span>
                  ) : null}
                </span>
                <select
                  name={question.id}
                  defaultValue={getAnswer(latestAssessment?.answers, question.id)}
                  required
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  <option value="" disabled>
                    {copy.assessment.selectPlaceholder}
                  </option>
                  {VENDOR_ANSWER_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {copy.assessment.answers[value]}
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
              {copy.assessment.save}
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">{copy.questionnaire.title}</h2>
            </div>
            {detail.vendor.status === "needs_contact_email" ? (
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {copy.questionnaire.needsContactEmail}
              </p>
            ) : null}
            <form
              action={sendVendorQuestionnaireAction.bind(null, detail.vendor.id)}
              className="mt-5 space-y-4"
            >
              <label className="grid gap-2 text-sm">
                {copy.questionnaire.email}
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
                {copy.questionnaire.send}
                <Mail className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
            {latestQuestionnaire ? (
              <div className="mt-4 rounded-md border border-border bg-background p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-foreground/58">
                    {copy.questionnaire.deliveryStatusLabel}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${deliveryStatusClass(
                      latestDeliveryStatus,
                    )}`}
                  >
                    {latestDeliveryStatus
                      ? copy.questionnaire.deliveryStatuses[
                          latestDeliveryStatus as keyof typeof copy.questionnaire.deliveryStatuses
                        ] ?? latestDeliveryStatus
                      : copy.statuses[
                          latestQuestionnaire.status as keyof typeof copy.statuses
                        ] ?? latestQuestionnaire.status}
                  </span>
                </div>
                {latestDeliveryTo ? (
                  <p className="mt-2 text-xs text-foreground/58">
                    {copy.questionnaire.deliveryTo}: {latestDeliveryTo}
                  </p>
                ) : null}
                {latestDeliveryUpdatedAt ? (
                  <p className="mt-1 text-xs text-foreground/58">
                    {copy.questionnaire.deliveryUpdated}: {formatDate(latestDeliveryUpdatedAt, locale, copy.noDate)}
                  </p>
                ) : null}
                {latestDeliveryMessage ? (
                  <p className="mt-2 text-xs text-amber-800">
                    {latestDeliveryMessage}
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>

          <article className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-semibold">{copy.history.title}</h2>
            </div>
            <div className="divide-y divide-border">
              {detail.assessments.length ? (
                detail.assessments.map((assessment) => (
                  <div key={assessment.id} className="p-5">
                    <p className="font-medium">
                      {assessment.score === null
                        ? copy.assessment.noApplicableFindings
                        : `${assessment.score}%`}{" "}
                      · {assessment.status}
                    </p>
                    <p className="mt-1 text-sm text-foreground/58">
                      {formatDate(assessment.assessedAt, locale, copy.noDate)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-5 text-sm text-foreground/58">
                  {copy.history.empty}
                </p>
              )}
            </div>
          </article>
        </section>
      </div>

      {latestSubmittedQuestionnaire && submittedTemplate ? (
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">
              {copy.assessment.submittedTitle}
            </h2>
            <span className="mono rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-3 py-1 text-xs text-[var(--accent)]">
              {copy.assessment.templates[submittedTemplate]}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground/58">
            {formatDate(latestSubmittedQuestionnaire.assessedAt, locale, copy.noDate)}
            {latestSubmittedQuestionnaire.score !== null
              ? ` · ${latestSubmittedQuestionnaire.score}%`
              : ""}
          </p>
          <div className="mt-4 divide-y divide-border">
            {getVendorQuestionSet(submittedTemplate).map((question) => {
              const answer = getAnswer(
                latestSubmittedQuestionnaire.answers,
                question.id,
              );

              return (
                <div
                  key={question.id}
                  className="grid gap-1 py-3 text-sm md:grid-cols-[1fr_160px] md:items-center"
                >
                  <span>
                    {copy.assessment.questions[
                      question.id as keyof typeof copy.assessment.questions
                    ] ?? question.id}
                    {question.legalReference ? (
                      <span className="mono mt-0.5 block text-xs text-foreground/48">
                        {question.legalReference}
                      </span>
                    ) : null}
                  </span>
                  <span className="font-medium md:text-right">
                    {answer
                      ? copy.assessment.answers[
                          answer as keyof typeof copy.assessment.answers
                        ]
                      : copy.emptyValue}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </section>
  );
}
