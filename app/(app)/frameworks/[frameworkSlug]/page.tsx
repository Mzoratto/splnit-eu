import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import { generateGapReportAction } from "@/app/(app)/frameworks/[frameworkSlug]/actions";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { hasDatabaseUrl } from "@/lib/db";
import { getFrameworkDetail } from "@/lib/db/queries/framework-assessment";
import { CSRD_SUPPLY_CHAIN_QUESTIONNAIRE } from "@/lib/frameworks/csrd";
import {
  ISO27001_ANNEX_A_MAPPINGS,
  ISO27001_CERTIFICATION_BODIES,
} from "@/lib/frameworks/iso27001-annex-a";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

type FrameworkControl = {
  articleRef: string | null;
  category: string | null;
  description: string | null;
  isAutomated: boolean;
  key: string;
  requirementLevel: string;
  status: string | null;
  title: string;
  updatedAt: Date | null;
};

type GapReport = {
  blobUrl: string | null;
  createdAt: Date | null;
  id: string;
  title: string;
};

const statusLabels: Record<string, string> = {
  fail: "Nesplněno",
  manual_review: "Částečně",
  not_applicable: "N/A",
  pass: "Splněno",
  unknown: "Neznámé",
  warning: "Varování",
};

function getStatusClass(status: string | null) {
  if (status === "pass" || status === "not_applicable") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "fail") {
    return "bg-red-50 text-red-700";
  }

  if (status === "manual_review" || status === "warning") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-surface-muted text-foreground/64";
}

function getFallbackControls(frameworkSlug: string): FrameworkControl[] {
  if (frameworkSlug === "iso27001") {
    return ISO27001_ANNEX_A_MAPPINGS.flatMap((mapping) => {
      const control = CONTROL_LIBRARY.find(
        (item) => item.key === mapping.controlKey,
      );

      if (!control) {
        return [];
      }

      return {
        articleRef: mapping.articleRef,
        category: control.category,
        description: control.descriptionCs ?? null,
        isAutomated: control.isAutomated,
        key: control.key,
        requirementLevel: "mandatory",
        status: "unknown",
        title: control.titleCs,
        updatedAt: null,
      };
    });
  }

  return CONTROL_LIBRARY.flatMap((control) => {
    const mapping = control.frameworkMappings.find(
      (item) => item.frameworkSlug === frameworkSlug,
    );

    if (!mapping) {
      return [];
    }

    return {
      articleRef: mapping.articleRef,
      category: control.category,
      description: control.descriptionCs ?? null,
      isAutomated: control.isAutomated,
      key: control.key,
      requirementLevel: mapping.level,
      status: "unknown",
      title: control.titleCs,
      updatedAt: null,
    };
  });
}

function calculateScore(controls: FrameworkControl[]) {
  const relevantControls = controls.filter(
    (control) => control.status !== "not_applicable",
  );

  if (relevantControls.length === 0) {
    return 100;
  }

  const total = relevantControls.reduce((sum, control) => {
    if (control.status === "pass") {
      return sum + 1;
    }

    if (control.status === "manual_review" || control.status === "warning") {
      return sum + 0.5;
    }

    return sum;
  }, 0);

  return Math.round((total / relevantControls.length) * 100);
}

async function loadFrameworkData(frameworkSlug: string) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return null;
  }

  const session = await auth();

  if (!session.orgId) {
    return null;
  }

  try {
    return getFrameworkDetail({
      clerkOrgId: session.orgId,
      frameworkSlug,
    });
  } catch {
    return null;
  }
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 46;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 116 116">
        <circle
          cx="58"
          cy="58"
          fill="none"
          r="46"
          stroke="currentColor"
          strokeWidth="9"
          className="text-surface-muted"
        />
        <circle
          cx="58"
          cy="58"
          fill="none"
          r="46"
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

