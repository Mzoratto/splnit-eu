import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { createMarketingMetadata } from "@/lib/seo/metadata";

type SecurityCopy = {
  metadata: Required<Pick<Metadata, "title" | "description">> & { locale: string };
  eyebrow: string;
  title: string;
  lead: string;
  doneTitle: string;
  progressTitle: string;
  contactsTitle: string;
  contactsBody: string;
  done: { title: string; body: string }[];
  inProgress: { title: string; body: string }[];
  links: {
    dpa: string;
    privacy: string;
    trust: string;
  };
};

const copy: Record<Locale, SecurityCopy> = {
  "cs-CZ": {
    metadata: {
      description:
        "Aktuální bezpečnostní postoj Splnit.eu v předběžném přístupu: co je hotové, co je rozpracované a kam posílat bezpečnostní dotazy.",
      locale: "cs_CZ",
      title: "Bezpečnost | Splnit.eu",
    },
    contactsBody:
      "Bezpečnostní hlášení posílejte na security@splnit.eu. Dotazy k DPA, subdodavatelům a osobním údajům posílejte na privacy@splnit.eu.",
    contactsTitle: "Kontakty",
    done: [
      {
        body:
          "Aplikace běží na Vercel, data aplikace jsou v Neon Postgres a produkční subdodavatelé jsou uvedení v DPA přehledu.",
        title: "Produkční platforma je zdokumentovaná",
      },
      {
        body:
          "Přenosy jsou šifrované přes HTTPS. Integrační tokeny jsou šifrované a přístup k produkčním systémům je omezený podle role.",
        title: "Základní bezpečnostní opatření jsou aktivní",
      },
      {
        body:
          "Splnit.eu publikuje vlastní Trust Center se stavem frameworků, kontakty, DPA, privacy policy a subdodavatelským přehledem.",
        title: "Vlastní Trust Center je veřejné",
      },
    ],
    doneTitle: "Hotovo dnes",
    eyebrow: "SECURITY POSTURE · EARLY ACCESS",
    inProgress: [
      {
        body:
          "ISO 27001 je vedené jako příprava, ne jako hotová certifikace. Veřejně neuvádíme žádný certifikát, který není dokončený.",
        title: "ISO 27001 příprava",
      },
      {
        body:
          "DPA, privacy texty a smluvní závazky jsou veřejně dostupné jako pracovní baseline a pro placené produkční spoléhání zůstávají pod právní kontrolou.",
        title: "Právní kontrola dokumentů",
      },
      {
        body:
          "Incidentní exporty pro ACN/Garante jsou přípravné worksheety. Kompatibilitu s portály potvrdíme až po poradenské revizi.",
        title: "Regulatorní workflow revize",
      },
    ],
    lead:
      "Tato stránka popisuje reálný stav bezpečnosti Splnit.eu. Kde je práce rozpracovaná, uvádíme ji jako rozpracovanou.",
    links: {
      dpa: "DPA a subdodavatelé",
      privacy: "Privacy",
      trust: "Trust Center Splnit.eu",
    },
    progressTitle: "Rozpracováno",
    title: "Bezpečnost Splnit.eu bez nadsázky.",
  },
  "en-EU": {
    metadata: {
      description:
        "Current Splnit.eu early-access security posture: what is active, what is in progress, and where to send security questions.",
      locale: "en_EU",
      title: "Security | Splnit.eu",
    },
    contactsBody:
      "Send security reports to security@splnit.eu. Send DPA, sub-processor, and personal data questions to privacy@splnit.eu.",
    contactsTitle: "Contacts",
    done: [
      {
        body:
          "The application runs on Vercel, application data is stored in Neon Postgres, and production sub-processors are listed in the DPA overview.",
        title: "Production platform documented",
      },
      {
        body:
          "Transport is encrypted over HTTPS. Integration tokens are encrypted and production access is restricted by role.",
        title: "Baseline security controls active",
      },
      {
        body:
          "Splnit.eu publishes its own Trust Center with framework status, contacts, DPA, privacy policy, and sub-processor information.",
        title: "Own Trust Center published",
      },
    ],
    doneTitle: "Active Today",
    eyebrow: "SECURITY POSTURE · EARLY ACCESS",
    inProgress: [
      {
        body:
          "ISO 27001 is tracked as preparation, not as a completed certification. We do not claim any certification that is not finished.",
        title: "ISO 27001 preparation",
      },
      {
        body:
          "DPA, privacy copy, and contractual commitments are public as a working baseline and remain subject to legal review before paid production reliance.",
        title: "Legal document review",
      },
      {
        body:
          "ACN/Garante incident exports are preparation worksheets. Portal-format compatibility will be claimed only after advisor review.",
        title: "Regulatory workflow review",
      },
    ],
    lead:
      "This page describes the real Splnit.eu security posture. Work in progress is labeled as work in progress.",
    links: {
      dpa: "DPA and sub-processors",
      privacy: "Privacy",
      trust: "Splnit.eu Trust Center",
    },
    progressTitle: "In Progress",
    title: "Splnit.eu security, stated plainly.",
  },
  "it-IT": {
    metadata: {
      description:
        "Postura di sicurezza attuale di Splnit.eu in accesso anticipato: cosa è attivo, cosa è in corso e dove inviare domande di sicurezza.",
      locale: "it_IT",
      title: "Sicurezza | Splnit.eu",
    },
    contactsBody:
      "Inviate segnalazioni di sicurezza a security@splnit.eu. Domande su DPA, sub-responsabili e dati personali a privacy@splnit.eu.",
    contactsTitle: "Contatti",
    done: [
      {
        body:
          "L'applicazione gira su Vercel, i dati applicativi sono in Neon Postgres e i sub-responsabili di produzione sono indicati nella panoramica DPA.",
        title: "Piattaforma di produzione documentata",
      },
      {
        body:
          "Il traffico usa HTTPS. I token delle integrazioni sono cifrati e l'accesso ai sistemi di produzione è limitato per ruolo.",
        title: "Controlli di sicurezza base attivi",
      },
      {
        body:
          "Splnit.eu pubblica il proprio Trust Center con stato framework, contatti, DPA, privacy policy e informazioni sui sub-responsabili.",
        title: "Trust Center proprio pubblicato",
      },
    ],
    doneTitle: "Attivo oggi",
    eyebrow: "POSTURA SICUREZZA · ACCESSO ANTICIPATO",
    inProgress: [
      {
        body:
          "ISO 27001 è tracciato come preparazione, non come certificazione completata. Non dichiariamo certificazioni non concluse.",
        title: "Preparazione ISO 27001",
      },
      {
        body:
          "DPA, privacy e impegni contrattuali sono pubblici come baseline operativa e restano soggetti a revisione legale prima dell’affidamento in produzione a pagamento.",
        title: "Revisione documenti legali",
      },
      {
        body:
          "Gli export incidenti ACN/Garante sono worksheet di preparazione. La compatibilità con i portali sarà dichiarata solo dopo revisione advisor.",
        title: "Revisione workflow regolatori",
      },
    ],
    lead:
      "Questa pagina descrive la postura reale di sicurezza Splnit.eu. Il lavoro in corso è indicato come lavoro in corso.",
    links: {
      dpa: "DPA e sub-responsabili",
      privacy: "Privacy",
      trust: "Trust Center Splnit.eu",
    },
    progressTitle: "In corso",
    title: "Sicurezza Splnit.eu, senza esagerazioni.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = copy[locale].metadata;

  return createMarketingMetadata({
    description: metadata.description ?? "",
    locale,
    path: "/security",
    title: String(metadata.title),
  });
}

export default async function SecurityPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const page = copy[locale];

  return (
    <MarketingShell>
      <main>
        <section data-hero className="px-5 pb-16 pt-32">
          <div className="mx-auto max-w-5xl">
            <span className="section-tag mb-5">{page.eyebrow}</span>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-normal text-zinc-900 md:text-[68px]">
              {page.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-500">
              {page.lead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/trust/splnit"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                {page.links.trust}
                <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
              </Link>
              <Link
                href={getLocalizedMarketingPath("/dpa", locale)}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
              >
                {page.links.dpa}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 px-5 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <SecurityList
              icon="solar:check-circle-linear"
              items={page.done}
              title={page.doneTitle}
              tone="pass"
            />
            <SecurityList
              icon="solar:clock-circle-linear"
              items={page.inProgress}
              title={page.progressTitle}
              tone="warn"
            />
          </div>
        </section>

        <section className="border-t border-zinc-200/50 px-5 py-16">
          <div className="mx-auto max-w-4xl rounded-lg border border-zinc-200 bg-zinc-50 p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon icon="solar:letter-linear" className="text-2xl" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  {page.contactsTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {page.contactsBody}
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  <Link className="font-medium text-blue-600" href="mailto:security@splnit.eu">
                    security@splnit.eu
                  </Link>
                  <Link className="font-medium text-blue-600" href="mailto:privacy@splnit.eu">
                    privacy@splnit.eu
                  </Link>
                  <Link
                    className="font-medium text-blue-600"
                    href={getLocalizedMarketingPath("/soukromi", locale)}
                  >
                    {page.links.privacy}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}

function SecurityList({
  icon,
  items,
  title,
  tone,
}: {
  icon: string;
  items: { title: string; body: string }[];
  title: string;
  tone: "pass" | "warn";
}) {
  const color =
    tone === "pass"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-amber-50 text-amber-600";

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-7">
      <h2 className="text-2xl font-semibold text-zinc-900">{title}</h2>
      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.title} className="flex gap-4">
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
              <Icon icon={icon} className="text-xl" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-600">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
