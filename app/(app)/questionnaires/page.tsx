import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { FileQuestion, ShieldCheck, Sparkles } from "lucide-react";
import { QuestionnaireWorkbench } from "@/components/questionnaires/questionnaire-workbench";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import {
  getGeneratedArtifactForOrg,
  listGeneratedArtifactSummaries,
} from "@/lib/db/queries/generated-artifacts";
import { getQuestionnaireComplianceContext } from "@/lib/db/queries/questionnaires";
import { QUESTIONNAIRE_ARTIFACT_KIND } from "@/lib/questionnaires/artifacts";
import { hasQuestionnaireAiConfig } from "@/lib/questionnaires/provider";
import { QuestionnaireResultSchema, type QuestionnaireResult } from "@/lib/questionnaires/types";

export const dynamic = "force-dynamic";

async function loadQuestionnairePageData(artifactId?: string) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      canGenerate: false,
      controlCount: 14,
      evidenceCount: 9,
      generatedArtifacts: [],
      initialResult: null,
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
      generatedArtifacts: [],
      initialResult: null,
      isDemo: false,
      organisationLocale: null,
      organisationName: null,
      policyCount: 0,
    };
  }

  const context = await getQuestionnaireComplianceContext(session.orgId).catch(
    () => null,
  );
  const [generatedArtifacts, initialResult] = await Promise.all([
    listGeneratedArtifactSummaries({
      clerkOrgId: session.orgId,
      limit: 8,
    }).catch(() => []),
    loadQuestionnaireArtifactForReview({ artifactId, clerkOrgId: session.orgId }),
  ]);

  return {
    canGenerate: Boolean(context && hasQuestionnaireAiConfig()),
    controlCount: context?.controls.length ?? 0,
    evidenceCount: context?.evidence.length ?? 0,
    generatedArtifacts,
    initialResult,
    isDemo: false,
    organisationLocale: context?.organisation?.locale ?? null,
    organisationName: context?.organisation?.name ?? null,
    policyCount: context?.policies.length ?? 0,
  };
}

async function loadQuestionnaireArtifactForReview(input: {
  artifactId?: string;
  clerkOrgId: string;
}): Promise<QuestionnaireResult | null> {
  if (!input.artifactId) {
    return null;
  }

  const artifact = await getGeneratedArtifactForOrg({
    artifactId: input.artifactId,
    clerkOrgId: input.clerkOrgId,
    kind: QUESTIONNAIRE_ARTIFACT_KIND,
  }).catch(() => null);

  if (!artifact) {
    return null;
  }

  const content = artifact.content as { result?: unknown };
  const parsed = QuestionnaireResultSchema.safeParse(content.result);

  if (!parsed.success) {
    return null;
  }

  return {
    ...parsed.data,
    artifactId: artifact.id,
  };
}

function formatArtifactDate(value: Date | null, locale: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function QuestionnairesPage({
  searchParams,
}: {
  searchParams?: Promise<{ artifactId?: string }>;
}) {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const params = await searchParams;
  const data = await loadQuestionnairePageData(params?.artifactId);
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
        <p className="mt-3 max-w-2xl rounded-md border border-border bg-surface-muted p-3 text-xs leading-5 text-foreground/62">
          {copy.disclaimer}
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
        key={data.initialResult?.artifactId ?? "new-questionnaire"}
        canGenerate={data.canGenerate}
        initialResult={data.initialResult}
        organisationName={organisationName}
      />

      <section className="rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-semibold">{copy.history.title}</h2>
          <p className="mt-1 text-sm text-foreground/58">
            {copy.history.subtitle}
          </p>
        </div>
        {data.generatedArtifacts.length > 0 ? (
          <div className="divide-y divide-border">
            {data.generatedArtifacts.map((artifact) => {
              const createdAt = formatArtifactDate(artifact.createdAt, locale);
              const kind =
                artifact.kind === "gap_analysis"
                  ? copy.history.kinds.gapAnalysis
                  : copy.history.kinds.questionnaireAnswers;

              return (
                <article
                  className="grid gap-3 p-5 md:grid-cols-[1fr_auto]"
                  key={artifact.id}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{artifact.title}</h3>
                      <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-foreground/62">
                        {kind}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-xs text-foreground/48">
                      {artifact.id}
                    </p>
                  </div>
                  <div className="text-left text-sm text-foreground/58 md:text-right">
                    <p>{createdAt ?? copy.history.notAvailable}</p>
                    <p className="mt-1 font-mono text-xs">
                      {artifact.model ?? artifact.source}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="p-5 text-sm text-foreground/58">{copy.history.empty}</p>
        )}
      </section>
    </section>
  );
}
