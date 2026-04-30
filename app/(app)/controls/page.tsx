import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CONTROL_LIBRARY } from "@/lib/controls/library";

export default function ControlsPage() {
  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Kontroly
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          Knihovna kontrol
        </h1>
        <p className="mt-3 text-base leading-7 text-foreground/68">
          Sdílené kontroly propojují frameworky, manuální evidenci a automatické testy.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CONTROL_LIBRARY.map((control) => (
          <article
            key={control.key}
            className="rounded-lg border border-border bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground/58">{control.category}</p>
                <h2 className="mt-1 text-lg font-semibold">{control.titleCs}</h2>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground/64">
              {control.descriptionCs ?? control.titleEn}
            </p>
            <Link
              href={`/controls/${control.key}`}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
            >
              Otevřít kontrolu
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
