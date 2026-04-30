import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

export default function FrameworksPage() {
  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Frameworky
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          Regulace a standardy
        </h1>
        <p className="mt-3 text-base leading-7 text-foreground/68">
          Vyberte framework, spusťte assessment a sledujte stav namapovaných kontrol.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {FRAMEWORK_LIBRARY.map((framework) => (
          <article
            key={framework.slug}
            className="rounded-lg border border-border bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground/58">{framework.regulator}</p>
                <h2 className="mt-1 text-xl font-semibold">{framework.nameCs}</h2>
              </div>
              <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <p className="mt-3 min-h-16 text-sm leading-6 text-foreground/64">
              {framework.descriptionCs}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/frameworks/${framework.slug}`}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
              >
                Otevřít
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={`/frameworks/${framework.slug}/setup`}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
              >
                Assessment
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
