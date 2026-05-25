import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import { generateGapReportAction } from "@/app/(app)/frameworks/[frameworkSlug]/actions";
import { AnimatedScoreRing } from "@/components/app/animated-score-ring";
import { DataModeNotice } from "@/components/app/data-mode-notice";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { DocumentDownloadButton } from "@/components/documents/document-download-button";
import { TemplateSection } from "@/components/templates/template-section";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { getControlDisplayTitle } from "@/lib/controls/localization";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { hasDatabaseUrl } from "@/lib/db";
import { getFrameworkDetail } from "@/lib/db/queries/framework-assessment";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { isLocalDemoDataEnabled } from "@/lib/demo-mode";
import { FLAGS, isFeatureEnabled } from "@/lib/features/flags";
import { CSRD_SUPPLY_CHAIN_QUESTIONNAIRE } from "@/lib/frameworks/csrd";
import {
  ISO27001_ANNEX_A_MAPPINGS,
  ISO27001_CERTIFICATION_BODIES,
} from "@/lib/frameworks/iso27001-annex-a";
import {
  getFrameworkDisplayDescription,
  getFrameworkDisplayName,
  getFrameworkDisplayRegulator,
} from "@/lib/frameworks/localization";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

type FrameworkControl = {
  articleRef: string | null;
  category: string | null;
  description: string | null;
  descriptionCs?: string | null;
  isAutomated: boolean;
  key: string;
  requirementLevel: string;
  status: string | null;
  title: string;
  titleCs?: string;
  titleEn?: string;
  updatedAt: Date | null;
};

type GapReport = {
  blobUrl: string | null;
  createdAt: Date | null;
  id: string;
  title: string;
};

const statusLabels: Record<string, string> = {
  fail: "FAIL",
  manual_review: "WARN",
  not_applicable: "N/A",
  pass: "PASS",
  unknown: "PENDING",
  warning: "WARN",
};

type FrameworksCopy = ReturnType<typeof getMessagesForLocale>["frameworks"];

function getStatusTone(status: string | null): StatusPillTone {
  if (status === "pass" || status === "not_applicable") {
    return "pass";
  }

  if (status === "fail") {
    return "fail";
  }

  if (status === "manual_review" || status === "warning") {
    return "warn";
  }

  return "neutral";
}

function getControlTitle(control: FrameworkControl, locale: Locale) {
  return getControlDisplayTitle(control, locale);
}

function getControlDescription(control: FrameworkControl, locale: Locale) {
  if (locale !== "cs-CZ") {
    return null;
  }

  return control.descriptionCs ?? control.description;
}

function formatDeadline(deadline: string | null, copy: FrameworksCopy) {
  return deadline ?? copy.detail.continuous;
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
        descriptionCs: control.descriptionCs ?? null,
        isAutomated: control.isAutomated,
        key: control.key,
        requirementLevel: "mandatory",
        status: "unknown",
        title: control.titleCs,
        titleCs: control.titleCs,
        titleEn: control.titleEn,
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
      descriptionCs: control.descriptionCs ?? null,
      isAutomated: control.isAutomated,
      key: control.key,
      requirementLevel: mapping.level,
      status: "unknown",
      title: control.titleCs,
      titleCs: control.titleCs,
      titleEn: control.titleEn,
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
    const [detail, organisation, smartDocumentsEnabled] = await Promise.all([
      getFrameworkDetail({
        clerkOrgId: session.orgId,
        frameworkSlug,
      }),
      getOrganisationByClerkOrgId(session.orgId),
      isFeatureEnabled(session.orgId, FLAGS.SMART_DOCUMENT_GENERATION),
    ]);

    return {
      detail,
      organisationLocale: organisation?.locale ?? null,
      smartDocumentsEnabled,
    };
  } catch {
    return null;
  }
}

