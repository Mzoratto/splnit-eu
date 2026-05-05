import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import {
  getFrameworkDisplayDescription,
  getFrameworkDisplayName,
  getFrameworkDisplayRegulator,
} from "@/lib/frameworks/localization";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

export default async function FrameworksPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getMessagesForLocale(locale).frameworks;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={copy.index.eyebrow}
        title={copy.index.title}
        subtitle={copy.index.subtitle}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {FRAMEWORK_LIBRARY.map((framework) => (
          <article
            key={framework.slug}
            className="card interactive-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground/58">
                  {getFrameworkDisplayRegulator(
                    framework,
                    locale,
                    copy.regulators,
                  )}
                </p>
                <h2 className="mt-1 text-lg font-medium">
                  {getFrameworkDisplayName(framework, locale)}
                </h2>
              </div>
              <ClipboardCheck
                className="h-5 w-5 text-primary"
                aria-hidden="true"
                strokeWidth={1.5}
              />
            </div>
            <p className="mt-3 min-h-16 text-sm leading-6 text-foreground/64">
              {getFrameworkDisplayDescription(
                framework,
                locale,
                copy.descriptions,
              )}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/frameworks/${framework.slug}`}
                className="btn btn-secondary"
              >
                {copy.index.open}
                <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </Link>
              <Link
                href={`/frameworks/${framework.slug}/setup`}
                className="btn btn-primary"
              >
                {copy.index.assessment}
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
