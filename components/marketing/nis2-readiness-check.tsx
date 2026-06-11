"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Icon } from "@/components/marketing/local-icon";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale, type Locale } from "@/i18n/routing";

type SizeKey = "micro" | "small" | "medium" | "large";
type SectorKey =
  | "it_services"
  | "digital"
  | "manufacturing"
  | "energy"
  | "transport"
  | "health"
  | "food"
  | "waste"
  | "postal"
  | "public";
type ScopeVerdict = "likely" | "possible" | "unlikely";
type ReadinessAnswer = "yes" | "partial" | "no";

type ReadinessQuestion = {
  id: string;
  /** Czech legal citation; backed by the imported NÚKIB measures overview. */
  legalReference: string;
};

const NUKIB_CALCULATOR_URL = "https://portal.nukib.gov.cz/kalkulacka";

// One question per security-measure area § 3–§ 14 of vyhláška č. 410/2025 Sb.
const READINESS_QUESTIONS: readonly ReadinessQuestion[] = [
  { id: "isms", legalReference: "§ 3 vyhl. č. 410/2025 Sb." },
  { id: "management", legalReference: "§ 4 vyhl. č. 410/2025 Sb." },
  { id: "hr_security", legalReference: "§ 5 vyhl. č. 410/2025 Sb." },
  { id: "continuity", legalReference: "§ 6 vyhl. č. 410/2025 Sb." },
  { id: "access_control", legalReference: "§ 7 vyhl. č. 410/2025 Sb." },
  { id: "identity_mfa", legalReference: "§ 8 vyhl. č. 410/2025 Sb." },
  { id: "detection_logging", legalReference: "§ 9 vyhl. č. 410/2025 Sb." },
  { id: "incident_response", legalReference: "§ 10 vyhl. č. 410/2025 Sb." },
  { id: "network_security", legalReference: "§ 11 vyhl. č. 410/2025 Sb." },
  { id: "application_security", legalReference: "§ 12 vyhl. č. 410/2025 Sb." },
  { id: "cryptography", legalReference: "§ 13 vyhl. č. 410/2025 Sb." },
  { id: "incident_impact", legalReference: "§ 14 vyhl. č. 410/2025 Sb." },
];

const QUESTIONS_PER_STEP = 3;
const READINESS_STEPS = Math.ceil(READINESS_QUESTIONS.length / QUESTIONS_PER_STEP);
// Step 0 is scoping; steps 1..READINESS_STEPS are questions; the result shows last.
const TOTAL_STEPS = READINESS_STEPS + 1;

type Copy = {
  intro: string;
  stepLabel: string;
  scopingTitle: string;
  sizeTitle: string;
  size: Record<SizeKey, string>;
  turnoverLabel: string;
  sizeIndependentLabel: string;
  sectorsTitle: string;
  sectors: Record<SectorKey, string>;
  scopingNote: string;
  next: string;
  back: string;
  showResult: string;
  restart: string;
  questionsTitle: string;
  questions: Record<string, string>;
  answers: Record<ReadinessAnswer, string>;
  resultTitle: string;
  scopeVerdicts: Record<ScopeVerdict, { title: string; body: string }>;
  nukibCta: string;
  readinessTitle: string;
  readinessBands: { good: string; partial: string; gaps: string };
  areaStates: { pass: string; warn: string; fail: string };
  emailTitle: string;
  emailBody: string;
  emailPlaceholder: string;
  emailCta: string;
  emailSuccess: string;
  emailError: string;
  productCta: string;
  disclaimer: string;
};

