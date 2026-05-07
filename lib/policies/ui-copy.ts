import type { SupportedLocale } from "@/lib/jurisdictions/context";

type PolicyUiCopy = {
  actions: {
    detail: string;
    downloadPdf: string;
    generate: string;
    generatePdf: string;
    library: string;
  };
  detail: {
    documentSections: string;
    emptyVersions: string;
    generatedVersions: string;
    source: string;
  };
  list: {
    emptyDate: string;
    emptyState: string;
    eyebrow: string;
    generateUnavailable: string;
    intro: string;
    latestVersion: string;
    review: string;
    title: string;
  };
  statuses: {
    active: string;
    draft: string;
  };
};

const POLICY_UI_COPY = {
  "cs-CZ": {
    actions: {
      detail: "Detail",
      downloadPdf: "Stáhnout PDF",
      generate: "Vygenerovat",
      generatePdf: "Vygenerovat PDF",
      library: "Knihovna",
    },
    detail: {
      documentSections: "Sekce dokumentu",
      emptyVersions: "Zatím není vygenerovaná žádná verze.",
      generatedVersions: "Vygenerované verze",
      source: "Zdroj",
    },
    list: {
      emptyDate: "bez data",
      emptyState:
        "Zatím není vygenerovaný žádný draft. Otevřete detail politiky, zkontrolujte šablonu a první draft vygenerujte po nastavení úložiště dokumentů.",
      eyebrow: "Knihovna dokumentů",
      generateUnavailable:
        "Generování je vypnuté, dokud není nastavené úložiště dokumentů. Šablonu můžete zatím zkontrolovat v detailu.",
      intro:
        "Šablony se vyplní údaji organizace, uloží jako PDF a připomenou roční přezkum.",
      latestVersion: "Poslední verze",
      review: "přezkum",
      title: "Compliance dokumenty",
    },
    statuses: {
      active: "aktivní",
      draft: "rozpracováno",
    },
  },
  "en-EU": {
    actions: {
      detail: "Details",
      downloadPdf: "Download PDF",
      generate: "Generate",
      generatePdf: "Generate PDF",
      library: "Library",
    },
    detail: {
      documentSections: "Document sections",
      emptyVersions: "No generated version yet.",
      generatedVersions: "Generated versions",
      source: "Source",
    },
    list: {
      emptyDate: "no date",
      emptyState:
        "No draft has been generated yet. Open the policy detail to review the template, then generate the first draft when document storage is configured.",
      eyebrow: "Policy library",
      generateUnavailable:
        "Generation is disabled until document storage is configured. You can still review the template detail.",
      intro:
        "Templates use your organisation profile, save as PDF, and remind you about annual review.",
      latestVersion: "Latest version",
      review: "review",
      title: "Compliance documents",
    },
    statuses: {
      active: "active",
      draft: "draft",
    },
  },
  "it-IT": {
    actions: {
      detail: "Dettaglio",
      downloadPdf: "Scarica PDF",
      generate: "Genera",
      generatePdf: "Genera PDF",
      library: "Libreria",
    },
    detail: {
      documentSections: "Sezioni del documento",
      emptyVersions: "Nessuna versione generata finora.",
      generatedVersions: "Versioni generate",
      source: "Fonte",
    },
    list: {
      emptyDate: "nessuna data",
      emptyState:
        "Nessuna bozza è stata generata finora. Aprite il dettaglio della policy per rivedere il modello, poi generate la prima bozza quando lo storage documenti è configurato.",
      eyebrow: "Libreria documenti",
      generateUnavailable:
        "La generazione è disabilitata finché lo storage documenti non è configurato. Potete comunque rivedere il dettaglio del modello.",
      intro:
        "I modelli usano il profilo dell'organizzazione, vengono salvati in PDF e ricordano la revisione annuale.",
      latestVersion: "Ultima versione",
      review: "revisione",
      title: "Documenti di compliance",
    },
    statuses: {
      active: "attivo",
      draft: "bozza",
    },
  },
} as const satisfies Record<SupportedLocale, PolicyUiCopy>;

export function getPolicyUiCopy(locale: SupportedLocale): PolicyUiCopy {
  return POLICY_UI_COPY[locale];
}

export function getPolicyStatusLabel(
  status: string,
  locale: SupportedLocale,
): string {
  const copy = getPolicyUiCopy(locale);

  if (status === "active") {
    return copy.statuses.active;
  }

  if (status === "draft") {
    return copy.statuses.draft;
  }

  return status;
}
