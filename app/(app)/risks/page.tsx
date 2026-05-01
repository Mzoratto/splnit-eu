import { auth } from "@clerk/nextjs/server";
import { Download, Flame, Plus, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { hasDatabaseUrl } from "@/lib/db";
import { listRiskItemsForOrg } from "@/lib/db/queries/risks";
import { COMMON_CZECH_SME_RISKS } from "@/lib/risks/common";
import {
  createRiskAction,
  seedCommonRisksAction,
  updateRiskStatusAction,
} from "./actions";

export const dynamic = "force-dynamic";

type RiskItem = Awaited<ReturnType<typeof listRiskItemsForOrg>>[number];

async function loadRisks() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return getDemoData();
  }

  const session = await auth();

  if (!session.orgId) {
    return getDemoData();
  }

  const risks = await listRiskItemsForOrg(session.orgId).catch(() => []);

  return {
    canMutate: true,
    risks,
  };
}

function getDemoData(): {
  canMutate: boolean;
  risks: RiskItem[];
} {
  return {
    canMutate: false,
    risks: COMMON_CZECH_SME_RISKS.map((risk, index) => ({
      category: risk.category,
      clerkOrgId: "demo",
      createdAt: new Date(),
      description: risk.description,
      dueDate: index < 4 ? "2026-06-30" : null,
      id: `demo-risk-${index}`,
      impact: risk.impact,
      likelihood: risk.likelihood,
      owner: risk.owner,
      riskScore: risk.likelihood * risk.impact,
      status: index < 3 ? "mitigating" : "open",
      title: risk.title,
      updatedAt: new Date(),
    })),
  };
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "nenaplánováno";
  }

  return new Intl.DateTimeFormat("cs-CZ").format(new Date(value));
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

function RiskMatrix({ risks }: { risks: RiskItem[] }) {
  const cell = 42;
  const margin = 32;
  const size = cell * 5 + margin;

  return (
    <svg
      aria-label="Risk matrix likelihood by impact"
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
        likelihood
      </text>
      <text fill="#71717a" fontSize="10" transform="rotate(-90 8 145)" x="8" y="145">
        impact
      </text>
    </svg>
  );
}

export default async function RisksPage() {
  const { canMutate, risks } = await loadRisks();
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
        eyebrow="Risk register"
        title="Rizika"
        subtitle="ISO 27001 risk register se skóre likelihood × impact, vlastníkem, termínem a stavem mitigace."
        actions={
          <a href="/api/risks/register-report" className="btn btn-secondary">
            Export ISO PDF
            <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </a>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="metric-card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Rizika</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">{risks.length}</p>
          <p className="mt-2 text-sm text-foreground/58">
            Celkem položek v registru.
          </p>
        </article>
        <article className="metric-card">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Vysoká rizika</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">
            {highRisks.length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">Skóre 12 a více.</p>
        </article>
        <article className="metric-card">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Průměrné skóre</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">{averageScore}</p>
          <p className="mt-2 text-sm text-foreground/58">Likelihood × impact.</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.4fr]">
        <section className="space-y-4">
          <article className="card">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
              <h2 className="text-lg font-medium">Nové riziko</h2>
            </div>
            <form action={createRiskAction} className="mt-5 space-y-4">
              <label className="grid gap-2 text-xs font-medium text-foreground/68">
                Název
                <input
                  name="title"
                  required
                  disabled={!canMutate}
                  className={fieldClass()}
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  Likelihood
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
                  Impact
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
                  Kategorie
                  <input
                    name="category"
                    disabled={!canMutate}
                    className={fieldClass()}
                  />
                </label>
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  Owner
                  <input
                    name="owner"
                    disabled={!canMutate}
                    className={fieldClass()}
                  />
                </label>
              </div>
              <label className="grid gap-2 text-xs font-medium text-foreground/68">
                Due date
                <input
                  name="dueDate"
                  type="date"
                  disabled={!canMutate}
                  className={fieldClass("font-mono")}
                />
              </label>
              <label className="grid gap-2 text-xs font-medium text-foreground/68">
                Mitigation notes
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
                Přidat riziko
                <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </button>
            </form>
          </article>
          <article className="card">
            <h2 className="text-lg font-medium">Běžná SME rizika</h2>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              Předvyplní 10 běžných rizik pro české MSP, pokud je registr prázdný.
            </p>
            <form action={seedCommonRisksAction} className="mt-4">
              <button
                type="submit"
                disabled={!canMutate || risks.length > 0}
                className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Předvyplnit registr
              </button>
            </form>
          </article>
          <article className="card">
            <h2 className="text-lg font-medium">Risk matrix</h2>
            <div className="mt-4">
              <RiskMatrix risks={risks} />
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-medium">Registr</h2>
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
                        <StatusPill tone={scoreTone(score)}>SCORE {score}</StatusPill>
                        <StatusPill tone={statusTone(risk.status)}>
                          {risk.status.toUpperCase()}
                        </StatusPill>
                      </div>
                      <p className="mt-1 text-sm text-foreground/58">
                        {risk.category ?? "n/a"} · L{risk.likelihood} × I{risk.impact}
                      </p>
                      <p className="mt-1 text-sm text-foreground/58">
                        Owner {risk.owner ?? "n/a"} · due {formatDate(risk.dueDate)}
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
                        <option value="open">open</option>
                        <option value="mitigating">mitigating</option>
                        <option value="accepted">accepted</option>
                        <option value="closed">closed</option>
                      </select>
                      <button
                        type="submit"
                        disabled={!canMutate}
                        className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Uložit
                      </button>
                    </form>
                  </article>
                );
              })
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                Registr je prázdný. Přidejte riziko nebo použijte předvyplnění.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