export default async function FrameworkDetailPage({
  params,
}: {
  params: Promise<{ frameworkSlug: string }>;
}) {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { frameworkSlug } = await params;
  const seedFramework = FRAMEWORK_LIBRARY.find((item) => item.slug === frameworkSlug);

  if (!seedFramework) {
    notFound();
  }

  const frameworkData = await loadFrameworkData(frameworkSlug);
  const locale = normalizeLocale(frameworkData?.organisationLocale) ?? requestLocale;
  const messages = getMessagesForLocale(locale);
  const copy = messages.frameworks;
  const detail = frameworkData?.detail ?? null;
  const useDemoData = !frameworkData && isLocalDemoDataEnabled();
  const dataNotice = useDemoData
    ? {
        body: messages.appDataNotice.demoBody,
        title: messages.appDataNotice.demoTitle,
      }
    : !frameworkData
      ? {
          body: messages.appDataNotice.unavailableBody,
          title: messages.appDataNotice.unavailableTitle,
        }
      : null;
  const hasEnrolledFramework = Boolean(detail?.orgFramework);
  const controls = hasEnrolledFramework && detail?.controls.length
    ? detail.controls
    : useDemoData
      ? getFallbackControls(frameworkSlug)
      : [];
  const score =
    detail?.orgFramework?.score ?? (controls.length ? calculateScore(controls) : 0);
  const openControls = controls.filter((control) =>
    ["fail", "manual_review", "unknown", null].includes(control.status),
  );
  const gapReport: GapReport | null = detail?.gapReport ?? null;
  const canGenerateReport =
    Boolean(detail?.orgFramework) && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const isIso27001 = seedFramework.slug === "iso27001";
  const isCsrd = seedFramework.slug === "csrd";
  const supportsSmartDocuments = ["nis2", "gdpr", "ai-act", "iso27001"].includes(
    seedFramework.slug,
  );
  const canGenerateSmartDocuments =
    Boolean(frameworkData?.smartDocumentsEnabled) && supportsSmartDocuments;

  return (
    <section className="space-y-8">
      <PageHeader
        breadcrumb={copy.detail.breadcrumb}
        eyebrow={getFrameworkDisplayRegulator(
          seedFramework,
          locale,
          copy.regulators,
        )}
        title={getFrameworkDisplayName(seedFramework, locale)}
        subtitle={getFrameworkDisplayDescription(
          seedFramework,
          locale,
          copy.descriptions,
        )}
        actions={
          <Link
            href={`/frameworks/${seedFramework.slug}/setup`}
            className="btn btn-primary"
          >
            {copy.detail.runAssessment}
            <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </Link>
        }
      />

      {dataNotice ? (
        <DataModeNotice body={dataNotice.body} title={dataNotice.title} />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[auto_1fr_1fr]">
        <article className="card flex items-center justify-center">
          <AnimatedScoreRing
            label={copy.detail.scoreLabel}
            locale={locale}
            score={score}
          />
        </article>
        <article className="card">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{copy.detail.statusTitle}</h2>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-foreground/58">
                {copy.detail.controlsMetric}
              </dt>
              <dd className="mt-1 font-mono text-2xl font-medium">
                {controls.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-foreground/58">
                {copy.detail.openMetric}
              </dt>
              <dd className="mt-1 font-mono text-2xl font-medium text-warning">
                {openControls.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-foreground/58">
                {copy.detail.deadlineMetric}
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {formatDeadline(seedFramework.mandatoryDeadline, copy)}
              </dd>
            </div>
          </dl>
        </article>
        <article className="card">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Gap report</h2>
          </div>
          {gapReport?.blobUrl ? (
            <a
              href={`/api/policies/${gapReport.id}/download`}
              className="btn btn-secondary mt-5"
            >
              {copy.detail.downloadLatestPdf}
              <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </a>
          ) : (
            <p className="mt-5 text-sm leading-6 text-foreground/64">
              {copy.detail.gapReportEmpty}
            </p>
          )}
          <form action={generateGapReportAction.bind(null, seedFramework.slug)}>
            <button
              type="submit"
              disabled={!canGenerateReport}
              className="btn btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.detail.generatePdf}
              <FileText className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </button>
          </form>
        </article>

        {canGenerateSmartDocuments ? (
          <article className="card">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
              <h2 className="text-lg font-medium">Generovat dokumenty</h2>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <DocumentDownloadButton
                href={`/api/documents/generate/gap-analysis?framework=${encodeURIComponent(seedFramework.slug)}`}
                label="Stáhnout GAP analýzu"
              />
              {isIso27001 ? (
                <DocumentDownloadButton
                  href="/api/documents/generate/soa-iso27001"
                  label="Stáhnout SoA (ISO 27001)"
                />
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-foreground/64">
              Dokument je předvyplněn daty z vaší platformy. Zkontrolujte obsah před sdílením s auditory.
            </p>
          </article>
        ) : null}
      </div>

      {isIso27001 ? (
        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="card">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
              <h2 className="text-lg font-medium">
                {copy.detail.isoPackageTitle}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground/64">
              {copy.detail.isoPackageBody}
            </p>
            <a
              href="/api/frameworks/iso27001/certification-package"
              className="btn btn-secondary mt-5"
            >
              {copy.detail.downloadZip}
              <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </a>
          </article>

          <article className="card">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
              <h2 className="text-lg font-medium">
                {copy.detail.certificationLinksTitle}
              </h2>
            </div>
            <div className="mt-4 grid gap-3">
              {ISO27001_CERTIFICATION_BODIES.map((body) => (
                <a
                  key={body.url}
                  href={body.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary justify-between"
                >
                  {body.name}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      <TemplateSection frameworkSlug={frameworkSlug} variant="app" />

      {isCsrd ? (
        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-medium">
              {copy.detail.csrdQuestionnaireTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              {copy.detail.csrdQuestionnaireBody}
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

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <Gauge className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
          <h2 className="text-lg font-medium">{copy.detail.controlsTitle}</h2>
        </div>
        <div className="divide-y divide-border">
          {controls.map((control) => {
            const controlDescription = getControlDescription(control, locale);

            return (
              <article
                key={`${control.articleRef ?? "control"}-${control.key}`}
                className="grid gap-4 p-4 hover:bg-bg-hover md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        getStatusTone(control.status) === "pass"
                          ? "h-2 w-2 rounded-full bg-status-pass"
                          : getStatusTone(control.status) === "warn"
                            ? "h-2 w-2 rounded-full bg-status-warn"
                            : getStatusTone(control.status) === "fail"
                              ? "h-2 w-2 rounded-full bg-status-fail"
                              : "h-2 w-2 rounded-full bg-status-neutral"
                      }
                      aria-hidden="true"
                    />
                    <span className="font-mono text-xs text-foreground/52">
                      {control.key}
                    </span>
                    <h3 className="text-sm font-medium">
                      {getControlTitle(control, locale)}
                    </h3>
                    <StatusPill tone={getStatusTone(control.status)}>
                      {statusLabels[control.status ?? "unknown"] ?? control.status}
                    </StatusPill>
                  </div>
                  {controlDescription ? (
                    <p className="mt-2 text-sm leading-6 text-foreground/64">
                      {controlDescription}
                    </p>
                  ) : null}
                  <p className="mt-2 font-mono text-xs text-foreground/52">
                    {control.articleRef ?? copy.detail.noReference} ·{" "}
                    {control.category} · {control.requirementLevel}
                  </p>
                </div>
                <div className="flex items-start gap-2 md:justify-end">
                  <span className="rounded-sm bg-surface-muted px-2 py-1 text-xs text-foreground/64">
                    {control.isAutomated
                      ? copy.detail.automated
                      : copy.detail.manual}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
