import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { FileQuestion, ShieldCheck, Sparkles } from "lucide-react";
import { QuestionnaireWorkbench } from "@/components/questionnaires/questionnaire-workbench";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getQuestionnaireComplianceContext } from "@/lib/db/queries/questionnaires";
import { hasClaudeConfig } from "@/lib/questionnaires/claude";

export const dynamic = "force-dynamic";

async function loadQuestionnairePageData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      canGenerate: false,
      controlCount: 14,
      evidenceCount: 9,
      isDemo: true,
      organisationLocale: null,
      organisationName: null,
      policyCount: 5,
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      canGenerate: false,
      controlCount: 0,
      evidenceCount: 0,
      isDemo: false,
      organisationLocale: null,
      organisationName: null,
      policyCount: 0,
    };
  }

  const context = await getQuestionnaireComplianceContext(session.orgId).catch(
    () => null,
  );

  return {
    canGenerate: Boolean(context && hasClaudeConfig()),
    controlCount: context?.controls.length ?? 0,
    evidenceCount: context?.evidence.length ?? 0,
    isDemo: false,
    organisationLocale: context?.organisation?.locale ?? null,
    organisationName: context?.organisation?.name ?? null,
    policyCount: context?.policies.length ?? 0,
  };
}

export default async function QuestionnairesPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const data = await loadQuestionnairePageData();
  const locale = normalizeLocale(data.organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).questionnairePage;
  const organisationName =
    data.organisationName ??
    (data.isDemo ? copy.fallbacks.demoOrganisation : copy.fallbacks.organisation);

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
          {copy.subtitle}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.metrics.controls}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {data.controlCount}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {copy.metrics.controlsBody}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.metrics.evidence}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {data.evidenceCount}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {copy.metrics.evidenceBody}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.metrics.policies}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {data.policyCount}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {copy.metrics.policiesBody}
          </p>
        </article>
      </div>

      {!data.canGenerate ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          {copy.disabledNotice}
        </p>
      ) : null}

      <QuestionnaireWorkbench
        canGenerate={data.canGenerate}
        organisationName={organisationName}
      />
    </section>
  );
}
