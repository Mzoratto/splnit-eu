import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { getMessagesForLocale } from "@/i18n/messages";
import {
  getControlDisplayDescription,
  getControlDisplayTitle,
} from "@/lib/controls/localization";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { getTenantLocale } from "@/lib/i18n/tenant-locale";

type ControlsCopy = ReturnType<typeof getMessagesForLocale>["controlsPage"];

function getCategoryLabel(category: string, copy: ControlsCopy) {
  return copy.categories[category as keyof typeof copy.categories] ?? category;
}

export default async function ControlsPage() {
  const locale = await getTenantLocale();
  const copy = getMessagesForLocale(locale).controlsPage;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={copy.index.eyebrow}
        title={copy.index.title}
        subtitle={copy.index.subtitle}
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
                <h2 className="mt-1 text-lg font-medium">
                  {getControlDisplayTitle(control, locale)}
                </h2>
                <p className="mt-1 text-xs text-foreground/52">
                  {getCategoryLabel(control.category, copy)}
                </p>
              </div>
              <ShieldCheck
                className="h-5 w-5 text-primary"
                aria-hidden="true"
                strokeWidth={1.5}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground/64">
              {getControlDisplayDescription(control, locale)}
            </p>
            <Link
              href={`/controls/${control.key}`}
              className="btn btn-secondary mt-5"
            >
              {copy.index.openControl}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
