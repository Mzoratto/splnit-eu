import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { Download, Flame, Plus, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { listRiskItemsForOrg } from "@/lib/db/queries/risks";
import { COMMON_CZECH_SME_RISKS } from "@/lib/risks/common";
import {
  createRiskAction,
  seedCommonRisksAction,
  updateRiskStatusAction,
} from "./actions";

export const dynamic = "force-dynamic";

type RiskItem = Awaited<ReturnType<typeof listRiskItemsForOrg>>[number];
type RisksCopy = ReturnType<typeof getMessagesForLocale>["risks"];

async function loadRisks(requestLocale: Locale) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return getDemoData(getMessagesForLocale(requestLocale).risks);
  }

  const session = await auth();

  if (!session.orgId) {
    return getDemoData(getMessagesForLocale(requestLocale).risks);
  }

  const [risks, organisation] = await Promise.all([
    listRiskItemsForOrg(session.orgId).catch(() => []),
    getOrganisationByClerkOrgId(session.orgId).catch(() => null),
  ]);

  return {
    canMutate: true,
    organisationLocale: organisation?.locale ?? null,
    risks,
  };
}

function getDemoData(copy: RisksCopy): {
  canMutate: boolean;
  organisationLocale: string | null;
  risks: RiskItem[];
} {
  return {
    canMutate: false,
    organisationLocale: null,
    risks: COMMON_CZECH_SME_RISKS.map((risk, index) => ({
      category: copy.demoRisks[index]?.category ?? risk.category,
      clerkOrgId: "demo",
      createdAt: new Date(),
      description: copy.demoRisks[index]?.description ?? risk.description,
      dueDate: index < 4 ? "2026-06-30" : null,
      id: `demo-risk-${index}`,
      impact: risk.impact,
      likelihood: risk.likelihood,
      owner: copy.demoRisks[index]?.owner ?? risk.owner,
      riskScore: risk.likelihood * risk.impact,
      status: index < 3 ? "mitigating" : "open",
      title: copy.demoRisks[index]?.title ?? risk.title,
      updatedAt: new Date(),
    })),
  };
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

function getScore(risk: RiskItem) {
  return risk.riskScore ?? risk.likelihood * risk.impact;
}

function scoreTone(score: number): StatusPillTone {
  if (score >= 20) {
    return "fail";
  }

  if (score >= 12) {
    return "warn";
  }

  if (score >= 6) {
    return "neutral";
  }

  return "pass";
}

function statusTone(status: string): StatusPillTone {
  if (status === "closed") {
    return "pass";
  }

  if (status === "accepted" || status === "mitigating") {
    return "warn";
  }

  return "neutral";
}

function fieldClass(extra = "") {
  return `h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 text-sm text-foreground ${extra}`;
}

function heatColor(score: number) {
  if (score >= 20) {
    return "#fee2e2";
  }

  if (score >= 12) {
    return "#fef3c7";
  }

  if (score >= 6) {
    return "#dbeafe";
  }

  return "#dcfce7";
}

function statusLabel(status: string, copy: RisksCopy) {
  return copy.statuses[status as keyof typeof copy.statuses] ?? status;
}

function RiskMatrix({
  copy,
  risks,
}: {
  copy: RisksCopy;
  risks: RiskItem[];
}) {
  const cell = 42;
  const margin = 32;
  const size = cell * 5 + margin;

  return (
    <svg
      aria-label={copy.matrix.ariaLabel}
      role="img"
      viewBox={`0 0 ${size} ${size}`}
      className="aspect-square w-full max-w-sm"
    >
      {[1, 2, 3, 4, 5].map((likelihood) =>
        [1, 2, 3, 4, 5].map((impact) => {
          const x = margin + (likelihood - 1) * cell;
          const y = (5 - impact) * cell;
          const score = likelihood * impact;

          return (
            <g key={`${likelihood}-${impact}`}>
              <rect
                fill={heatColor(score)}
                height={cell - 2}
                rx="6"
                width={cell - 2}
                x={x}
                y={y}
              />
              <text
                fill="#52525b"
                fontSize="10"
                textAnchor="middle"
                x={x + cell / 2}
                y={y + cell / 2 + 4}
              >
                {score}
              </text>
            </g>
          );
        }),
      )}
      {[1, 2, 3, 4, 5].map((value) => (
        <g key={`axis-${value}`}>
          <text
            fill="#71717a"
            fontSize="10"
            textAnchor="middle"
            x={margin + (value - 1) * cell + cell / 2}
            y={cell * 5 + 16}
          >
            {value}
          </text>
          <text
            fill="#71717a"
            fontSize="10"
            textAnchor="middle"
            x={14}
            y={(5 - value) * cell + cell / 2 + 4}
          >
            {value}
          </text>
        </g>
      ))}
      {risks.map((risk, index) => {
        const x = margin + (risk.likelihood - 1) * cell + cell / 2;
        const y = (5 - risk.impact) * cell + cell / 2;

        return (
          <circle
            key={risk.id}
            cx={x + ((index % 3) - 1) * 5}
            cy={y + (Math.floor(index / 3) % 3 - 1) * 5}
            fill="#18181b"
            r="4"
          />
        );
      })}
      <text fill="#71717a" fontSize="10" x={margin + 54} y={size - 2}>
        {copy.matrix.likelihood}
      </text>
      <text fill="#71717a" fontSize="10" transform="rotate(-90 8 145)" x="8" y="145">
        {copy.matrix.impact}
      </text>
    </svg>
  );
}

export default async function RisksPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { canMutate, organisationLocale, risks } = await loadRisks(requestLocale);
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).risks;
  const highRisks = risks.filter((risk) => getScore(risk) >= 12);
  const averageScore =
    risks.length > 0
      ? Math.round(
          risks.reduce((total, risk) => total + getScore(risk), 0) / risks.length,
        )
      : 0;

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <a href="/api/risks/register-report" className="btn btn-secondary">
            {copy.exportPdf}
            <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </a>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="metric-card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{copy.metrics.totalTitle}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">{risks.length}</p>
          <p className="mt-2 text-sm text-foreground/58">
            {copy.metrics.totalBody}
          </p>
        </article>
        <article className="metric-card">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{copy.metrics.highTitle}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">
            {highRisks.length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">{copy.metrics.highBody}</p>
        </article>
        <article className="metric-card">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{copy.metrics.averageTitle}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">{averageScore}</p>
          <p className="mt-2 text-sm text-foreground/58">{copy.metrics.averageBody}</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.4fr]">
        <section className="space-y-4">
          <article className="card">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
              <h2 className="text-lg font-medium">{copy.form.title}</h2>
            </div>
            <form action={createRiskAction} className="mt-5 space-y-4">
              <label className="grid gap-2 text-xs font-medium text-foreground/68">
                {copy.form.name}
                <input
                  name="title"
                  required
                  disabled={!canMutate}
                  className={fieldClass()}
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  {copy.form.likelihood}
                  <input
                    name="likelihood"
                    type="number"
                    min="1"
                    max="5"
                    defaultValue="3"
                    disabled={!canMutate}
                    className={fieldClass("font-mono")}
                  />
                </label>
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  {copy.form.impact}
                  <input
                    name="impact"
                    type="number"
                    min="1"
                    max="5"
                    defaultValue="3"
                    disabled={!canMutate}
                    className={fieldClass("font-mono")}
                  />
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  {copy.form.category}
                  <input
                    name="category"
                    disabled={!canMutate}
                    className={fieldClass()}
                  />
                </label>
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  {copy.form.owner}
                  <input
                    name="owner"
                    disabled={!canMutate}
                    className={fieldClass()}
                  />
                </label>
              </div>
              <label className="grid gap-2 text-xs font-medium text-foreground/68">
                {copy.form.dueDate}
                <input
                  name="dueDate"
                  type="date"
                  disabled={!canMutate}
                  className={fieldClass("font-mono")}
                />
              </label>
              <label className="grid gap-2 text-xs font-medium text-foreground/68">
                {copy.form.notes}
                <textarea
                  name="description"
                  rows={3}
                  disabled={!canMutate}
                  className="rounded-md border border-border-default bg-[var(--bg-input)] px-3 py-2 text-sm text-foreground"
                />
              </label>
              <button
                type="submit"
                disabled={!canMutate}
                className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.form.add}
                <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </button>
            </form>
          </article>
          <article className="card">
            <h2 className="text-lg font-medium">{copy.seed.title}</h2>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              {copy.seed.body}
            </p>
            <form action={seedCommonRisksAction} className="mt-4">
              <button
                type="submit"
                disabled={!canMutate || risks.length > 0}
                className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.seed.button}
              </button>
            </form>
          </article>
          <article className="card">
            <h2 className="text-lg font-medium">{copy.matrix.title}</h2>
            <div className="mt-4">
              <RiskMatrix copy={copy} risks={risks} />
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-medium">{copy.register.title}</h2>
          </div>
          <div className="divide-y divide-border">
            {risks.length ? (
              risks.map((risk) => {
                const score = getScore(risk);

                return (
                  <article
                    key={risk.id}
                    className="grid gap-4 p-4 hover:bg-bg-hover xl:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{risk.title}</p>
                        <StatusPill tone={scoreTone(score)}>
                          {copy.register.score} {score}
                        </StatusPill>
                        <StatusPill tone={statusTone(risk.status)}>
                          {statusLabel(risk.status, copy)}
                        </StatusPill>
                      </div>
                      <p className="mt-1 text-sm text-foreground/58">
                        {risk.category ?? "n/a"} · L{risk.likelihood} × I{risk.impact}
                      </p>
                      <p className="mt-1 text-sm text-foreground/58">
                        {copy.register.owner} {risk.owner ?? "n/a"} ·{" "}
                        {copy.register.due} {formatDate(risk.dueDate, locale, copy.noDate)}
                      </p>
                      {risk.description ? (
                        <p className="mt-3 text-sm leading-6 text-foreground/64">
                          {risk.description}
                        </p>
                      ) : null}
                    </div>
                    <form
                      action={updateRiskStatusAction.bind(null, risk.id)}
                      className="flex flex-wrap gap-2"
                    >
                      <select
                        name="status"
                        defaultValue={risk.status}
                        disabled={!canMutate}
                        className={fieldClass()}
                      >
                        <option value="open">{copy.statuses.open}</option>
                        <option value="mitigating">{copy.statuses.mitigating}</option>
                        <option value="accepted">{copy.statuses.accepted}</option>
                        <option value="closed">{copy.statuses.closed}</option>
                      </select>
                      <button
                        type="submit"
                        disabled={!canMutate}
                        className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {copy.register.save}
                      </button>
                    </form>
                  </article>
                );
              })
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                {copy.register.empty}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
