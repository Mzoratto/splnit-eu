import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Nis2ReadinessCheck } from "@/components/marketing/nis2-readiness-check";
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
    eyebrow: "Bezplatný NIS2 check",
    lead:
      "Dvě minuty, 12 otázek podle oblastí vyhlášky č. 410/2025 Sb. Zjistíte, zda pravděpodobně spadáte pod nový kybernetický zákon (264/2025 Sb.), a uvidíte připravenost po jednotlivých oblastech — hned a bez registrace.",
    metadata: {
      description:
        "Bezplatný check pro české firmy: spadáte pod nový kybernetický zákon (NIS2)? 12 otázek podle vyhlášky č. 410/2025 Sb., výsledek hned a bez registrace.",
      locale: "cs_CZ",
      title: "Spadáte pod NIS2? Bezplatný check podle vyhlášky 410/2025 | Splnit.eu",
    },
    noteBody:
      "Výsledek je orientační triáž, ne právní stanovisko. U NIS2 vždy ověřte konkrétní regulovanou službu v oficiální kalkulačce NÚKIB a velikost organizace včetně propojených podniků.",
    noteTitle: "Jak výsledek číst",
    primaryCta: "Spustit check",
    secondaryCta: "Otevřít přehled předpisů",
    title: "Spadáte pod nový kybernetický zákon? A jak jste připraveni?",
  },
  "en-EU": {
    eyebrow: "Free NIS2 check",
    lead:
      "Two minutes, 12 questions following the areas of Czech Decree No. 410/2025 Coll. See whether the new Czech cybersecurity act (264/2025 Coll.) likely applies and your readiness per area — immediately, no registration.",
    metadata: {
      description:
        "Free check for companies in Czechia: does the new cybersecurity act (NIS2) apply? 12 questions per Decree No. 410/2025 Coll., instant open results.",
      locale: "en_EU",
      title: "Does Czech NIS2 apply to you? Free readiness check | Splnit.eu",
    },
    noteBody:
      "The result is indicative triage, not legal advice. Always verify the concrete regulated service in NÚKIB's official calculator and your organisation size including linked enterprises.",
    noteTitle: "How to read the result",
    primaryCta: "Start the check",
    secondaryCta: "Open regulation overview",
    title: "Does the new Czech cybersecurity act apply — and how ready are you?",
  },
  "it-IT": {
    eyebrow: "Check NIS2 gratuito",
    lead:
      "Due minuti, 12 domande secondo le aree del decreto ceco n. 410/2025. Scoprite se la nuova legge ceca sulla cybersicurezza (264/2025) probabilmente vi riguarda e la vostra preparazione per area — subito, senza registrazione.",
    metadata: {
      description:
        "Check gratuito per aziende attive in Cechia: la nuova legge sulla cybersicurezza (NIS2) vi riguarda? 12 domande secondo il decreto n. 410/2025, risultato immediato.",
      locale: "it_IT",
      title: "La NIS2 ceca vi riguarda? Check gratuito | Splnit.eu",
    },
    noteBody:
      "Il risultato è una triage indicativa, non consulenza legale. Verificate sempre il servizio regolato concreto nel calcolatore ufficiale NÚKIB e la dimensione incluse le imprese collegate.",
    noteTitle: "Come leggere il risultato",
    primaryCta: "Avvia il check",
    secondaryCta: "Apri panoramica normative",
    title: "La nuova legge ceca sulla cybersicurezza vi riguarda — e quanto siete pronti?",
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
            <Nis2ReadinessCheck />
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
