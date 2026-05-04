import type { Locale } from "@/i18n/routing";
import type { FrameworkDetail } from "@/lib/marketing/frameworks";

type FrameworkDetailCopy = Partial<
  Pick<FrameworkDetail, "regulator" | "deadline" | "law" | "hero" | "appliesTo" | "obligations" | "fines" | "splnitHelps" | "resources">
>;

const englishDetails: Record<string, FrameworkDetailCopy> = {
  nis2: {
    regulator: "National cybersecurity authority",
    deadline: "October 2024",
    law: "Directive (EU) 2022/2555",
    hero:
      "NIS2 requires risk management, management accountability, incident reporting, and evidence that security controls are working. Splnit.eu turns those obligations into controls, evidence tasks, and document workflows for EU SMB teams.",
    appliesTo: [
      "Medium and large organisations in sectors listed by NIS2, usually from 50 employees or EUR 10 million turnover.",
      "Digital infrastructure, cloud, managed IT, online marketplaces, and other digital service providers.",
      "Manufacturing, energy, healthcare, transport, and suppliers supporting regulated services.",
      "SMB suppliers that need to prove cybersecurity maturity to enterprise customers.",
    ],
    obligations: [
      {
        title: "Multi-factor authentication",
        reference: "Article 21(2)(j)",
        deadline: "active",
        description: "Strong authentication for users, privileged accounts, and remote access.",
      },
      {
        title: "Vulnerability management",
        reference: "Article 21(2)(e)",
        deadline: "continuous",
        description: "Track vulnerabilities, prioritise remediation, and keep evidence of the response.",
      },
      {
        title: "Incident response",
        reference: "Article 23",
        deadline: "24 hours",
        description: "Prepare early-warning and follow-up reporting for significant incidents.",
      },
      {
        title: "Supply-chain risk",
        reference: "Article 21(2)(d)",
        deadline: "active",
        description: "Assess ICT suppliers and document risks in contracts, reviews, and evidence packs.",
      },
    ],
    fines: [
      {
        violation: "Essential entities",
        maximum: "EUR 10 million or 2% of worldwide turnover",
        enforcer: "National authority",
      },
      {
        violation: "Important entities",
        maximum: "EUR 7 million or 1.4% of worldwide turnover",
        enforcer: "National authority",
      },
      {
        violation: "Late incident reporting",
        maximum: "Depends on severity and turnover",
        enforcer: "National authority",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:shield-network-linear",
        title: "Control mapping",
        description: "Map NIS2 Article 21 measures to concrete controls and evidence requirements.",
      },
      {
        icon: "solar:bolt-circle-linear",
        title: "Automated checks",
        description: "Collect evidence from Microsoft 365, AWS, and GitHub where automation is available.",
      },
      {
        icon: "solar:document-check-linear",
        title: "Incident evidence",
        description: "Keep an audit trail for incidents, access, vulnerabilities, and supplier risk.",
      },
    ],
    resources: ["NIS2 checklist", "NIS2 obligations map", "Incident log template"],
  },
  "eu-ai-act": {
    regulator: "EU and national authorities",
    deadline: "August 2026",
    law: "Regulation (EU) 2024/1689",
    hero:
      "The EU AI Act classifies AI systems by risk. Organisations using AI need an inventory, AI literacy, transparency processes, and stronger controls for high-risk use cases.",
    appliesTo: [
      "Companies using AI for HR, finance, scoring, safety, customer support, or internal decision support.",
      "SaaS teams providing AI features to customers in the EU.",
      "Organisations using generative AI in operational processes.",
      "Providers and deployers of high-risk AI systems listed in Annex III.",
    ],
    obligations: [
      {
        title: "AI literacy",
        reference: "Article 4",
        deadline: "August 2025",
        description: "Train staff who use, supervise, or manage AI systems.",
      },
      {
        title: "AI use inventory",
        reference: "Article 26",
        deadline: "August 2026",
        description: "Record purpose, owner, risk, input data, and business process for each AI system.",
      },
      {
        title: "Human oversight",
        reference: "Article 14",
        deadline: "August 2026",
        description: "Assign responsibility for decisions supported by high-risk AI systems.",
      },
      {
        title: "Transparency",
        reference: "Article 50",
        deadline: "depends on use",
        description: "Inform users when they interact with AI or receive AI-generated content where required.",
      },
    ],
    fines: [
      {
        violation: "Prohibited AI practices",
        maximum: "EUR 35 million or 7% of worldwide turnover",
        enforcer: "National authority",
      },
      {
        violation: "High-risk AI obligations",
        maximum: "EUR 15 million or 3% of worldwide turnover",
        enforcer: "National authority",
      },
      {
        violation: "Incorrect information to authorities",
        maximum: "EUR 7.5 million or 1% of worldwide turnover",
        enforcer: "National authority",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:cpu-bolt-linear",
        title: "AI inventory",
        description: "Track tools, owners, purposes, risk levels, and review status.",
      },
      {
        icon: "solar:document-text-linear",
        title: "AI policy",
        description: "Generate working policies for acceptable AI use and human oversight.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "AI literacy evidence",
        description: "Record training completion and staff acknowledgement.",
      },
    ],
    resources: ["EU AI Act overview", "AI policy template", "AI literacy training"],
  },
  gdpr: {
    regulator: "Data protection authority",
    deadline: "Active",
    law: "Regulation (EU) 2016/679",
    hero:
      "GDPR applies to organisations that process personal data. It requires processing records, data subject rights, processor contracts, risk assessments, and breach notification within 72 hours when required.",
    appliesTo: [
      "Any organisation processing customer, employee, prospect, or supplier personal data.",
      "E-commerce, SaaS, agencies, healthcare, professional services, and B2B teams with CRM data.",
      "Companies using analytics, marketing tools, cloud services, or external processors.",
      "Organisations transferring personal data outside the EU or EEA.",
    ],
    obligations: [
      {
        title: "Records of processing",
        reference: "Article 30",
        deadline: "active",
        description: "Maintain records for core processing activities, systems, purposes, and processors.",
      },
      {
        title: "DPIA",
        reference: "Article 35",
        deadline: "before high-risk processing",
        description: "Assess risk and safeguards before high-risk personal data processing starts.",
      },
      {
        title: "Breach notification",
        reference: "Article 33",
        deadline: "72 hours",
        description: "Notify the competent authority when a personal data breach meets the reporting threshold.",
      },
      {
        title: "Processor contracts",
        reference: "Article 28",
        deadline: "active",
        description: "Keep processor terms and supplier reviews for vendors handling personal data.",
      },
    ],
    fines: [
      {
        violation: "Core principle violations",
        maximum: "EUR 20 million or 4% of worldwide turnover",
        enforcer: "Data protection authority",
      },
      {
        violation: "Process obligations",
        maximum: "EUR 10 million or 2% of worldwide turnover",
        enforcer: "Data protection authority",
      },
      {
        violation: "Late breach notification",
        maximum: "Depends on impact and delay",
        enforcer: "Data protection authority",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:folder-with-files-linear",
        title: "ROPA generator",
        description: "Build processing records from systems, teams, vendors, and purposes.",
      },
      {
        icon: "solar:shield-user-linear",
        title: "DPIA workflow",
        description: "Track risk assessment steps, approvals, mitigations, and review dates.",
      },
      {
        icon: "solar:bell-linear",
        title: "72-hour incident log",
        description: "Keep a defensible breach timeline and exportable notification record.",
      },
    ],
    resources: ["GDPR audit checklist", "ROPA template", "DPIA template"],
  },
  "iso-27001": {
    regulator: "ISO",
    deadline: "Continuous",
    law: "ISO/IEC 27001:2022",
    hero:
      "ISO 27001 is the certification standard for information security management systems. It requires risk management, a Statement of Applicability, documented controls, internal audit, and continual improvement.",
    appliesTo: [
      "SaaS and technology companies selling to enterprise customers.",
      "Suppliers that need to prove information security maturity in tenders.",
      "Teams preparing for ISO 27001 certification with an accredited certification body.",
      "Companies standardising security processes across IT, HR, legal, and operations.",
    ],
    obligations: [
      {
        title: "Risk management",
        reference: "Clause 6.1.2",
        deadline: "before certification",
        description: "Identify, assess, and treat information security risks.",
      },
      {
        title: "Statement of Applicability",
        reference: "Clause 6.1.3",
        deadline: "before audit",
        description: "Select relevant Annex A controls and justify inclusions or exclusions.",
      },
      {
        title: "Access control",
        reference: "Annex A 5.15",
        deadline: "continuous",
        description: "Manage access rights, MFA, privileged access, and periodic reviews.",
      },
      {
        title: "Internal audit evidence",
        reference: "Clause 9.2",
        deadline: "at planned intervals",
        description: "Keep audit plans, findings, corrective actions, and management review inputs.",
      },
    ],
    fines: [
      {
        violation: "Failed certification audit",
        maximum: "Certificate not issued or suspended",
        enforcer: "Certification body",
      },
      {
        violation: "Customer security requirement not met",
        maximum: "Contract risk",
        enforcer: "Customer",
      },
      {
        violation: "Insufficient audit evidence",
        maximum: "Repeat audit or remediation",
        enforcer: "Auditor",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:document-check-linear",
        title: "SoA and policies",
        description: "Generate working documents for Annex A controls and risk treatment.",
      },
      {
        icon: "solar:cloud-download-linear",
        title: "Evidence vault",
        description: "Collect audit evidence from Microsoft 365, GitHub, and AWS.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "Access reviews",
        description: "Track account reviews, role changes, and exceptions.",
      },
    ],
    resources: ["ISO 27001 gap analysis", "Statement of Applicability", "Annex A checklist"],
  },
  csrd: {
    regulator: "National ESG authority",
    deadline: "2026+",
    law: "Directive (EU) 2022/2464",
    hero:
      "CSRD expands sustainability reporting and creates evidence pressure across supply chains. SMBs may not report directly yet, but they often need reliable ESG data for enterprise customers.",
    appliesTo: [
      "Large companies and public-interest entities within the CSRD scope.",
      "Suppliers receiving ESG questionnaires from enterprise customers.",
      "Companies preparing emissions, workforce, governance, and supplier data.",
      "SMBs that want to keep regulated or enterprise supplier relationships.",
    ],
    obligations: [
      {
        title: "Double materiality",
        reference: "ESRS 1",
        deadline: "2026+",
        description: "Assess how sustainability topics affect the company and how the company affects society and environment.",
      },
      {
        title: "Data evidence",
        reference: "ESRS 2",
        deadline: "2026+",
        description: "Collect verifiable data for reporting and customer questionnaires.",
      },
      {
        title: "Supply-chain governance",
        reference: "ESRS G1",
        deadline: "2026+",
        description: "Keep ownership, supplier answers, and supporting records in one place.",
      },
      {
        title: "Report approval",
        reference: "CSRD",
        deadline: "annual",
        description: "Define review, approval, and export processes for reporting cycles.",
      },
    ],
    fines: [
      {
        violation: "Missing or inaccurate report",
        maximum: "Depends on national law",
        enforcer: "National authority",
      },
      {
        violation: "Unauditable data",
        maximum: "Repeat assurance work",
        enforcer: "Auditor",
      },
      {
        violation: "Supplier ESG requirement not met",
        maximum: "Lost customer relationship",
        enforcer: "Customer",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:leaf-linear",
        title: "ESG inventory",
        description: "Track requirements, owners, evidence, and data sources.",
      },
      {
        icon: "solar:documents-linear",
        title: "Questionnaires",
        description: "Reuse approved answers for enterprise customer requests.",
      },
      {
        icon: "solar:calendar-check-linear",
        title: "Deadlines",
        description: "Track reporting cycles, approvals, and review dates.",
      },
    ],
    resources: ["CSRD readiness checklist", "ESG data inventory", "Supplier questionnaire"],
  },
  dora: {
    regulator: "Financial regulator",
    deadline: "January 2025",
    law: "Regulation (EU) 2022/2554",
    hero:
      "DORA harmonises digital operational resilience requirements for the financial sector. It covers ICT risk management, resilience testing, incident reporting, and third-party ICT supplier oversight.",
    appliesTo: [
      "Banks, payment institutions, insurers, investment firms, and other regulated financial entities.",
      "ICT suppliers providing critical services to financial institutions.",
      "Fintech teams entering regulated financial services.",
      "Companies operating cloud infrastructure used for financial products.",
    ],
    obligations: [
      {
        title: "ICT risk management",
        reference: "Article 6",
        deadline: "January 2025",
        description: "Maintain a risk framework for systems, data, continuity, and cloud services.",
      },
      {
        title: "Incident reporting",
        reference: "Article 19",
        deadline: "active",
        description: "Classify and report major ICT incidents under the applicable reporting process.",
      },
      {
        title: "Resilience testing",
        reference: "Article 24",
        deadline: "continuous",
        description: "Run regular tests for availability, recovery, and security controls.",
      },
      {
        title: "Third-party risk",
        reference: "Article 28",
        deadline: "active",
        description: "Maintain records for critical ICT suppliers and contractual control requirements.",
      },
    ],
    fines: [
      {
        violation: "Weak ICT risk framework",
        maximum: "Depends on national law",
        enforcer: "Financial regulator",
      },
      {
        violation: "Unreported major ICT incident",
        maximum: "Depends on impact",
        enforcer: "Financial regulator",
      },
      {
        violation: "Insufficient supplier oversight",
        maximum: "Remediation order or sanctions",
        enforcer: "Financial regulator",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:banknote-2-linear",
        title: "ICT risk evidence",
        description: "Link systems, risks, suppliers, and controls in one evidence model.",
      },
      {
        icon: "solar:shield-warning-linear",
        title: "Incident log",
        description: "Track incident timeline, classification, decisions, and reporting outputs.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "Vendor risk",
        description: "Maintain critical supplier records and required evidence.",
      },
    ],
    resources: ["DORA checklist", "ICT incident log", "Vendor risk template"],
  },
};

