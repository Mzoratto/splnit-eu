import { auth } from "@clerk/nextjs/server";
import { FileQuestion, ShieldCheck, Sparkles } from "lucide-react";
import { QuestionnaireWorkbench } from "@/components/questionnaires/questionnaire-workbench";
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
      organisationName: "Demo organizace",
      policyCount: 5,
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      canGenerate: false,
      controlCount: 0,
      evidenceCount: 0,
      organisationName: "Organizace",
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
    organisationName: context?.organisation?.name ?? "Organizace",
    policyCount: context?.policies.length ?? 0,
  };
}

export default async function QuestionnairesPage() {
  const data = await loadQuestionnairePageData();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Questionnaire AI
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          Security questionnaires
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
          Auto-answer inbound customer questionnaires using passing controls,
          evidence, and policies already stored in Splnit.eu.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Passing controls</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {data.controlCount}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Used as primary answer context.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Evidence</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {data.evidenceCount}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Automated evidence can support high confidence.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Policies</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {data.policyCount}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Active documents support medium confidence.
          </p>
        </article>
      </div>

      {!data.canGenerate ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          Questionnaire AI requires Clerk, DATABASE_URL and ANTHROPIC_API_KEY.
        </p>
      ) : null}

      <QuestionnaireWorkbench canGenerate={data.canGenerate} />
    </section>
  );
}
