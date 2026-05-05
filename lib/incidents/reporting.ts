import { getJurisdictionContext } from "@/lib/jurisdictions/context";

export type IncidentReportTrack = "cybersecurity" | "dataProtection";

type IncidentReportProfile = {
  authority: string;
  checklist: string[];
  citation: string;
  filenamePrefix: string;
  legalBasis: string;
  subject: string;
  timeline: string[];
  title: string;
};

type IncidentReportLabels = {
  affectedCriticalSystems: string;
  affectedPersonalData: string;
  authority: string;
  detectedAt: string;
  description: string;
  generated: string;
  incidentSummary: string;
  legalBasisAndTimeline: string;
  legalId: string;
  no: string;
  noDescription: string;
  notificationChecklist: string;
  organisation: string;
  resolvedAt: string;
  status: string;
  title: string;
  yes: string;
};

const LABELS = {
  CZ: {
    affectedCriticalSystems: "Dotcene kriticke systemy",
    affectedPersonalData: "Dotcene osobni udaje",
    authority: "Urad",
    detectedAt: "Detekovano",
    description: "Popis",
    generated: "Vygenerovano",
    incidentSummary: "Souhrn incidentu",
    legalBasisAndTimeline: "Pravni zaklad a casova osa",
    legalId: "ICO",
    no: "ne",
    noDescription: "Popis nebyl vyplnen.",
    notificationChecklist: "Checklist oznameni",
    organisation: "Organizace",
    resolvedAt: "Vyreseno",
    status: "Stav",
    title: "Nazev",
    yes: "ano",
  },
  EU: {
    affectedCriticalSystems: "Critical systems affected",
    affectedPersonalData: "Personal data affected",
    authority: "Authority",
    detectedAt: "Detected at",
    description: "Description",
    generated: "Generated",
    incidentSummary: "Incident summary",
    legalBasisAndTimeline: "Legal basis and timeline",
    legalId: "Legal ID",
    no: "no",
    noDescription: "No description provided.",
    notificationChecklist: "Notification checklist",
    organisation: "Organisation",
    resolvedAt: "Resolved at",
    status: "Status",
    title: "Title",
    yes: "yes",
  },
  IT: {
    affectedCriticalSystems: "Sistemi critici coinvolti",
    affectedPersonalData: "Dati personali coinvolti",
    authority: "Autorita'",
    detectedAt: "Rilevato il",
    description: "Descrizione",
    generated: "Generato",
    incidentSummary: "Sintesi incidente",
    legalBasisAndTimeline: "Base normativa e timeline",
    legalId: "Codice fiscale / Partita IVA",
    no: "no",
    noDescription: "Nessuna descrizione fornita.",
    notificationChecklist: "Checklist notifica",
    organisation: "Organizzazione",
    resolvedAt: "Risolto il",
    status: "Stato",
    title: "Titolo",
    yes: "si",
  },
} as const satisfies Record<"CZ" | "EU" | "IT", IncidentReportLabels>;