const copy: Record<Locale, Copy> = {
  "cs-CZ": {
    answers: { no: "Ne / nevím", partial: "Částečně", yes: "Ano" },
    areaStates: { fail: "Mezera", pass: "Pokryto", warn: "Částečně" },
    back: "Zpět",
    disclaimer:
      "Výsledek je orientační triáž, ne právní stanovisko. Závazné posouzení regulované služby provedete v oficiální kalkulačce NÚKIB a registrací na Portálu NÚKIB do 60 dnů od naplnění kritérií.",
    emailBody:
      "Pošleme vám shrnutí výsledku a praktické další kroky podle vyhlášky č. 410/2025 Sb. Žádný spam.",
    emailCta: "Poslat shrnutí",
    emailError: "Odeslání se nepovedlo. Zkuste to prosím znovu.",
    emailPlaceholder: "vas@email.cz",
    emailSuccess: "Hotovo — shrnutí je na cestě.",
    emailTitle: "Chcete výsledek e-mailem?",
    intro:
      "12 otázek podle oblastí vyhlášky č. 410/2025 Sb. Výsledek uvidíte hned a celé, bez registrace.",
    next: "Pokračovat",
    nukibCta: "Závazné posouzení: oficiální kalkulačka NÚKIB",
    productCta: "Začít řešit mezery se Splnit.eu",
    questions: {
      access_control: "Řídíte přístupy k systémům podle zásady minimálních oprávnění?",
      application_security: "Aktualizujete aplikace a řešíte známé zranitelnosti?",
      continuity: "Máte plán kontinuity provozu a testujete obnovu ze záloh?",
      cryptography: "Šifrujete data při přenosu i v klidu?",
      detection_logging: "Zaznamenáváte a vyhodnocujete bezpečnostní události (logy)?",
      hr_security: "Školíte zaměstnance a řešíte bezpečnost při nástupu a odchodu?",
      identity_mfa: "Používáte vícefaktorové ověření a revidujete účty a oprávnění?",
      incident_impact: "Umíte vyhodnotit závažnost dopadu bezpečnostního incidentu?",
      incident_response: "Máte postup pro řešení a hlášení bezpečnostních incidentů?",
      isms: "Máte zavedená pravidla kybernetické bezpečnosti a jasné odpovědnosti?",
      management: "Jmenovalo vedení osobu pověřenou kybernetickou bezpečností?",
      network_security: "Zabezpečujete síť (segmentace, firewall, vzdálený přístup)?",
    },
    questionsTitle: "Připravenost podle vyhlášky č. 410/2025 Sb.",
    readinessBands: {
      gaps: "Významné mezery",
      good: "Dobrý základ",
      partial: "Částečná připravenost",
    },
    readinessTitle: "Připravenost podle oblastí",
    restart: "Vyplnit znovu",
    resultTitle: "Výsledek",
    scopeVerdicts: {
      likely: {
        body:
          "Podle velikosti a sektoru je pravděpodobné, že poskytujete regulovanou službu podle zákona č. 264/2025 Sb. Ověřte to v oficiální kalkulačce NÚKIB a počítejte s registrací do 60 dnů.",
        title: "Pravděpodobně regulovaná služba",
      },
      possible: {
        body:
          "Signál není jednoznačný — záleží na přesné službě a velikosti včetně propojených podniků. Ověřte v oficiální kalkulačce NÚKIB.",
        title: "Možná regulovaná služba — ověřte",
      },
      unlikely: {
        body:
          "Podle odpovědí je přímá regulace méně pravděpodobná. Požadavky zákazníků ale mohou vytvořit nepřímý tlak — připravenost níže se hodí i tak.",
        title: "Spíše mimo přímou regulaci",
      },
    },
    scopingNote:
      "Velikost se počítá včetně propojených a partnerských podniků (metodika EU pro SME). Vybrané služby (DNS, TLD, služby vytvářející důvěru) jsou regulované bez ohledu na velikost.",
    scopingTitle: "Spadáte pod nový kybernetický zákon?",
    sectors: {
      digital: "Cloud, hosting, datová centra, online platformy",
      energy: "Energetika",
      food: "Výroba a distribuce potravin",
      health: "Zdravotnictví",
      it_services: "IT služby, MSP/MSSP, správa infrastruktury",
      manufacturing: "Výroba (stroje, elektronika, vozidla, zdravotnické prostředky)",
      postal: "Poštovní a kurýrní služby",
      public: "Veřejná správa",
      transport: "Doprava a logistika",
      waste: "Odpadové hospodářství",
    },
    sectorsTitle: "Ve kterých oblastech působíte?",
    size: {
      large: "250+ zaměstnanců",
      medium: "50–249 zaměstnanců",
      micro: "Méně než 10 zaměstnanců",
      small: "10–49 zaměstnanců",
    },
    sizeIndependentLabel: "Poskytujeme DNS, TLD nebo služby vytvářející důvěru",
    sizeTitle: "Velikost organizace",
    stepLabel: "Krok {current} z {total}",
    showResult: "Zobrazit výsledek",
    turnoverLabel: "Roční obrat nebo bilanční suma nad 10 mil. EUR",
  },
  "en-EU": {
    answers: { no: "No / don't know", partial: "Partially", yes: "Yes" },
    areaStates: { fail: "Gap", pass: "Covered", warn: "Partial" },
    back: "Back",
    disclaimer:
      "The result is indicative triage, not legal advice. The binding check of a regulated service is NÚKIB's official calculator, with registration on Portál NÚKIB within 60 days of meeting the criteria.",
    emailBody:
      "We'll send a summary of your result and practical next steps under Decree No. 410/2025 Coll. No spam.",
    emailCta: "Send summary",
    emailError: "Sending failed. Please try again.",
    emailPlaceholder: "you@company.com",
    emailSuccess: "Done — the summary is on its way.",
    emailTitle: "Want the result by email?",
    intro:
      "12 questions following the areas of Czech Decree No. 410/2025 Coll. You see the full result immediately, no registration.",
    next: "Continue",
    nukibCta: "Binding check: official NÚKIB calculator",
    productCta: "Start closing gaps with Splnit.eu",
    questions: {
      access_control: "Do you manage system access on a least-privilege basis?",
      application_security: "Do you keep applications updated and fix known vulnerabilities?",
      continuity: "Do you have a continuity plan and test restoring from backups?",
      cryptography: "Do you encrypt data in transit and at rest?",
      detection_logging: "Do you log and evaluate security events?",
      hr_security: "Do you train employees and manage joiner/leaver security?",
      identity_mfa: "Do you use multi-factor authentication and review accounts and permissions?",
      incident_impact: "Can you assess the severity of a security incident's impact?",
      incident_response: "Do you have a process for handling and reporting security incidents?",
      isms: "Do you have cybersecurity rules and clear responsibilities in place?",
      management: "Has management appointed a person responsible for cybersecurity?",
      network_security: "Do you secure your network (segmentation, firewall, remote access)?",
    },
    questionsTitle: "Readiness under Decree No. 410/2025 Coll.",
    readinessBands: {
      gaps: "Significant gaps",
      good: "Solid foundation",
      partial: "Partial readiness",
    },
    readinessTitle: "Readiness by area",
    restart: "Start over",
    resultTitle: "Result",
    scopeVerdicts: {
      likely: {
        body:
          "Based on size and sector it is likely you provide a regulated service under Act No. 264/2025 Coll. Verify in NÚKIB's official calculator and expect registration within 60 days.",
        title: "Likely a regulated service",
      },
      possible: {
        body:
          "The signal is not definitive — it depends on the exact service and size including linked enterprises. Verify in NÚKIB's official calculator.",
        title: "Possibly regulated — verify",
      },
      unlikely: {
        body:
          "Direct regulation looks less likely from your answers. Customer requirements can still create indirect pressure — the readiness below is useful either way.",
        title: "Likely outside direct regulation",
      },
    },
    scopingNote:
      "Size counts linked and partner enterprises (EU SME methodology). Some services (DNS, TLD, trust services) are regulated regardless of size.",
    scopingTitle: "Does the new Czech cybersecurity act apply to you?",
    sectors: {
      digital: "Cloud, hosting, data centres, online platforms",
      energy: "Energy",
      food: "Food production and distribution",
      health: "Healthcare",
      it_services: "IT services, MSP/MSSP, infrastructure management",
      manufacturing: "Manufacturing (machinery, electronics, vehicles, medical devices)",
      postal: "Postal and courier services",
      public: "Public administration",
      transport: "Transport and logistics",
      waste: "Waste management",
    },
    sectorsTitle: "Which areas do you operate in?",
    size: {
      large: "250+ employees",
      medium: "50–249 employees",
      micro: "Fewer than 10 employees",
      small: "10–49 employees",
    },
    sizeIndependentLabel: "We provide DNS, TLD, or trust services",
    sizeTitle: "Organisation size",
    stepLabel: "Step {current} of {total}",
    showResult: "Show result",
    turnoverLabel: "Annual turnover or balance sheet above EUR 10 million",
  },
  "it-IT": {
    answers: { no: "No / non so", partial: "Parzialmente", yes: "Sì" },
    areaStates: { fail: "Lacuna", pass: "Coperto", warn: "Parziale" },
    back: "Indietro",
    disclaimer:
      "Il risultato è una triage indicativa, non consulenza legale. La verifica vincolante del servizio regolato è il calcolatore ufficiale NÚKIB, con registrazione sul Portál NÚKIB entro 60 giorni dal soddisfacimento dei criteri.",
    emailBody:
      "Vi inviamo un riepilogo del risultato e i prossimi passi pratici secondo il decreto ceco n. 410/2025. Niente spam.",
    emailCta: "Invia riepilogo",
    emailError: "Invio non riuscito. Riprovate.",
    emailPlaceholder: "voi@azienda.it",
    emailSuccess: "Fatto — il riepilogo è in arrivo.",
    emailTitle: "Volete il risultato via e-mail?",
    intro:
      "12 domande secondo le aree del decreto ceco n. 410/2025. Vedete subito il risultato completo, senza registrazione.",
    next: "Continua",
    nukibCta: "Verifica vincolante: calcolatore ufficiale NÚKIB",
    productCta: "Iniziare a chiudere le lacune con Splnit.eu",
    questions: {
      access_control: "Gestite gli accessi ai sistemi con il minimo privilegio?",
      application_security: "Aggiornate le applicazioni e correggete le vulnerabilità note?",
      continuity: "Avete un piano di continuità e testate il ripristino dai backup?",
      cryptography: "Cifrate i dati in transito e a riposo?",
      detection_logging: "Registrate e valutate gli eventi di sicurezza (log)?",
      hr_security: "Formate il personale e gestite la sicurezza di ingressi e uscite?",
      identity_mfa: "Usate l'autenticazione a più fattori e revisionate account e permessi?",
      incident_impact: "Sapete valutare la gravità dell'impatto di un incidente?",
      incident_response: "Avete un processo per gestire e segnalare gli incidenti?",
      isms: "Avete regole di cybersicurezza e responsabilità chiare?",
      management: "La direzione ha nominato una persona responsabile della cybersicurezza?",
      network_security: "Proteggete la rete (segmentazione, firewall, accesso remoto)?",
    },
    questionsTitle: "Preparazione secondo il decreto ceco n. 410/2025",
    readinessBands: {
      gaps: "Lacune significative",
      good: "Buona base",
      partial: "Preparazione parziale",
    },
    readinessTitle: "Preparazione per area",
    restart: "Ricomincia",
    resultTitle: "Risultato",
    scopeVerdicts: {
      likely: {
        body:
          "In base a dimensione e settore è probabile che forniate un servizio regolato dalla legge ceca n. 264/2025. Verificate nel calcolatore ufficiale NÚKIB; registrazione entro 60 giorni.",
        title: "Probabilmente servizio regolato",
      },
      possible: {
        body:
          "Il segnale non è definitivo — dipende dal servizio esatto e dalla dimensione incluse le imprese collegate. Verificate nel calcolatore ufficiale NÚKIB.",
        title: "Possibile regolazione — verificate",
      },
      unlikely: {
        body:
          "La regolazione diretta sembra meno probabile. Le richieste dei clienti possono comunque creare pressione indiretta — la preparazione qui sotto resta utile.",
        title: "Probabilmente fuori dalla regolazione diretta",
      },
    },
    scopingNote:
      "La dimensione include imprese collegate e partner (metodologia UE per le PMI). Alcuni servizi (DNS, TLD, servizi fiduciari) sono regolati a prescindere dalla dimensione.",
    scopingTitle: "La nuova legge ceca sulla cybersicurezza vi riguarda?",
    sectors: {
      digital: "Cloud, hosting, data center, piattaforme online",
      energy: "Energia",
      food: "Produzione e distribuzione alimentare",
      health: "Sanità",
      it_services: "Servizi IT, MSP/MSSP, gestione infrastrutture",
      manufacturing: "Manifattura (macchinari, elettronica, veicoli, dispositivi medici)",
      postal: "Servizi postali e corrieri",
      public: "Pubblica amministrazione",
      transport: "Trasporti e logistica",
      waste: "Gestione rifiuti",
    },
    sectorsTitle: "In quali aree operate?",
    size: {
      large: "250+ dipendenti",
      medium: "50–249 dipendenti",
      micro: "Meno di 10 dipendenti",
      small: "10–49 dipendenti",
    },
    sizeIndependentLabel: "Forniamo DNS, TLD o servizi fiduciari",
    sizeTitle: "Dimensione dell'organizzazione",
    stepLabel: "Passo {current} di {total}",
    showResult: "Mostra il risultato",
    turnoverLabel: "Fatturato annuo o bilancio oltre 10 milioni di EUR",
  },
};

