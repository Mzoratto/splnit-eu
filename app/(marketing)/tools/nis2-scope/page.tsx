import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Nis2ScopeChecker } from "@/components/marketing/nis2-scope-checker";
import { normalizeLocale, type Locale } from "@/i18n/routing";

type PageCopy = {
  metadata: Required<Pick<Metadata, "title" | "description">> & { locale: string };
  eyebrow: string;
  title: string;
  lead: string;
  primaryCta: string;
  secondaryCta: string;
  sourcesTitle: string;
  sources: string[];
};

const copy: Record<Locale, PageCopy> = {
  "cs-CZ": {
    eyebrow: "NIS2 SCOPING · ITÁLIE",
    lead:
      "Orientační dvouminutová kontrola pro firmy, které chtějí zjistit, zda mají řešit italskou NIS2 transpozici. Výsledek je jen triáž, ne právní stanovisko.",
    metadata: {
      description:
        "Orientační NIS2 scoping pro Itálii podle D.Lgs. 138/2024 a směrnice NIS2.",
      locale: "cs_CZ",
      title: "NIS2 scoping | Splnit.eu",
    },
    primaryCta: "Vyplnit scoping",
    secondaryCta: "Kontaktovat Splnit.eu",
    sources: [
      "D.Lgs. 4 settembre 2024, n. 138, Gazzetta Ufficiale Serie Generale n. 230 del 01-10-2024.",
      "Directive (EU) 2022/2555, NIS2.",
    ],
    sourcesTitle: "Použité zdroje",
    title: "Zjistěte, jestli se vás může týkat NIS2 v Itálii.",
  },
  "en-EU": {
    eyebrow: "NIS2 SCOPING · ITALY",
    lead:
      "A two-minute indicative check for companies that need to understand whether the Italian NIS2 transposition may matter. This is triage, not legal advice.",
    metadata: {
      description:
        "Indicative NIS2 scoping for Italy based on D.Lgs. 138/2024 and the NIS2 Directive.",
      locale: "en_EU",
      title: "NIS2 scoping | Splnit.eu",
    },
    primaryCta: "Start scoping",
    secondaryCta: "Contact Splnit.eu",
    sources: [
      "D.Lgs. 4 settembre 2024, n. 138, Gazzetta Ufficiale Serie Generale n. 230 del 01-10-2024.",
      "Directive (EU) 2022/2555, NIS2.",
    ],
    sourcesTitle: "Sources used",
    title: "Check whether NIS2 in Italy may apply to you.",
  },
  "it-IT": {
    eyebrow: "SCOPING NIS2 · ITALIA",
    lead:
      "Una verifica indicativa di due minuti per capire se la trasposizione italiana NIS2 può riguardarvi. È triage operativo, non consulenza legale.",
    metadata: {
      description:
        "Scoping NIS2 indicativo per l'Italia basato su D.Lgs. 138/2024 e Direttiva NIS2.",
      locale: "it_IT",
      title: "Scoping NIS2 | Splnit.eu",
    },
    primaryCta: "Inizia lo scoping",
    secondaryCta: "Contatta Splnit.eu",
    sources: [
      "D.Lgs. 4 settembre 2024, n. 138, Gazzetta Ufficiale Serie Generale n. 230 del 01-10-2024.",
      "Direttiva (UE) 2022/2555, NIS2.",
    ],
    sourcesTitle: "Fonti utilizzate",
    title: "Capite se NIS2 in Italia può riguardarvi.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = copy[locale].metadata;

  return {
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      locale: metadata.locale,
    },
  };
}

export default async function Nis2ScopePage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const page = copy[locale];

  return (
    <MarketingShell>
      <main>
        <section data-hero className="px-5 pb-14 pt-32">
          <div className="mx-auto max-w-5xl">
            <span className="section-tag mb-5">
              <Icon icon="solar:checklist-minimalistic-linear" aria-hidden="true" />
              {page.eyebrow}
            </span>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-normal text-zinc-900 md:text-[68px]">
              {page.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-500">
              {page.lead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#scope-check"
                className="inline-flex justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                {page.primaryCta}
              </a>
              <Link
                href="mailto:hello@splnit.eu?subject=NIS2%20scoping%20Splnit.eu"
                className="inline-flex justify-center rounded-md border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
              >
                {page.secondaryCta}
              </Link>
            </div>
          </div>
        </section>

        <div id="scope-check">
          <Nis2ScopeChecker locale={locale} />
        </div>

        <section className="border-t border-zinc-200/50 px-5 py-12">
          <div className="mx-auto max-w-5xl rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              {page.sourcesTitle}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
              {page.sources.map((source) => (
                <li key={source} className="flex gap-2">
                  <Icon
                    icon="solar:document-text-linear"
                    className="mt-0.5 shrink-0 text-lg text-blue-600"
                    aria-hidden="true"
                  />
                  <span>{source}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Gazzetta Ufficiale
              </a>
              <a
                href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2555"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                EUR-Lex NIS2
              </a>
              <a
                href="mailto:hello@splnit.eu?subject=NIS2%20scoping%20Splnit.eu"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {page.secondaryCta}
              </a>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
