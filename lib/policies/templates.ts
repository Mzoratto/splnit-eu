export type PolicyTemplateType = "ai_policy" | "training_log" | "record_of_use";

export type PolicyTemplate = {
  type: PolicyTemplateType;
  titleCs: string;
  description: string;
  sourceDocument: string;
  controlKeys: string[];
  sections: {
    title: string;
    fields?: string[];
    body?: string;
  }[];
};

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    type: "ai_policy",
    titleCs: "Politika umělé inteligence",
    description:
      "Šablona TPL-001 pro splnění povinností podle EU AI Act, včetně inventáře AI systémů, zakázaných praktik, odpovědností a AI gramotnosti.",
    sourceDocument: "tpl-001-ai-policy-cs.pdf",
    controlKeys: [
      "ctrl_ai_system_inventory",
      "ctrl_ai_literacy_training",
      "ctrl_ai_prohibited_practices_review",
      "ctrl_ai_human_oversight",
      "ctrl_ai_log_retention",
    ],
    sections: [
      {
        title: "Identifikace dokumentu",
        fields: [
          "Organizace",
          "IČO",
          "Verze dokumentu",
          "Datum vydání",
          "Schválil/a",
          "Příští přezkum",
        ],
      },
      {
        title: "Účel a rozsah",
        body: "Zásady, odpovědnosti a postupy organizace při používání AI systémů.",
      },
      {
        title: "Definice",
        fields: ["Systém AI", "Nasazovatel", "Vysoce rizikový AI systém", "AI gramotnost"],
      },
      {
        title: "Inventář AI systémů",
        fields: [
          "Název a verze AI systému",
          "Dodavatel",
          "Účel použití",
          "Role organizace",
          "Klasifikace rizika",
          "Datum posledního přezkumu",
        ],
      },
      {
        title: "Zakázané praktiky",
        body: "Zákaz social scoringu, rozpoznávání emocí na pracovišti, biometrické identifikace v reálném čase a dalších praktik podle článku 5.",
      },
      {
        title: "Odpovědnosti",
        fields: ["Vedení", "Odpovědná osoba za AI", "Vedoucí oddělení", "Zaměstnanci", "IT oddělení"],
      },
      {
        title: "Školení AI gramotnosti",
        body: "Základní školení při nástupu a roční refresh pro zaměstnance pracující s AI.",
      },
      {
        title: "Hlášení incidentů",
        body: "Postup pro hlášení neočekávaných, škodlivých nebo diskriminačních výstupů AI.",
      },
      {
        title: "Přezkum a schválení",
        fields: ["Jméno schvalovatele", "Funkce", "Datum", "Podpis"],
      },
    ],
  },
  {
    type: "training_log",
    titleCs: "Záznam o školení AI gramotnosti",
    description:
      "Šablona TPL-002 pro evidenci školení podle článku 4 EU AI Act.",
    sourceDocument: "tpl-002-training-log-cs.pdf",
    controlKeys: ["ctrl_ai_literacy_training", "ctrl_security_training_annual"],
    sections: [
      {
        title: "Identifikace",
        fields: ["Organizace", "IČO", "Rok", "Odpovědná osoba"],
      },
      {
        title: "Evidence školení",
        fields: [
          "Jméno zaměstnance",
          "Oddělení",
          "Typ školení",
          "Datum",
          "Potvrzení",
        ],
      },
      {
        title: "Typy školení",
        fields: ["AL-1", "AL-2", "AL-3", "AL-4"],
      },
      {
        title: "Podpis odpovědné osoby",
        fields: ["Jméno", "Funkce", "Datum", "Podpis"],
      },
    ],
  },
  {
    type: "record_of_use",
    titleCs: "Záznam o používání AI systému",
    description:
      "Šablona TPL-003 pro manuální záznam použití vysoce rizikové AI, kde automatické logy nejsou dostupné.",
    sourceDocument: "tpl-003-record-of-use-cs.pdf",
    controlKeys: ["ctrl_ai_log_retention", "ctrl_ai_human_oversight"],
    sections: [
      {
        title: "Identifikace AI systému",
        fields: [
          "Název systému",
          "Verze",
          "Dodavatel",
          "Kategorie Přílohy III",
          "Účel použití",
          "Odpovědná osoba",
          "Oddělení",
          "Datum zahájení používání",
        ],
      },
      {
        title: "Protokol používání",
        fields: [
          "Datum",
          "Případ použití",
          "Výsledek AI",
          "Lidský přezkum",
          "Operátor",
        ],
      },
      {
        title: "Záznamy o incidentech",
        fields: ["Datum", "Popis incidentu", "Přijatá opatření", "Hlášen ČTÚ"],
      },
      {
        title: "Přezkum záznamu",
        fields: ["Přezkoumal/a", "Datum přezkumu", "Datum příštího přezkumu", "Podpis"],
      },
    ],
  },
];
