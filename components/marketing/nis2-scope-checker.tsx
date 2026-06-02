"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/marketing/local-icon";
import type { Locale } from "@/i18n/routing";

type SizeKey = "micro" | "small" | "medium" | "large";
type SectorKey =
  | "energy"
  | "transport"
  | "health"
  | "digital"
  | "managed"
  | "manufacturing"
  | "public"
  | "research";
type FlagKey = "italy" | "criticalSupplier" | "regulatedCustomers";
type ResultKey = "likely" | "possible" | "unlikely";

type ScopeCopy = {
  formTitle: string;
  sizeTitle: string;
  sectorTitle: string;
  flagsTitle: string;
  resultTitle: string;
  selectedLabel: string;
  clear: string;
  sourcesTitle: string;
  nextTitle: string;
  size: Record<SizeKey, string>;
  sectors: Record<SectorKey, string>;
  flags: Record<FlagKey, string>;
  results: Record<ResultKey, { title: string; body: string; next: string[] }>;
  disclaimer: string;
};

const copy: Record<Locale, ScopeCopy> = {
  "cs-CZ": {
    clear: "Vymazat výběr",
    disclaimer:
      "Tento výsledek je orientační. Není právním stanoviskem a nenahrazuje kontrolu podle D.Lgs. 138/2024, směrnice NIS2 ani výklad příslušného poradce.",
    flags: {
      criticalSupplier: "Dodáváte kritickým nebo regulovaným zákazníkům",
      italy: "Působíte nebo dodáváte služby v Itálii",
      regulatedCustomers: "Zákazníci po vás chtějí NIS2/GDPR/ISO důkazy",
    },
    flagsTitle: "Kontext",
    formTitle: "Orientační NIS2 scoping",
    nextTitle: "Doporučené další kroky",
    resultTitle: "Výsledek",
    results: {
      likely: {
        body:
          "Podle zadaných odpovědí existuje silný signál, že byste měli provést detailní NIS2 posouzení pro Itálii.",
        next: [
          "Ověřit sektor a velikost proti D.Lgs. 138/2024.",
          "Určit interního vlastníka pro NIS2 a evidenci bezpečnostních opatření.",
          "Zmapovat první důkazy: MFA, incident response, backup, dodavatelé.",
        ],
        title: "Pravděpodobně v rozsahu",
      },
      possible: {
        body:
          "Signál není jednoznačný. NIS2 se vás může dotknout přes sektor, zákazníky, dodavatelský řetězec nebo lokální kritéria.",
        next: [
          "Zkontrolovat přesný sektor a služby v Itálii.",
          "Zjistit, zda zákazníci požadují NIS2 důkazy v dotaznících.",
          "Připravit minimální evidenci bezpečnostních kontrol.",
        ],
        title: "Možné, ověřte detailně",
      },
      unlikely: {
        body:
          "Podle zadaných odpovědí je přímý NIS2 dopad méně pravděpodobný, ale zákaznické nebo dodavatelské požadavky mohou stále vytvořit nepřímý tlak.",
        next: [
          "Sledovat požadavky zákazníků a partnerů.",
          "Udržovat základní GDPR a bezpečnostní evidenci.",
          "Zopakovat posouzení při růstu firmy nebo změně sektoru.",
        ],
        title: "Spíše mimo přímý rozsah",
      },
    },
    sectorTitle: "Sektory nebo služby",
    sectors: {
      digital: "Cloud, datové centrum, DNS, SaaS nebo digitální infrastruktura",
      energy: "Energetika",
      health: "Zdravotnictví nebo zdravotnický software",
      managed: "MSP, MSSP, kyberbezpečnostní služby",
      manufacturing: "Výroba nebo průmyslový software",
      public: "Veřejná správa nebo služby pro veřejný sektor",
      research: "Výzkum",
      transport: "Doprava nebo logistika",
    },
    selectedLabel: "Vybráno",
    size: {
      large: "250+ zaměstnanců",
      medium: "50-249 zaměstnanců",
      micro: "Méně než 10 zaměstnanců",
      small: "10-49 zaměstnanců",
    },
    sizeTitle: "Velikost organizace",
    sourcesTitle: "Zdroje",
  },
  "en-EU": {
    clear: "Clear selection",
    disclaimer:
      "This result is indicative. It is not legal advice and does not replace assessment under D.Lgs. 138/2024, the NIS2 Directive, or your advisor's interpretation.",
    flags: {
      criticalSupplier: "You supply critical or regulated customers",
      italy: "You operate in Italy or provide services into Italy",
      regulatedCustomers: "Customers ask for NIS2/GDPR/ISO evidence",
    },
    flagsTitle: "Context",
    formTitle: "Indicative NIS2 scoping",
    nextTitle: "Recommended next steps",
    resultTitle: "Result",
    results: {
      likely: {
        body:
          "Your answers show a strong signal that you should run a detailed NIS2 assessment for Italy.",
        next: [
          "Verify sector and size against D.Lgs. 138/2024.",
          "Assign an internal owner for NIS2 and security-measure evidence.",
          "Map first evidence: MFA, incident response, backups, suppliers.",
        ],
        title: "Likely in scope",
      },
      possible: {
        body:
          "The signal is not definitive. NIS2 may still affect you through sector, customers, supply chain, or local criteria.",
        next: [
          "Check exact Italian sector and service definitions.",
          "Confirm whether customers request NIS2 evidence in questionnaires.",
          "Prepare baseline evidence for security controls.",
        ],
        title: "Possible, verify in detail",
      },
      unlikely: {
        body:
          "Based on your answers, direct NIS2 impact looks less likely, but customer or supplier requirements can still create indirect pressure.",
        next: [
          "Monitor customer and partner requirements.",
          "Keep baseline GDPR and security evidence ready.",
          "Repeat the assessment if company size or sector changes.",
        ],
        title: "Less likely directly in scope",
      },
    },
    sectorTitle: "Sectors or services",
    sectors: {
      digital: "Cloud, data centre, DNS, SaaS, or digital infrastructure",
      energy: "Energy",
      health: "Healthcare or health software",
      managed: "MSP, MSSP, or cybersecurity services",
      manufacturing: "Manufacturing or industrial software",
      public: "Public administration or public-sector services",
      research: "Research",
      transport: "Transport or logistics",
    },
    selectedLabel: "Selected",
    size: {
      large: "250+ employees",
      medium: "50-249 employees",
      micro: "Fewer than 10 employees",
      small: "10-49 employees",
    },
    sizeTitle: "Organisation size",
    sourcesTitle: "Sources",
  },
  "it-IT": {
    clear: "Cancella selezione",
    disclaimer:
      "Il risultato è indicativo. Non è consulenza legale e non sostituisce la verifica secondo D.Lgs. 138/2024, Direttiva NIS2 o il parere del vostro consulente.",
    flags: {
      criticalSupplier: "Fornite clienti critici o regolati",
      italy: "Operate in Italia o fornite servizi verso l'Italia",
      regulatedCustomers: "I clienti chiedono evidenze NIS2/GDPR/ISO",
    },
    flagsTitle: "Contesto",
    formTitle: "Scoping NIS2 indicativo",
    nextTitle: "Prossimi passi consigliati",
    resultTitle: "Risultato",
    results: {
      likely: {
        body:
          "Le risposte indicano un segnale forte: conviene fare una verifica NIS2 dettagliata per l'Italia.",
        next: [
          "Verificare settore e dimensione rispetto al D.Lgs. 138/2024.",
          "Assegnare un owner interno per NIS2 ed evidenze delle misure di sicurezza.",
          "Mappare le prime evidenze: MFA, incident response, backup, fornitori.",
        ],
        title: "Probabilmente in perimetro",
      },
      possible: {
        body:
          "Il segnale non è definitivo. NIS2 può comunque incidere tramite settore, clienti, supply chain o criteri locali.",
        next: [
          "Controllare definizione esatta di settore e servizi in Italia.",
          "Verificare se i clienti chiedono evidenze NIS2 nei questionari.",
          "Preparare evidenze minime sui controlli di sicurezza.",
        ],
        title: "Possibile, da verificare",
      },
      unlikely: {
        body:
          "Dalle risposte l'impatto diretto NIS2 sembra meno probabile, ma richieste di clienti o fornitori possono creare pressione indiretta.",
        next: [
          "Monitorare richieste di clienti e partner.",
          "Tenere pronte evidenze base GDPR e sicurezza.",
          "Ripetere la valutazione se cambiano dimensione o settore.",
        ],
        title: "Meno probabile in perimetro diretto",
      },
    },
    sectorTitle: "Settori o servizi",
    sectors: {
      digital: "Cloud, data center, DNS, SaaS o infrastruttura digitale",
      energy: "Energia",
      health: "Sanità o software sanitario",
      managed: "MSP, MSSP o servizi di cybersicurezza",
      manufacturing: "Manifattura o software industriale",
      public: "PA o servizi per il settore pubblico",
      research: "Ricerca",
      transport: "Trasporti o logistica",
    },
    selectedLabel: "Selezionati",
    size: {
      large: "250+ dipendenti",
      medium: "50-249 dipendenti",
      micro: "Meno di 10 dipendenti",
      small: "10-49 dipendenti",
    },
    sizeTitle: "Dimensione organizzazione",
    sourcesTitle: "Fonti",
  },
};

