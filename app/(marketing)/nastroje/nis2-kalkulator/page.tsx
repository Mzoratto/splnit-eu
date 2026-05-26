import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { LeadCapture } from "@/components/marketing/lead-capture";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { CollectionPageJsonLd } from "@/components/marketing/structured-data";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { createMarketingMetadata } from "@/lib/seo/metadata";

type PageCopy = {
  metadata: Required<Pick<Metadata, "title" | "description">> & { locale: string };
  eyebrow: string;
  title: string;
  lead: string;
  primaryCta: string;
  secondaryCta: string;
  noteTitle: string;
  noteBody: string;
};

const copy: Record<Locale, PageCopy> = {
  "cs-CZ": {
    eyebrow: "Bezplatný regulatorní profil",
    lead:
      "Vyberte velikost a odvětví firmy. Kalkulátor ukáže, které oblasti EU compliance stojí za první posouzení: NIS2, GDPR, EU AI Act, ISO 27001 nebo CSRD.",
    metadata: {
      description:
        "Bezplatný přehled pro české firmy: koho se týká NIS2, kdy řešit GDPR povinnosti SME a jak začít s EU compliance bez registrace.",
      locale: "cs_CZ",
      title: "Které EU předpisy se vás týkají? Bezplatný přehled | Splnit.eu",
    },
    noteBody:
      "Výsledek je orientační triáž, ne právní stanovisko. U NIS2 vždy ověřte konkrétní regulovanou službu, velikost organizace a český režim podle ZoKB.",
    noteTitle: "Jak výsledek číst",
    primaryCta: "Spustit kalkulátor",
    secondaryCta: "Otevřít přehled předpisů",
    title: "Které EU předpisy se vás mohou týkat?",
  },
  "en-EU": {
    eyebrow: "Free regulatory profile",
    lead:
      "Select company size and sector. The checker highlights which EU compliance areas deserve a first review: NIS2, GDPR, the EU AI Act, ISO 27001, or CSRD.",
    metadata: {
      description:
        "Free overview for EU SMBs: who may fall under NIS2, when GDPR duties matter, and how to start EU compliance without registration.",
      locale: "en_EU",
      title: "Which EU rules may apply to you? Free checker | Splnit.eu",
    },
    noteBody:
      "The result is indicative triage, not legal advice. For NIS2, always verify the concrete regulated service, organisation size, and local transposition.",
    noteTitle: "How to read the result",
    primaryCta: "Start checker",
    secondaryCta: "Open regulation overview",
    title: "Which EU rules may apply to your company?",
  },
  "it-IT": {
    eyebrow: "Profilo normativo gratuito",
    lead:
      "Selezionate dimensione e settore dell'azienda. Il calcolatore evidenzia quali aree compliance UE meritano una prima verifica: NIS2, GDPR, EU AI Act, ISO 27001 o CSRD.",
    metadata: {
      description:
        "Panoramica gratuita per PMI europee: quando NIS2 può applicarsi, quando contano gli obblighi GDPR e come iniziare senza registrazione.",
      locale: "it_IT",
      title: "Quali norme UE possono riguardarvi? Calcolatore gratuito | Splnit.eu",
    },
    noteBody:
      "Il risultato è una triage indicativa, non consulenza legale. Per NIS2 verificate sempre il servizio regolato concreto, la dimensione dell'organizzazione e la trasposizione locale.",
    noteTitle: "Come leggere il risultato",
    primaryCta: "Avvia il calcolatore",
    secondaryCta: "Apri panoramica normative",
    title: "Quali norme UE possono riguardare la vostra azienda?",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = copy[locale].metadata;

  return createMarketingMetadata({
    description: metadata.description ?? "",
    locale,
    path: "/nastroje/nis2-kalkulator",
    title: String(metadata.title),
  });
}

export default async function Nis2CalculatorPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const page = copy[locale];

  return (
    <MarketingShell>
      <CollectionPageJsonLd
        name={page.title}
        path={getLocalizedMarketingPath("/nastroje/nis2-kalkulator", locale)}
        description={String(page.metadata.description)}
      />
      <main>
        <section data-hero className="border-b border-border bg-white px-5 pb-16 pt-36">
          <div className="mx-auto max-w-5xl">
            <span className="section-tag mb-5">
              <Icon icon="solar:clipboard-check-linear" aria-hidden="true" />
              {page.eyebrow}
            </span>
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-normal text-foreground md:text-[68px]">
              {page.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-foreground/62">
              {page.lead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#checker"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                {page.primaryCta}
                <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
              </a>
              <Link
                href={getLocalizedMarketingPath("/predpisy", locale)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-muted"
              >
                <Icon icon="solar:book-linear" className="text-zinc-400" aria-hidden="true" />
                {page.secondaryCta}
              </Link>
            </div>
          </div>
        </section>

        <section id="checker" className="bg-background px-5 py-20">
          <div className="mx-auto max-w-4xl">
            <LeadCapture source="nis2 calculator" />
          </div>
        </section>

        <section className="border-t border-border bg-white px-5 py-16">
          <div className="mx-auto max-w-4xl rounded-lg border border-border bg-surface-muted p-6">
            <h2 className="text-xl font-semibold text-foreground">{page.noteTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-foreground/62">{page.noteBody}</p>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
