import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

const scores = [
  { slug: "ai-act", score: 64, status: "setup" },
  { slug: "nis2", score: 72, status: "active" },
  { slug: "gdpr", score: 81, status: "active" },
];

export default function DashboardPage() {
  const failingControls = CONTROL_LIBRARY.slice(0, 5);

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

      <div className="grid gap-4 lg:grid-cols-3">
        {scores.map((item) => {
          const framework = FRAMEWORK_LIBRARY.find((fw) => fw.slug === item.slug);
          return (
            <article
              key={item.slug}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/58">{framework?.regulator}</p>
                  <h2 className="mt-1 text-xl font-semibold">{framework?.nameCs}</h2>
                </div>
                <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                  {item.status}
                </span>
              </div>
              <p className="mt-6 font-mono text-4xl font-semibold text-primary">
                {item.score}%
              </p>
              <div className="mt-4 h-2 rounded-full bg-surface-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Prioritní kontroly</h2>
          </div>
          <div className="divide-y divide-border">
            {failingControls.map((control, index) => (
              <Link
                key={control.key}
                href={`/controls/${control.key}`}
                className="grid gap-3 p-5 hover:bg-surface-muted md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-medium">{control.titleCs}</p>
                  <p className="mt-1 text-sm text-foreground/58">{control.category}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm text-foreground/64">
                  {index < 2 ? (
                    <AlertTriangle className="h-4 w-4 text-danger" aria-hidden="true" />
                  ) : (
                    <Clock3 className="h-4 w-4 text-warning" aria-hidden="true" />
                  )}
                  {index < 2 ? "fail" : "manual_review"}
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">Co je hotové</h2>
          <p className="mt-2 text-sm leading-6 text-foreground/66">
            Globální knihovna kontrol, AI Act reference, M365 adapter a Drizzle
            schema jsou připravené pro seed a další obrazovky.
          </p>
        </section>
      </div>
    </section>
  );
}