const italianDetails: Record<string, FrameworkDetailCopy> = {
  nis2: {
    regulator: "ACN",
    deadline: "Ottobre 2024",
    law: "D.Lgs. 138/2024",
    hero:
      "NIS2 introduce obblighi di gestione del rischio, responsabilità del management, notifica degli incidenti ed evidenze sui controlli di sicurezza. Splnit.eu traduce questi obblighi in controlli, attività di evidenza e documenti per PMI italiane.",
    appliesTo: [
      "Organizzazioni medie e grandi nei settori previsti da NIS2, di norma da 50 dipendenti o 10 milioni EUR di fatturato.",
      "Infrastrutture digitali, cloud, servizi IT gestiti, marketplace online e altri fornitori digitali.",
      "Manifatturiero, energia, sanità, trasporti e fornitori a supporto di servizi regolati.",
      "PMI fornitrici che devono dimostrare maturità cyber a clienti enterprise.",
    ],
    obligations: [
      {
        title: "Autenticazione multifattore",
        reference: "Articolo 21(2)(j)",
        deadline: "attivo",
        description: "Autenticazione forte per utenti, account privilegiati e accessi remoti.",
      },
      {
        title: "Gestione vulnerabilità",
        reference: "Articolo 21(2)(e)",
        deadline: "continuo",
        description: "Tracciamento vulnerabilità, priorità di remediation ed evidenze della risposta.",
      },
      {
        title: "Risposta agli incidenti",
        reference: "Articolo 23",
        deadline: "24 ore",
        description: "Preparazione di early warning e notifiche successive per incidenti significativi.",
      },
      {
        title: "Rischio supply chain",
        reference: "Articolo 21(2)(d)",
        deadline: "attivo",
        description: "Valutazione dei fornitori ICT e documentazione dei rischi in contratti, review ed evidence pack.",
      },
    ],
    fines: [
      {
        violation: "Soggetti essenziali",
        maximum: "10 milioni EUR o 2% del fatturato mondiale",
        enforcer: "ACN",
      },
      {
        violation: "Soggetti importanti",
        maximum: "7 milioni EUR o 1,4% del fatturato mondiale",
        enforcer: "ACN",
      },
      {
        violation: "Notifica incidente in ritardo",
        maximum: "In base a gravità e fatturato",
        enforcer: "ACN",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:shield-network-linear",
        title: "Mappatura controlli",
        description: "Collega le misure NIS2 a controlli concreti ed evidenze richieste.",
      },
      {
        icon: "solar:bolt-circle-linear",
        title: "Controlli automatici",
        description: "Raccoglie evidenze da Microsoft 365, AWS e GitHub dove l'automazione è disponibile.",
      },
      {
        icon: "solar:document-check-linear",
        title: "Evidenze incidenti",
        description: "Mantiene una traccia audit per incidenti, accessi, vulnerabilità e rischio fornitori.",
      },
    ],
    resources: ["Checklist NIS2", "Mappa obblighi NIS2", "Template incident log"],
  },
  "eu-ai-act": {
    regulator: "Autorità UE e nazionali",
    deadline: "Agosto 2026",
    law: "Regolamento (UE) 2024/1689",
    hero:
      "L'EU AI Act classifica i sistemi AI in base al rischio. Le aziende che usano AI devono gestire inventario, alfabetizzazione AI, trasparenza e controlli più forti per i casi ad alto rischio.",
    appliesTo: [
      "Aziende che usano AI per HR, finanza, scoring, sicurezza, customer support o supporto decisionale interno.",
      "Team SaaS che offrono funzionalità AI a clienti nell'UE.",
      "Organizzazioni che usano AI generativa nei processi operativi.",
      "Provider e deployer di sistemi AI ad alto rischio elencati nell'Annex III.",
    ],
    obligations: [
      {
        title: "AI literacy",
        reference: "Articolo 4",
        deadline: "agosto 2025",
        description: "Formazione del personale che usa, supervisiona o gestisce sistemi AI.",
      },
      {
        title: "Inventario uso AI",
        reference: "Articolo 26",
        deadline: "agosto 2026",
        description: "Registro di scopo, owner, rischio, dati in ingresso e processo aziendale per ogni sistema AI.",
      },
      {
        title: "Supervisione umana",
        reference: "Articolo 14",
        deadline: "agosto 2026",
        description: "Responsabilità assegnata per decisioni supportate da sistemi AI ad alto rischio.",
      },
      {
        title: "Trasparenza",
        reference: "Articolo 50",
        deadline: "dipende dall'uso",
        description: "Informare gli utenti quando interagiscono con AI o ricevono contenuti generati da AI, ove richiesto.",
      },
    ],
    fines: [
      {
        violation: "Pratiche AI vietate",
        maximum: "35 milioni EUR o 7% del fatturato mondiale",
        enforcer: "Autorità nazionale",
      },
      {
        violation: "Obblighi high-risk AI",
        maximum: "15 milioni EUR o 3% del fatturato mondiale",
        enforcer: "Autorità nazionale",
      },
      {
        violation: "Informazioni errate alle autorità",
        maximum: "7,5 milioni EUR o 1% del fatturato mondiale",
        enforcer: "Autorità nazionale",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:cpu-bolt-linear",
        title: "Inventario AI",
        description: "Tiene traccia di strumenti, owner, finalità, rischio e stato di revisione.",
      },
      {
        icon: "solar:document-text-linear",
        title: "Policy AI",
        description: "Genera policy operative per uso accettabile dell'AI e supervisione umana.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "Evidenze AI literacy",
        description: "Registra formazione completata e presa visione del personale.",
      },
    ],
    resources: ["Panoramica EU AI Act", "Template policy AI", "Formazione AI literacy"],
  },
  gdpr: {
    regulator: "Garante Privacy",
    deadline: "Attivo",
    law: "Regolamento (UE) 2016/679 e Codice Privacy",
    hero:
      "Il GDPR riguarda le organizzazioni che trattano dati personali. Richiede registri dei trattamenti, gestione dei diritti, contratti con responsabili, valutazioni del rischio e notifica delle violazioni entro 72 ore quando necessario.",
    appliesTo: [
      "Qualsiasi organizzazione che tratta dati personali di clienti, dipendenti, prospect o fornitori.",
      "E-commerce, SaaS, agenzie, sanità, servizi professionali e team B2B con dati CRM.",
      "Aziende che usano analytics, marketing tool, cloud o responsabili esterni.",
      "Organizzazioni che trasferiscono dati personali fuori dall'UE o dal SEE.",
    ],
    obligations: [
      {
        title: "Registro dei trattamenti",
        reference: "Articolo 30",
        deadline: "attivo",
        description: "Mantenere registri per attività principali, sistemi, finalità e responsabili.",
      },
      {
        title: "DPIA",
        reference: "Articolo 35",
        deadline: "prima del trattamento ad alto rischio",
        description: "Valutare rischi e misure prima di avviare trattamenti ad alto rischio.",
      },
      {
        title: "Notifica violazione",
        reference: "Articolo 33",
        deadline: "72 ore",
        description: "Notificare l'autorità competente quando una violazione supera la soglia di comunicazione.",
      },
      {
        title: "Contratti con responsabili",
        reference: "Articolo 28",
        deadline: "attivo",
        description: "Conservare accordi e review dei fornitori che trattano dati personali.",
      },
    ],
    fines: [
      {
        violation: "Violazioni dei principi fondamentali",
        maximum: "20 milioni EUR o 4% del fatturato mondiale",
        enforcer: "Garante Privacy",
      },
      {
        violation: "Obblighi procedurali",
        maximum: "10 milioni EUR o 2% del fatturato mondiale",
        enforcer: "Garante Privacy",
      },
      {
        violation: "Notifica data breach in ritardo",
        maximum: "In base a impatto e ritardo",
        enforcer: "Garante Privacy",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:folder-with-files-linear",
        title: "Generatore ROPA",
        description: "Costruisce registri dei trattamenti da sistemi, team, fornitori e finalità.",
      },
      {
        icon: "solar:shield-user-linear",
        title: "Workflow DPIA",
        description: "Traccia passaggi, approvazioni, mitigazioni e date di revisione.",
      },
      {
        icon: "solar:bell-linear",
        title: "Incident log 72 ore",
        description: "Mantiene una timeline difendibile e record esportabili per la notifica.",
      },
    ],
    resources: ["Checklist audit GDPR", "Template registro trattamenti", "Template DPIA"],
  },
  "iso-27001": {
    regulator: "ISO",
    deadline: "Continuo",
    law: "ISO/IEC 27001:2022",
    hero:
      "ISO 27001 è lo standard di certificazione per i sistemi di gestione della sicurezza delle informazioni. Richiede gestione del rischio, Statement of Applicability, controlli documentati, audit interno e miglioramento continuo.",
    appliesTo: [
      "Aziende SaaS e tech che vendono a clienti enterprise.",
      "Fornitori che devono dimostrare maturità security in gare o vendor review.",
      "Team che preparano la certificazione ISO 27001 con un ente accreditato.",
      "Aziende che vogliono standardizzare processi security tra IT, HR, legal e operations.",
    ],
    obligations: [
      {
        title: "Gestione del rischio",
        reference: "Clause 6.1.2",
        deadline: "prima della certificazione",
        description: "Identificare, valutare e trattare i rischi di sicurezza delle informazioni.",
      },
      {
        title: "Statement of Applicability",
        reference: "Clause 6.1.3",
        deadline: "prima dell'audit",
        description: "Selezionare i controlli Annex A rilevanti e giustificare inclusioni o esclusioni.",
      },
      {
        title: "Access control",
        reference: "Annex A 5.15",
        deadline: "continuo",
        description: "Gestire accessi, MFA, privilegi e review periodiche.",
      },
      {
        title: "Evidenze audit interno",
        reference: "Clause 9.2",
        deadline: "a intervalli pianificati",
        description: "Conservare piani audit, risultati, azioni correttive e input per management review.",
      },
    ],
    fines: [
      {
        violation: "Audit di certificazione non superato",
        maximum: "Certificato non emesso o sospeso",
        enforcer: "Ente di certificazione",
      },
      {
        violation: "Requisito security cliente non soddisfatto",
        maximum: "Rischio contrattuale",
        enforcer: "Cliente",
      },
      {
        violation: "Evidenze audit insufficienti",
        maximum: "Audit ripetuto o remediation",
        enforcer: "Auditor",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:document-check-linear",
        title: "SoA e policy",
        description: "Genera documenti operativi per controlli Annex A e trattamento del rischio.",
      },
      {
        icon: "solar:cloud-download-linear",
        title: "Evidence vault",
        description: "Raccoglie evidenze audit da Microsoft 365, GitHub e AWS.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "Access review",
        description: "Traccia review account, cambi ruolo ed eccezioni.",
      },
    ],
    resources: ["ISO 27001 gap analysis", "Statement of Applicability", "Checklist Annex A"],
  },
  csrd: {
    regulator: "Autorità ESG nazionale",
    deadline: "2026+",
    law: "Direttiva (UE) 2022/2464",
    hero:
      "CSRD estende il reporting di sostenibilità e crea pressione sulle evidenze lungo la supply chain. Le PMI possono non essere ancora soggette direttamente, ma spesso devono fornire dati ESG affidabili ai clienti enterprise.",
    appliesTo: [
      "Grandi imprese e soggetti di interesse pubblico inclusi nel perimetro CSRD.",
      "Fornitori che ricevono questionari ESG da clienti enterprise.",
      "Aziende che preparano dati su emissioni, forza lavoro, governance e fornitori.",
      "PMI che vogliono mantenere relazioni con clienti regolati o enterprise.",
    ],
    obligations: [
      {
        title: "Doppia materialità",
        reference: "ESRS 1",
        deadline: "2026+",
        description: "Valutare come i temi ESG impattano l'azienda e come l'azienda impatta società e ambiente.",
      },
      {
        title: "Evidenze sui dati",
        reference: "ESRS 2",
        deadline: "2026+",
        description: "Raccogliere dati verificabili per reporting e questionari clienti.",
      },
      {
        title: "Governance supply chain",
        reference: "ESRS G1",
        deadline: "2026+",
        description: "Tenere ownership, risposte fornitori e record di supporto in un unico posto.",
      },
      {
        title: "Approvazione report",
        reference: "CSRD",
        deadline: "annuale",
        description: "Definire processi di review, approvazione ed export per i cicli di reporting.",
      },
    ],
    fines: [
      {
        violation: "Report mancante o inaccurato",
        maximum: "Dipende dalla legge nazionale",
        enforcer: "Autorità nazionale",
      },
      {
        violation: "Dati non auditabili",
        maximum: "Assurance da ripetere",
        enforcer: "Auditor",
      },
      {
        violation: "Requisito ESG cliente non soddisfatto",
        maximum: "Perdita relazione cliente",
        enforcer: "Cliente",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:leaf-linear",
        title: "Inventario ESG",
        description: "Traccia requisiti, owner, evidenze e fonti dati.",
      },
      {
        icon: "solar:documents-linear",
        title: "Questionari",
        description: "Riusa risposte approvate per richieste di clienti enterprise.",
      },
      {
        icon: "solar:calendar-check-linear",
        title: "Scadenze",
        description: "Monitora cicli di reporting, approvazioni e date di review.",
      },
    ],
    resources: ["Checklist CSRD readiness", "Inventario dati ESG", "Questionario fornitori"],
  },
  dora: {
    regulator: "Autorità finanziaria",
    deadline: "Gennaio 2025",
    law: "Regolamento (UE) 2022/2554",
    hero:
      "DORA armonizza i requisiti di resilienza operativa digitale nel settore finanziario. Copre gestione del rischio ICT, test di resilienza, incident reporting e controllo dei fornitori ICT terzi.",
    appliesTo: [
      "Banche, istituti di pagamento, assicurazioni, imprese di investimento e altri soggetti finanziari regolati.",
      "Fornitori ICT che erogano servizi critici a istituzioni finanziarie.",
      "Team fintech che entrano in servizi finanziari regolati.",
      "Aziende che gestiscono infrastruttura cloud usata per prodotti finanziari.",
    ],
    obligations: [
      {
        title: "Gestione rischio ICT",
        reference: "Articolo 6",
        deadline: "gennaio 2025",
        description: "Mantenere un framework di rischio per sistemi, dati, continuità e servizi cloud.",
      },
      {
        title: "Incident reporting",
        reference: "Articolo 19",
        deadline: "attivo",
        description: "Classificare e segnalare incidenti ICT rilevanti secondo il processo applicabile.",
      },
      {
        title: "Test di resilienza",
        reference: "Articolo 24",
        deadline: "continuo",
        description: "Eseguire test periodici su disponibilità, recovery e controlli di sicurezza.",
      },
      {
        title: "Rischio terze parti",
        reference: "Articolo 28",
        deadline: "attivo",
        description: "Mantenere record per fornitori ICT critici e requisiti contrattuali di controllo.",
      },
    ],
    fines: [
      {
        violation: "Framework rischio ICT debole",
        maximum: "Dipende dalla legge nazionale",
        enforcer: "Autorità finanziaria",
      },
      {
        violation: "Incidente ICT rilevante non segnalato",
        maximum: "Dipende dall'impatto",
        enforcer: "Autorità finanziaria",
      },
      {
        violation: "Controllo fornitori insufficiente",
        maximum: "Ordine di remediation o sanzioni",
        enforcer: "Autorità finanziaria",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:banknote-2-linear",
        title: "Evidenze rischio ICT",
        description: "Collega sistemi, rischi, fornitori e controlli in un unico modello di evidenze.",
      },
      {
        icon: "solar:shield-warning-linear",
        title: "Incident log",
        description: "Traccia timeline, classificazione, decisioni e output di reporting.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "Vendor risk",
        description: "Mantiene record dei fornitori critici e delle evidenze richieste.",
      },
    ],
    resources: ["Checklist DORA", "ICT incident log", "Template vendor risk"],
  },
};

const localizedDetails: Partial<Record<Locale, Record<string, FrameworkDetailCopy>>> = {
  "en-EU": englishDetails,
  "it-IT": italianDetails,
};

export function localizeFrameworkDetail(
  framework: FrameworkDetail,
  locale: Locale,
): FrameworkDetail {
  const copy = localizedDetails[locale]?.[framework.slug];

  if (!copy) {
    return framework;
  }

  return {
    ...framework,
    ...copy,
  };
}
