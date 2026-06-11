import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { getReadinessReport } from "@/lib/readiness";
import { createMarketingMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type StatusCopy = {
  metadata: Required<Pick<Metadata, "title" | "description">> & { locale: string };
  eyebrow: string;
  title: string;
  lead: string;
  operational: string;
  degraded: string;
  appTitle: string;
  appBody: string;
  healthTitle: string;
  healthBody: string;
  updatesTitle: string;
  updatesBody: string;
  requiredConfigured: string;
  recommendedConfigured: string;
  contact: string;
};

const copy: Record<Locale, StatusCopy> = {
  "cs-CZ": {
    appBody:
      "Veřejný stav je jednoduchý přehled v předběžném přístupu. Detailní incidentovou komunikaci posíláme přímo dotčeným zákazníkům.",
    appTitle: "Aplikace Splnit.eu",
    contact: "Nahlásit problém",
    degraded: "Vyžaduje kontrolu",
    eyebrow: "STATUS · PŘEDBĚŽNÝ PŘÍSTUP",
    healthBody: "Strojově čitelný kontrolní endpoint je dostupný na /api/health.",
    healthTitle: "Kontrolní endpoint",
    lead:
      "Aktuální veřejný stav produkčního prostředí Splnit.eu. Nejde o SLA ani historický uptime report.",
    metadata: {
      description:
        "Jednoduchý veřejný status Splnit.eu v předběžném přístupu.",
      locale: "cs_CZ",
      title: "Status | Splnit.eu",
    },
    operational: "V provozu",
    recommendedConfigured: "Doporučené služby připravené",
    requiredConfigured: "Povinné služby připravené",
    title: "Status Splnit.eu.",
    updatesBody:
      "Při výpadku publikujeme krátkou aktualizaci zde a kontaktujeme zákazníky, kterých se problém týká.",
    updatesTitle: "Aktualizace incidentů",
  },
  "en-EU": {
    appBody:
      "The public status is a simple early-access overview. Detailed incident communication goes directly to affected customers.",
    appTitle: "Splnit.eu application",
    contact: "Report an issue",
    degraded: "Needs attention",
    eyebrow: "STATUS · EARLY ACCESS",
    healthBody: "The machine-readable health endpoint is available at /api/health.",
    healthTitle: "Health endpoint",
    lead:
      "Current public status of the Splnit.eu production environment. This is not an SLA or historical uptime report.",
    metadata: {
      description: "Simple public Splnit.eu status page for early access.",
      locale: "en_EU",
      title: "Status | Splnit.eu",
    },
    operational: "Operational",
    recommendedConfigured: "Recommended services ready",
    requiredConfigured: "Required services ready",
    title: "Splnit.eu status.",
    updatesBody:
      "During an outage, we publish a short update here and contact customers affected by the issue.",
    updatesTitle: "Incident updates",
  },
  "it-IT": {
    appBody:
      "Lo status pubblico è una panoramica semplice per l'accesso anticipato. La comunicazione incidenti dettagliata va direttamente ai clienti coinvolti.",
    appTitle: "Applicazione Splnit.eu",
    contact: "Segnala problema",
    degraded: "Richiede controllo",
    eyebrow: "STATUS · ACCESSO ANTICIPATO",
    healthBody: "L'endpoint di controllo leggibile da macchine è disponibile su /api/health.",
    healthTitle: "Endpoint di controllo",
    lead:
      "Stato pubblico attuale dell'ambiente di produzione Splnit.eu. Non è uno SLA né un report storico di uptime.",
    metadata: {
      description:
        "Pagina status pubblica semplice di Splnit.eu in accesso anticipato.",
      locale: "it_IT",
      title: "Status | Splnit.eu",
    },
    operational: "Operativo",
    recommendedConfigured: "Servizi raccomandati pronti",
    requiredConfigured: "Servizi obbligatori pronti",
    title: "Status Splnit.eu.",
    updatesBody:
      "Durante un disservizio pubblichiamo un breve aggiornamento qui e contattiamo i clienti coinvolti.",
    updatesTitle: "Aggiornamenti incidenti",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = copy[locale].metadata;

  return createMarketingMetadata({
    description: metadata.description ?? "",
    locale,
    path: "/status",
    title: String(metadata.title),
  });
}

export default async function StatusPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const page = copy[locale];
  const report = getReadinessReport();
  const status = report.ready ? page.operational : page.degraded;

  return (
    <MarketingShell>
      <main>
        <section data-hero className="px-5 pb-16 pt-32">
          <div className="mx-auto max-w-5xl">
            <span className="section-tag mb-5">{page.eyebrow}</span>
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-5xl font-semibold leading-[1.05] tracking-normal text-zinc-900 md:text-[68px]">
                  {page.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-500">
                  {page.lead}
                </p>
              </div>
              <div className="w-fit rounded-lg border border-emerald-100 bg-emerald-50 px-5 py-4 text-emerald-700">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {status}
                </div>
                <p className="mono mt-2 text-xs text-emerald-700/75">
                  {new Date().toISOString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 px-5 py-16">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            <StatusCard
              body={page.appBody}
              icon="solar:server-square-linear"
              meta={`${page.requiredConfigured}: ${report.requiredConfigured}/${report.requiredTotal}`}
              title={page.appTitle}
            />
            <StatusCard
              body={page.healthBody}
              icon="solar:pulse-2-linear"
              meta="/api/health"
              title={page.healthTitle}
            />
            <StatusCard
              body={page.updatesBody}
              icon="solar:bell-linear"
              meta={`${page.recommendedConfigured}: ${report.recommendedConfigured}/${report.recommendedTotal}`}
              title={page.updatesTitle}
            />
          </div>
          <div className="mx-auto mt-8 max-w-6xl">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
              href="mailto:hello@splnit.eu?subject=Splnit.eu%20status%20issue"
            >
              {page.contact}
              <Icon icon="solar:letter-linear" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}

function StatusCard({
  body,
  icon,
  meta,
  title,
}: {
  body: string;
  icon: string;
  meta: string;
  title: string;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-7">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-green-050)] text-[var(--accent)]">
        <Icon icon={icon} className="text-2xl" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{body}</p>
      <p className="mono mt-5 text-xs text-zinc-400">{meta}</p>
    </article>
  );
}
