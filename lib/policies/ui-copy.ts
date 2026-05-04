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
  };
  list: {
    emptyDate: string;
    emptyState: string;
    eyebrow: string;
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
    },
    list: {
      emptyDate: "bez data",
      emptyState: "Dokument zatím není vygenerovaný.",
      eyebrow: "Knihovna dokumentů",
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
    },
    list: {
      emptyDate: "no date",
      emptyState: "This document has not been generated yet.",
      eyebrow: "Policy library",
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
    },
    list: {
      emptyDate: "nessuna data",
      emptyState: "Questo documento non è ancora stato generato.",
      eyebrow: "Libreria documenti",
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
