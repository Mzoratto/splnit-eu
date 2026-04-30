import { getControlMappingsForFramework } from "@/lib/controls/library";

export const AI_ACT_CONTROL_MAPPINGS = getControlMappingsForFramework("ai-act");

export const AI_ACT_TIMELINE = [
  {
    date: "2024-08-01",
    label: "AI Act vstoupil v platnost",
    applies: "Bez aktivních povinností.",
  },
  {
    date: "2025-02-02",
    label: "Zakázané praktiky",
    applies: "Článek 5: social scoring, emotion recognition at work, real-time biometric ID.",
  },
  {
    date: "2025-08-02",
    label: "AI gramotnost a GPAI",
    applies: "Článek 4 aktivní pro všechny nasazovatele AI.",
  },
  {
    date: "2026-08-02",
    label: "Hlavní deadline pro nasazovatele",
    applies: "Vysoce riziková AI, transparentnost podle článku 50 a enforcement.",
  },
  {
    date: "2027-08-02",
    label: "Vysoce riziková AI v regulovaných produktech",
    applies: "Zdravotnické prostředky, vozidla a další regulované produkty.",
  },
];

export const AI_ACT_DEPLOYER_ARTICLES = [
  {
    article: "Article 3",
    title: "Definitions",
    deployerSummary:
      "Nasazovatel je osoba nebo organizace používající AI systém pod svou pravomocí v profesionálním kontextu.",
  },
  {
    article: "Article 4",
    title: "AI literacy",
    deployerSummary:
      "Všichni nasazovatelé musí zajistit dostatečnou AI gramotnost zaměstnanců pracujících s AI.",
  },
  {
    article: "Article 5",
    title: "Prohibited practices",
    deployerSummary:
      "Zakazuje manipulativní systémy, social scoring, rozpoznávání emocí na pracovišti a další praktiky.",
  },
  {
    article: "Article 6 + Annex III",
    title: "High-risk classification",
    deployerSummary:
      "AI v HR, úvěrování, vzdělávání, biometrii, kritické infrastruktuře a dalších oblastech může být vysoce riziková.",
  },
  {
    article: "Article 26",
    title: "Deployer obligations",
    deployerSummary:
      "Použití podle instrukcí, lidský dohled, monitoring, logy nejméně 6 měsíců a informování dotčených osob.",
  },
  {
    article: "Article 50",
    title: "Transparency obligations",
    deployerSummary:
      "Chatboty musí sdělit, že jsou AI, a AI generovaný obsah má být označen.",
  },
  {
    article: "Article 99",
    title: "Penalties",
    deployerSummary:
      "Pokuty mohou dosáhnout až 35 mil. EUR nebo 7 % obratu u zakázaných praktik.",
  },
];

export const AI_ACT_ANNEX_III_CATEGORIES = [
  {
    section: "1",
    title: "Biometric identification and categorisation",
    czechExample: "Docházkový systém s rozpoznáváním obličeje.",
    smeRelevance: "Střední, ale emotion recognition na pracovišti je zakázaná praktika.",
  },
  {
    section: "2",
    title: "Critical infrastructure",
    czechExample: "AI systémy pro řízení energetické sítě nebo dopravy.",
    smeRelevance: "Nízká pro běžná MSP, vysoká pro utilities a infrastrukturu.",
  },
  {
    section: "3",
    title: "Education and vocational training",
    czechExample: "AI hodnotící přijímací zkoušky nebo automatické testy.",
    smeRelevance: "Relevantní pro e-learning a vzdělávací platformy.",
  },
  {
    section: "4",
    title: "Employment and workers management",
    czechExample: "AI třídění životopisů nebo hodnocení pohovorů.",
    smeRelevance: "Nejčastější high-risk kategorie pro česká MSP.",
  },
  {
    section: "5a",
    title: "Creditworthiness and insurance risk",
    czechExample: "AI hodnocení bonity klientů nebo pojistného rizika.",
    smeRelevance: "Relevantní pro fintech, banky a pojišťovny.",
  },
  {
    section: "5b",
    title: "Essential public services",
    czechExample: "AI rozhodování o sociálních dávkách.",
    smeRelevance: "Hlavně veřejný sektor a sociální služby.",
  },
  {
    section: "6",
    title: "Law enforcement",
    czechExample: "Predictive policing nebo analýza důkazů.",
    smeRelevance: "Typicky mimo běžná MSP.",
  },
  {
    section: "7",
    title: "Migration, asylum, and border control",
    czechExample: "Ověřování cestovních dokumentů na hranicích.",
    smeRelevance: "Typicky mimo běžná MSP.",
  },
  {
    section: "8",
    title: "Administration of justice and democratic processes",
    czechExample: "AI pro soudní rozhodování nebo volební kampaně.",
    smeRelevance: "Relevantní pro legal tech a politické kampaně.",
  },
];