const sizeKeys: SizeKey[] = ["micro", "small", "medium", "large"];
const sectorKeys: SectorKey[] = [
  "energy",
  "transport",
  "health",
  "digital",
  "managed",
  "manufacturing",
  "public",
  "research",
];
const flagKeys: FlagKey[] = ["italy", "criticalSupplier", "regulatedCustomers"];

function getResult(size: SizeKey, sectors: Set<SectorKey>, flags: Set<FlagKey>) {
  const hasRegulatedSector = sectors.size > 0;
  const hasItaly = flags.has("italy");
  const hasCustomerPressure =
    flags.has("criticalSupplier") || flags.has("regulatedCustomers");

  if ((size === "medium" || size === "large") && hasRegulatedSector && hasItaly) {
    return "likely" satisfies ResultKey;
  }

  if (
    hasRegulatedSector ||
    hasCustomerPressure ||
    ((size === "medium" || size === "large") && hasItaly)
  ) {
    return "possible" satisfies ResultKey;
  }

  return "unlikely" satisfies ResultKey;
}

export function Nis2ScopeChecker({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [size, setSize] = useState<SizeKey>("medium");
  const [sectors, setSectors] = useState<Set<SectorKey>>(() => new Set());
  const [flags, setFlags] = useState<Set<FlagKey>>(() => new Set(["italy"]));

  const resultKey = useMemo(() => getResult(size, sectors, flags), [flags, sectors, size]);
  const result = t.results[resultKey];

  function toggleSector(key: SectorKey) {
    setSectors((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function toggleFlag(key: FlagKey) {
    setFlags((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function clear() {
    setSize("small");
    setSectors(new Set());
    setFlags(new Set());
  }

  return (
    <section className="border-t border-border bg-surface px-5 py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_0.65fr]">
        <div className="rounded-lg border border-border bg-surface p-6 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="mono text-xs uppercase text-foreground/42">
                {t.formTitle}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                {t.sizeTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={clear}
              className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/72 transition-colors hover:bg-surface-muted"
            >
              <Icon icon="solar:restart-linear" aria-hidden="true" />
              {t.clear}
            </button>
          </div>

          <fieldset>
            <legend className="sr-only">{t.sizeTitle}</legend>
            <div className="grid gap-3 sm:grid-cols-2" aria-label={t.sizeTitle}>
              {sizeKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={size === key}
                  onClick={() => setSize(key)}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    size === key
                      ? "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                      : "border-border bg-surface text-foreground/72 hover:bg-surface-muted"
                  }`}
                >
                  {t.size[key]}
                  {size === key ? (
                    <Icon icon="solar:check-circle-bold" aria-hidden="true" />
                  ) : null}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-10">
            <legend className="text-lg font-semibold text-foreground">
              {t.sectorTitle}
            </legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sectorKeys.map((key) => {
                const selected = sectors.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSector(key)}
                    className={`flex min-h-16 items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm leading-5 transition-colors ${
                      selected
                        ? "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                        : "border-border bg-surface text-foreground/64 hover:bg-surface-muted"
                    }`}
                  >
                    <Icon
                      icon={selected ? "solar:check-circle-bold" : "solar:add-circle-linear"}
                      className="mt-0.5 shrink-0 text-lg"
                      aria-hidden="true"
                    />
                    <span>{t.sectors[key]}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-10">
            <legend className="text-lg font-semibold text-foreground">
              {t.flagsTitle}
            </legend>
            <div className="mt-4 grid gap-3">
              {flagKeys.map((key) => {
                const selected = flags.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleFlag(key)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      selected
                        ? "border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] text-[var(--status-pass)]"
                        : "border-border bg-surface text-foreground/64 hover:bg-surface-muted"
                    }`}
                  >
                    <Icon
                      icon={selected ? "solar:check-circle-bold" : "solar:circle-linear"}
                      className="shrink-0 text-lg"
                      aria-hidden="true"
                    />
                    <span>{t.flags[key]}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-lg border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-6 md:p-8" aria-live="polite">
          <p className="mono text-xs uppercase text-[var(--accent)]">{t.resultTitle}</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-foreground">
            {result.title}
          </h2>
          <p className="mt-4 text-sm leading-6 text-foreground/64">{result.body}</p>

          <div className="mt-6 rounded-lg border border-border bg-surface p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t.nextTitle}
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/64">
              {result.next.map((item) => (
                <li key={item} className="flex gap-2">
                  <Icon
                    icon="solar:check-circle-linear"
                    className="mt-0.5 shrink-0 text-lg text-[var(--accent)]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-surface p-4">
            <p className="text-sm leading-6 text-foreground/64">{t.disclaimer}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
