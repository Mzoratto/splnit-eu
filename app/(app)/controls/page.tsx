import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { CONTROL_LIBRARY } from "@/lib/controls/library";

export default function ControlsPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Kontroly"
        title="Knihovna kontrol"
        subtitle="Sdílené kontroly propojují frameworky, manuální evidenci a automatické testy."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {CONTROL_LIBRARY.map((control) => (
          <article
            key={control.key}
            className="card interactive-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-foreground/52">
                  {control.key}
                </p>
                <h2 className="mt-1 text-lg font-medium">{control.titleCs}</h2>
                <p className="mt-1 text-xs text-foreground/52">
                  {control.category}
                </p>
              </div>
              <ShieldCheck
                className="h-5 w-5 text-primary"
                aria-hidden="true"
                strokeWidth={1.5}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground/64">
              {control.descriptionCs ?? control.titleEn}
            </p>
            <Link
              href={`/controls/${control.key}`}
              className="btn btn-secondary mt-5"
            >
              Otevřít kontrolu
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