const PROFILES = {
  CZ: {
    cybersecurity: {
      authority: "NUKIB",
      checklist: [
        "Incident classification and legal threshold reviewed",
        "Affected systems, services, and customers identified",
        "Containment and mitigation actions documented",
        "Follow-up report owner assigned",
      ],
      citation: "Zakon c. 264/2025 Sb.",
      filenamePrefix: "nukib-incident",
      legalBasis: "Czech cybersecurity incident notification workflow.",
      subject: "NUKIB initial notification template",
      timeline: [
        "Initial assessment and classification",
        "Notification decision and submission evidence",
        "Follow-up report and lessons learned",
      ],
      title: "NUKIB initial notification template",
    },
    dataProtection: {
      authority: "UOOU",
      checklist: [
        "Personal data breach risk assessment completed",
        "Affected data subjects and data categories identified",
        "Delay reasons documented if notification exceeds 72 hours",
        "High-risk communication to data subjects assessed",
      ],
      citation: "GDPR Article 33-34",
      filenamePrefix: "uoou-incident",
      legalBasis: "GDPR personal-data breach notification workflow.",
      subject: "UOOU GDPR breach notification template",
      timeline: [
        "Assess breach risk without undue delay",
        "Notify where required within 72 hours where feasible",
        "Communicate to affected people if high risk applies",
      ],
      title: "UOOU GDPR breach notification template",
    },
  },
  EU: {
    cybersecurity: {
      authority: "Competent cybersecurity authority",
      checklist: [
        "Incident classification and legal threshold reviewed",
        "Affected services and customers identified",
        "Containment and mitigation actions documented",
        "Follow-up report owner assigned",
      ],
      citation: "Directive (EU) 2022/2555",
      filenamePrefix: "cybersecurity-incident",
      legalBasis: "NIS2 incident notification workflow under applicable local law.",
      subject: "Cybersecurity authority notification template",
      timeline: [
        "Early warning where required",
        "Incident notification where required",
        "Final report where required",
      ],
      title: "Cybersecurity authority notification template",
    },
    dataProtection: {
      authority: "Competent data protection authority",
      checklist: [
        "Personal data breach risk assessment completed",
        "Affected data subjects and data categories identified",
        "Delay reasons documented if notification exceeds 72 hours",
        "High-risk communication to data subjects assessed",
      ],
      citation: "GDPR Article 33-34",
      filenamePrefix: "data-protection-incident",
      legalBasis: "GDPR personal-data breach notification workflow.",
      subject: "Data protection authority breach notification template",
      timeline: [
        "Assess breach risk without undue delay",
        "Notify where required within 72 hours where feasible",
        "Communicate to affected people if high risk applies",
      ],
      title: "Data protection authority breach notification template",
    },
  },
  IT: {
    cybersecurity: {
      authority: "ACN / CSIRT Italia",
      checklist: [
        "Criteri di incidente significativo valutati",
        "Servizi, sistemi e clienti impattati identificati",
        "Azioni di contenimento e mitigazione documentate",
        "Owner della relazione finale assegnato",
      ],
      citation: "D.Lgs. 138/2024, Art. 25",
      filenamePrefix: "acn-incident",
      legalBasis:
        "Workflow di notifica incidente significativo verso CSIRT Italia / ACN.",
      subject: "Bozza notifica incidente ACN",
      timeline: [
        "Preallarme entro 24 ore dalla conoscenza dell'incidente significativo",
        "Notifica entro 72 ore dalla conoscenza dell'incidente significativo",
        "Relazione finale entro un mese dalla notifica",
      ],
      title: "Bozza notifica incidente ACN",
    },
    dataProtection: {
      authority: "Garante per la protezione dei dati personali",
      checklist: [
        "Valutazione del rischio per diritti e liberta' completata",
        "Categorie di dati e interessati identificati",
        "Motivi del ritardo documentati se oltre 72 ore",
        "Comunicazione agli interessati valutata in caso di rischio elevato",
      ],
      citation: "GDPR Art. 33-34",
      filenamePrefix: "garante-data-breach",
      legalBasis:
        "Workflow di notifica violazione dati personali verso il Garante.",
      subject: "Bozza notifica data breach Garante",
      timeline: [
        "Valutare la violazione senza ingiustificato ritardo",
        "Notificare il Garante, ove richiesto, entro 72 ore ove possibile",
        "Comunicare agli interessati se la violazione presenta rischio elevato",
      ],
      title: "Bozza notifica data breach Garante",
    },
  },
} as const satisfies Record<
  "CZ" | "EU" | "IT",
  Record<IncidentReportTrack, IncidentReportProfile>
>;

export function getIncidentReportProfile(input: {
  jurisdiction?: string | null;
  locale?: string | null;
  track: IncidentReportTrack;
}) {
  const context = getJurisdictionContext(input.jurisdiction, input.locale);
  return PROFILES[context.jurisdiction][input.track];
}

export function getIncidentReportLabels(input: {
  jurisdiction?: string | null;
  locale?: string | null;
}) {
  const context = getJurisdictionContext(input.jurisdiction, input.locale);
  return LABELS[context.jurisdiction];
}

export function legacyRegulatorToReportTrack(
  regulator: string,
): IncidentReportTrack | null {
  if (regulator === "nukib" || regulator === "cybersecurity") {
    return "cybersecurity";
  }

  if (regulator === "uoou" || regulator === "dataProtection") {
    return "dataProtection";
  }

  return null;
}
