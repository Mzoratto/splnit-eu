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
  editor: {
    bodyLabel: string;
    fieldsHelp: string;
    fieldsLabel: string;
    generateHelp: string;
    generatePdf: string;
    localeFallbackHelp: string;
    legalIdentifier: string;
    organisation: string;
    reviewDate: string;
    saveDraft: string;
    sectionTitleLabel: string;
    sourceCitation: string;
    statusDraft: string;
    title: string;
    titleLabel: string;
  };
  list: {
    emptyDate: string;
    emptyState: string;
    eyebrow: string;
    fallbackBadge: string;
    fallbackNotice: string;
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
    editor: {
      bodyLabel: "Text sekce",
      fieldsHelp: "Každé pole na samostatný řádek. Prázdné řádky se ignorují.",
      fieldsLabel: "Kontrolní pole",
      generateHelp:
        "Generování PDF je vypnuté, dokud není nastavené soukromé úložiště dokumentů.",
      generatePdf: "Vygenerovat PDF z draftu",
      localeFallbackHelp:
        "Pro tento jazyk zatím není k dispozici ověřená šablona. Šablonu můžete zkontrolovat v detailu, ale PDF generování je vypnuté, dokud nebude ověřená lokální verze připravená.",
      legalIdentifier: "Právní identifikátor",
      organisation: "Organizace",
      reviewDate: "Datum příštího přezkumu",
      saveDraft: "Uložit draft",
      sectionTitleLabel: "Nadpis sekce",
      sourceCitation: "Citace zdroje",
      statusDraft: "Editovatelný draft",
      title: "Zkontrolovat a upravit draft",
      titleLabel: "Název dokumentu",
    },
    list: {
      emptyDate: "bez data",
      emptyState:
        "Zatím není vygenerovaný žádný draft. Otevřete detail politiky, zkontrolujte šablonu a první draft vygenerujte po nastavení úložiště dokumentů.",
      eyebrow: "Knihovna dokumentů",
      fallbackBadge: "Šablona v angličtině",
      fallbackNotice:
        "Ověřená lokální šablona zatím není k dispozici. Tato položka používá ověřenou anglickou EU šablonu pouze k review; generování PDF je vypnuté, dokud nebude lokální verze ověřená.",
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
    editor: {
      bodyLabel: "Section text",
      fieldsHelp: "Use one field per line. Empty lines are ignored.",
      fieldsLabel: "Review fields",
      generateHelp:
        "PDF generation is disabled until private document storage is configured.",
      generatePdf: "Generate PDF from draft",
      localeFallbackHelp:
        "A reviewed template is not available for this language yet. You can review the template detail, but PDF generation is disabled until the local version is reviewed.",
      legalIdentifier: "Legal identifier",
      organisation: "Organisation",
      reviewDate: "Next review date",
      saveDraft: "Save draft",
      sectionTitleLabel: "Section title",
      sourceCitation: "Source citation",
      statusDraft: "Editable draft",
      title: "Review and edit draft",
      titleLabel: "Document title",
    },
    list: {
      emptyDate: "no date",
      emptyState:
        "No draft has been generated yet. Open the policy detail to review the template, then generate the first draft when document storage is configured.",
      eyebrow: "Policy library",
      fallbackBadge: "English template",
      fallbackNotice:
        "A reviewed local-language template is not available yet. This item uses the reviewed EU English template for review only; PDF generation is disabled until the local version is reviewed.",
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
    editor: {
      bodyLabel: "Testo della sezione",
      fieldsHelp: "Usate una voce per riga. Le righe vuote vengono ignorate.",
      fieldsLabel: "Campi di verifica",
      generateHelp:
        "La generazione PDF è disabilitata finché lo storage privato dei documenti non è configurato.",
      generatePdf: "Genera PDF dalla bozza",
      localeFallbackHelp:
        "Per questa lingua non è ancora disponibile un modello verificato. Potete rivedere il dettaglio del modello, ma la generazione PDF è disabilitata finché la versione locale non è verificata.",
      legalIdentifier: "Identificativo legale",
      organisation: "Organizzazione",
      reviewDate: "Data prossima revisione",
      saveDraft: "Salva bozza",
      sectionTitleLabel: "Titolo sezione",
      sourceCitation: "Citazione fonte",
      statusDraft: "Bozza modificabile",
      title: "Rivedi e modifica la bozza",
      titleLabel: "Titolo documento",
    },
    list: {
      emptyDate: "nessuna data",
      emptyState:
        "Nessuna bozza è stata generata finora. Aprite il dettaglio della policy per rivedere il modello, poi generate la prima bozza quando lo storage documenti è configurato.",
      eyebrow: "Libreria documenti",
      fallbackBadge: "Modello in inglese",
      fallbackNotice:
        "Non è ancora disponibile un modello verificato in italiano. Questa voce usa il modello EU in inglese solo per revisione; la generazione PDF è disabilitata finché la versione italiana non è verificata.",
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