const sizeKeys: SizeKey[] = ["micro", "small", "medium", "large"];
const sectorKeys: SectorKey[] = [
  "it_services",
  "digital",
  "manufacturing",
  "energy",
  "transport",
  "health",
  "food",
  "waste",
  "postal",
  "public",
];

export function getScopeVerdict(input: {
  size: SizeKey;
  turnover: boolean;
  sizeIndependent: boolean;
  sectorCount: number;
}): ScopeVerdict {
  if (input.sizeIndependent) {
    return "likely";
  }

  const sizeMet = input.size === "medium" || input.size === "large" || input.turnover;

  if (sizeMet && input.sectorCount > 0) {
    return "likely";
  }

  if (sizeMet || input.sectorCount > 0) {
    return "possible";
  }

  return "unlikely";
}

export function getReadinessScore(answers: Record<string, ReadinessAnswer>) {
  let points = 0;

  for (const question of READINESS_QUESTIONS) {
    const answer = answers[question.id];
    points += answer === "yes" ? 2 : answer === "partial" ? 1 : 0;
  }

  return Math.round((points / (READINESS_QUESTIONS.length * 2)) * 100);
}

function formatStep(template: string, current: number, total: number) {
  return template
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

export function Nis2ReadinessCheck() {
  const locale = normalizeLocale(useLocale()) ?? "cs-CZ";
  const t = copy[locale];

  const [step, setStep] = useState(0);
  const [size, setSize] = useState<SizeKey>("small");
  const [turnover, setTurnover] = useState(false);
  const [sizeIndependent, setSizeIndependent] = useState(false);
  const [sectors, setSectors] = useState<Set<SectorKey>>(() => new Set());
  const [answers, setAnswers] = useState<Record<string, ReadinessAnswer>>({});
  const [showResult, setShowResult] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const scopeVerdict = useMemo(
    () =>
      getScopeVerdict({
        sectorCount: sectors.size,
        size,
        sizeIndependent,
        turnover,
      }),
    [sectors, size, sizeIndependent, turnover],
  );
  const readinessScore = useMemo(() => getReadinessScore(answers), [answers]);
  const readinessBand =
    readinessScore >= 80 ? "good" : readinessScore >= 50 ? "partial" : "gaps";

  const stepQuestions =
    step >= 1
      ? READINESS_QUESTIONS.slice(
          (step - 1) * QUESTIONS_PER_STEP,
          step * QUESTIONS_PER_STEP,
        )
      : [];
  const stepComplete =
    step === 0 || stepQuestions.every((question) => answers[question.id]);
  const isLastQuestionStep = step === READINESS_STEPS;

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

  function setAnswer(id: string, value: ReadinessAnswer) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  function restart() {
    setStep(0);
    setSize("small");
    setTurnover(false);
    setSizeIndependent(false);
    setSectors(new Set());
    setAnswers({});
    setShowResult(false);
    setEmail("");
    setEmailStatus("idle");
  }

  async function submitEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailStatus("loading");

    const response = await fetch("/api/newsletter", {
      body: JSON.stringify({ email, source: "nis2 readiness check" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }).catch(() => null);

    if (response?.ok) {
      setEmail("");
      setEmailStatus("success");
      return;
    }

    setEmailStatus("error");
  }

  if (showResult) {
    const verdict = t.scopeVerdicts[scopeVerdict];

    return (
      <div className="rounded-lg border border-border bg-surface p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="mono text-xs uppercase tracking-[0.08em] text-[var(--accent)]">
            {t.resultTitle}
          </p>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/72 transition-colors hover:bg-surface-muted"
          >
            <Icon icon="solar:restart-linear" aria-hidden="true" />
            {t.restart}
          </button>
        </div>

        <h3 className="mt-3 text-2xl font-semibold text-foreground">{verdict.title}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">{verdict.body}</p>
        <a
          href={NUKIB_CALCULATOR_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-pressed)]"
        >
          {t.nukibCta}
          <Icon icon="solar:arrow-right-up-linear" aria-hidden="true" />
        </a>

        <div className="mt-8 rounded-lg border border-border bg-background p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-base font-semibold text-foreground">{t.readinessTitle}</h4>
            <p className="mono text-sm font-semibold text-[var(--accent)]">
              {readinessScore}% · {t.readinessBands[readinessBand]}
            </p>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {READINESS_QUESTIONS.map((question) => {
              const answer = answers[question.id] ?? "no";
              const tone =
                answer === "yes" ? "pass" : answer === "partial" ? "warn" : "fail";

              return (
                <li
                  key={question.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block leading-5 text-foreground/80">
                      {t.questions[question.id]}
                    </span>
                    <span className="mono mt-0.5 block text-[11px] text-foreground/48">
                      {question.legalReference}
                    </span>
                  </span>
                  <span
                    className={`mono shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${
                      tone === "pass"
                        ? "border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] text-[var(--status-pass)]"
                        : tone === "warn"
                          ? "border-[var(--status-warn-border)] bg-[var(--status-warn-subtle)] text-[var(--status-warn)]"
                          : "border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] text-[var(--status-fail)]"
                    }`}
                  >
                    {t.areaStates[tone]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-5">
            <h4 className="text-base font-semibold text-foreground">{t.emailTitle}</h4>
            <p className="mt-1 text-sm leading-6 text-foreground/64">{t.emailBody}</p>
            {emailStatus === "success" ? (
              <p
                role="status"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-3 py-1.5 text-sm font-medium text-[var(--status-pass)]"
              >
                <Icon icon="solar:check-circle-linear" aria-hidden="true" />
                {t.emailSuccess}
              </p>
            ) : (
              <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={submitEmail}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailStatus === "error") {
                      setEmailStatus("idle");
                    }
                  }}
                  placeholder={t.emailPlaceholder}
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-foreground/38 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
                <button
                  type="submit"
                  disabled={emailStatus === "loading"}
                  className="min-h-11 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t.emailCta}
                </button>
              </form>
            )}
            {emailStatus === "error" ? (
              <p role="alert" className="mt-2 text-xs font-semibold text-[var(--status-fail)]">
                {t.emailError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-5">
            <p className="text-sm leading-6 text-foreground/72">{t.disclaimer}</p>
            <Link
              href={getLocalizedMarketingPath("/early-access", locale)}
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              {t.productCta}
              <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="mono text-xs uppercase tracking-[0.08em] text-[var(--accent)]">
          {formatStep(t.stepLabel, step + 1, TOTAL_STEPS)}
        </p>
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/72 transition-colors hover:bg-surface-muted"
          >
            <Icon icon="solar:arrow-left-linear" aria-hidden="true" />
            {t.back}
          </button>
        ) : null}
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={step + 1}
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--bg-muted)]"
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-[var(--duration-base)]"
          style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {step === 0 ? (
        <div>
          <h3 className="mt-6 text-xl font-semibold text-foreground">{t.scopingTitle}</h3>
          <p className="mt-1 text-sm leading-6 text-foreground/58">{t.intro}</p>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-foreground">{t.sizeTitle}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
            <div className="mt-3 grid gap-2">
              {[
                {
                  active: turnover,
                  label: t.turnoverLabel,
                  toggle: () => setTurnover((value) => !value),
                },
                {
                  active: sizeIndependent,
                  label: t.sizeIndependentLabel,
                  toggle: () => setSizeIndependent((value) => !value),
                },
              ].map((flag) => (
                <button
                  key={flag.label}
                  type="button"
                  aria-pressed={flag.active}
                  onClick={flag.toggle}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    flag.active
                      ? "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                      : "border-border bg-surface text-foreground/64 hover:bg-surface-muted"
                  }`}
                >
                  <Icon
                    icon={flag.active ? "solar:check-circle-bold" : "solar:circle-linear"}
                    className="shrink-0 text-lg"
                    aria-hidden="true"
                  />
                  {flag.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-foreground">
              {t.sectorsTitle}
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {sectorKeys.map((key) => {
                const selected = sectors.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSector(key)}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm leading-5 transition-colors ${
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

          <p className="mt-4 text-xs leading-5 text-foreground/52">{t.scopingNote}</p>
        </div>
      ) : (
        <div>
          <h3 className="mt-6 text-xl font-semibold text-foreground">{t.questionsTitle}</h3>
          <div className="mt-5 grid gap-4">
            {stepQuestions.map((question) => (
              <fieldset
                key={question.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <legend className="sr-only">{t.questions[question.id]}</legend>
                <p className="text-sm font-medium leading-6 text-foreground">
                  {t.questions[question.id]}
                </p>
                <p className="mono mt-0.5 text-[11px] text-foreground/48">
                  {question.legalReference}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(["yes", "partial", "no"] as const).map((value) => {
                    const selected = answers[question.id] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setAnswer(question.id, value)}
                        className={`min-h-10 rounded-md border px-2 text-sm font-medium transition-colors ${
                          selected
                            ? "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                            : "border-border bg-surface text-foreground/64 hover:bg-surface-muted"
                        }`}
                      >
                        {t.answers[value]}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={!stepComplete}
          onClick={() => {
            if (isLastQuestionStep) {
              setShowResult(true);
              return;
            }
            setStep(step + 1);
          }}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLastQuestionStep ? t.showResult : t.next}
          <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