export default async function FrameworkDetailPage({
  params,
}: {
  params: Promise<{ frameworkSlug: string }>;
}) {
  const { frameworkSlug } = await params;
  const seedFramework = FRAMEWORK_LIBRARY.find((item) => item.slug === frameworkSlug);

  if (!seedFramework) {
    notFound();
  }

  const detail = await loadFrameworkData(frameworkSlug);
  const controls = detail?.controls.length
    ? detail.controls
    : getFallbackControls(frameworkSlug);
  const score = detail?.orgFramework?.score ?? calculateScore(controls);
  const openControls = controls.filter((control) =>
    ["fail", "manual_review", "unknown", null].includes(control.status),
  );
  const gapReport: GapReport | null = detail?.gapReport ?? null;
  const canGenerateReport =
    Boolean(detail?.orgFramework) && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const isIso27001 = seedFramework.slug === "iso27001";
  const isCsrd = seedFramework.slug === "csrd";

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {seedFramework.regulator}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {seedFramework.nameCs}
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/68">
            {seedFramework.descriptionCs}
          </p>
        </div>
        <Link
          href={`/frameworks/${seedFramework.slug}/setup`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
        >
          Spustit assessment
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr_1fr]">
        <article className="flex items-center justify-center rounded-lg border border-border bg-surface p-5">
          <ScoreRing score={score} />
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Stav frameworku</h2>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-foreground/58">Kontroly</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold">
                {controls.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-foreground/58">Otevřené</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold text-warning">
                {openControls.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-foreground/58">Termín</dt>
              <dd className="mt-1 text-sm font-medium">
                {seedFramework.mandatoryDeadline ?? "Průběžně"}
              </dd>
            </div>
          </dl>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Gap report</h2>
          </div>
          {gapReport?.blobUrl ? (
            <a
              href={gapReport.blobUrl}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
            >
              Stáhnout poslední PDF
              <Download className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <p className="mt-5 text-sm leading-6 text-foreground/64">
              PDF se vytvoří po prvním vyhodnocení frameworku.
            </p>
          )}
          <form action={generateGapReportAction.bind(null, seedFramework.slug)}>
            <button
              type="submit"
              disabled={!canGenerateReport}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Vygenerovat PDF
              <FileText className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </article>
      </div>

      {isIso27001 ? (
        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">
                ISO 27001 certification package
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground/64">
              ZIP export obsahuje Statement of Applicability, splněné kontroly,
              dostupné důkazy, aktivní politiky a odkazy na certifikační orgány.
            </p>
            <a
              href="/api/frameworks/iso27001/certification-package"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
            >
              Stáhnout ZIP
              <Download className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>

          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Certifikační odkazy</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {ISO27001_CERTIFICATION_BODIES.map((body) => (
                <a
                  key={body.url}
                  href={body.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
                >
                  {body.name}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {isCsrd ? (
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">
              Supply-chain questionnaire template
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              Výchozí sada otázek pro dodavatele a enterprise zákazníky.
            </p>
          </div>
          <ol className="grid gap-3 p-5 md:grid-cols-2">
            {CSRD_SUPPLY_CHAIN_QUESTIONNAIRE.map((question, index) => (
              <li
                key={question}
                className="rounded-md bg-surface-muted p-4 text-sm leading-6"
              >
                <span className="font-mono text-xs text-primary">
                  {(index + 1).toString().padStart(2, "0")}
                </span>{" "}
                {question}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Kontroly a povinnosti</h2>
        </div>
        <div className="divide-y divide-border">
          {controls.map((control) => (
            <article
              key={`${control.articleRef ?? "control"}-${control.key}`}
              className="grid gap-4 p-5 md:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{control.title}</h3>
                  <span
                    className={`rounded-md px-2 py-1 text-xs ${getStatusClass(
                      control.status,
                    )}`}
                  >
                    {statusLabels[control.status ?? "unknown"] ?? control.status}
                  </span>
                </div>
                {control.description ? (
                  <p className="mt-2 text-sm leading-6 text-foreground/64">
                    {control.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-foreground/52">
                  {control.articleRef ?? "Bez reference"} · {control.category} ·{" "}
                  {control.requirementLevel}
                </p>
              </div>
              <div className="flex items-start gap-2 md:justify-end">
                <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-foreground/64">
                  {control.isAutomated ? "Automatická" : "Manuální"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
