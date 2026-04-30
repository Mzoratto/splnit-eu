import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AlertTriangle, ArrowRight, Clock3, Newspaper } from "lucide-react";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { hasDatabaseUrl } from "@/lib/db";
import { getDashboardData } from "@/lib/db/queries/dashboard";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

const fallbackFrameworkScores = [
  { slug: "ai-act", score: 64, status: "setup" },
  { slug: "nis2", score: 72, status: "active" },
  { slug: "gdpr", score: 81, status: "active" },
];

const fallbackUpdates = [
  {
    frameworkName: "NIS2",
    publishedAt: new Date("2026-04-15T08:00:00.000Z"),
    severity: "info",
    summary: "Tento panel naplní synchronizace NÚKIB feedu v PR-015.",
    title: "Feed regulačních aktualizací je připravený",
  },
];

async function loadDashboardData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);
  const session = clerkConfigured ? await auth() : null;

  if (!session?.orgId || !hasDatabaseUrl()) {
    return null;
  }

  try {
    return await getDashboardData(session.orgId);
  } catch {
    return null;
  }
}

function calculateScore(input: {
  frameworkScores: { score: number | null }[];
  statusRows: { status: string }[];
}) {
  const explicitScores = input.frameworkScores
    .map((item) => item.score)
    .filter((score): score is number => typeof score === "number");

  if (explicitScores.length > 0) {
    return Math.round(
      explicitScores.reduce((total, score) => total + score, 0) /
        explicitScores.length,
    );
  }

  if (input.statusRows.length === 0) {
    return 72;
  }

  const passing = input.statusRows.filter((row) => row.status === "pass").length;
  return Math.round((passing / input.statusRows.length) * 100);
}

function ScoreRing({ score }: { score: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          className="text-surface-muted"
        />
        <circle
          cx="60"
          cy="60"
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="10"
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

export default async function DashboardPage() {
  const data = await loadDashboardData();
  const frameworkScores =
    data?.frameworkScores.length
      ? data.frameworkScores
      : fallbackFrameworkScores.map((item) => {
          const framework = FRAMEWORK_LIBRARY.find((fw) => fw.slug === item.slug);
          return {
            name: framework?.nameCs ?? item.slug,
            regulator: framework?.regulator ?? null,
            score: item.score,
            slug: item.slug,
            status: item.status,
          };
        });
  const priorityControls =
    data?.priorityControls.length
      ? data.priorityControls
      : CONTROL_LIBRARY.slice(0, 5).map((control, index) => ({
          category: control.category,
          key: control.key,
          status: index < 2 ? "fail" : "manual_review",
          title: control.titleCs,
        }));
  const updates = data?.updates.length ? data.updates : fallbackUpdates;
  const score = calculateScore({
    frameworkScores,
    statusRows: data?.statusRows ?? [],
  });

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Přehled
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Compliance dashboard
          </h1>
          <p className="mt-2 text-foreground/64">
            Skóre je počítané z denormalizovaných stavů kontrol.
          </p>
        </div>
        <Link
          href="/frameworks/ai-act/setup"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
        >
          Spustit AI Act wizard
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.6fr]">
        <article className="flex items-center gap-6 rounded-lg border border-border bg-surface p-5">
          <ScoreRing score={score} />
          <div>
            <p className="text-sm text-foreground/58">Celkové skóre</p>
            <h2 className="mt-1 text-xl font-semibold">Aktivní frameworky</h2>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              Průměr aktivních frameworků nebo poměr splněných kontrol.
            </p>
          </div>
        </article>

        <div className="grid gap-4 md:grid-cols-3">
          {frameworkScores.map((item) => (
            <article
              key={item.slug}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/58">{item.regulator}</p>
                  <h2 className="mt-1 text-xl font-semibold">{item.name}</h2>
                </div>
                <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                  {item.status}
                </span>
              </div>
              <p className="mt-6 font-mono text-4xl font-semibold text-primary">
                {item.score ?? 0}%
              </p>
              <div className="mt-4 h-2 rounded-full bg-surface-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${item.score ?? 0}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Prioritní kontroly</h2>
          </div>
          <div className="divide-y divide-border">
            {priorityControls.map((control) => (
              <Link
                key={control.key}
                href={`/controls/${control.key}`}
                className="grid gap-3 p-5 hover:bg-surface-muted md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-medium">{control.title}</p>
                  <p className="mt-1 text-sm text-foreground/58">
                    {control.category}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm text-foreground/64">
                  {control.status === "fail" ? (
                    <AlertTriangle className="h-4 w-4 text-danger" aria-hidden="true" />
                  ) : (
                    <Clock3 className="h-4 w-4 text-warning" aria-hidden="true" />
                  )}
                  {control.status}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <Newspaper className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Regulační aktualizace</h2>
          </div>
          <div className="divide-y divide-border">
            {updates.map((update) => (
              <article
                key={`${update.title}-${update.publishedAt.toISOString()}`}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-medium">{update.title}</h3>
                  <span className="rounded-md bg-surface-muted px-2 py-1 text-[11px]">
                    {update.severity}
                  </span>
                </div>
                <p className="mt-2 text-xs text-foreground/58">
                  {update.frameworkName} ·{" "}
                  {new Intl.DateTimeFormat("cs-CZ").format(update.publishedAt)}
                </p>
                {update.summary ? (
                  <p className="mt-2 text-sm leading-6 text-foreground/64">
                    {update.summary}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
