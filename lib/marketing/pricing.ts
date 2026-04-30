export type Plan = {
  name: string;
  description: string;
  monthly: number;
  annual: number;
  featured?: boolean;
  cta: string;
  href: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    name: "Zdarma",
    description: "Vyzkoušejte platformu bez závazků.",
    monthly: 0,
    annual: 0,
    cta: "Začít zdarma",
    href: "/sign-up",
    features: [
      "1 předpis",
      "Manuální kontroly",
      "3 vzory dokumentů",
      "1 uživatel",
      "Komunitní podpora",
    ],
  },
  {
    name: "Starter",
    description: "Pro firmy, které berou soulad vážně.",
    monthly: 59,
    annual: 49,
    featured: true,
    cta: "Zahájit 14denní zkušební verzi",
    href: "/sign-up",
    features: [
      "2 předpisy (NIS2 + 1 další)",
      "3 integrace",
      "200+ automatických testů",
      "Evidence vault",
      "Šablony dokumentů",
      "Upozornění na termíny",
      "5 uživatelů",
      "Email podpora",
    ],
  },
  {
    name: "Business",
    description: "Kompletní platforma pro celý tým.",
    monthly: 149,
    annual: 124,
    cta: "Kontaktovat obchod",
    href: "mailto:hello@splnit.eu",
    features: [
      "5 předpisů",
      "10 integrací",
      "Trust Center",
      "Vendor risk modul",
      "Access reviews",
      "Incident log",
      "25 uživatelů",
      "Prioritní podpora",
    ],
  },
];

export const comparisonGroups = [
  {
    name: "Předpisy",
    rows: [
      ["NIS2", "✓", "✓", "✓"],
      ["EU AI Act", "-", "volitelné", "✓"],
      ["GDPR", "✓", "✓", "✓"],
      ["ISO 27001", "-", "volitelné", "✓"],
      ["CSRD", "-", "-", "brzy"],
      ["DORA", "-", "-", "brzy"],
    ],
  },
  {
    name: "Integrace",
    rows: [
      ["Microsoft 365", "-", "✓", "✓"],
      ["GitHub", "-", "✓", "✓"],
      ["AWS", "-", "✓", "✓"],
      ["Azure", "-", "-", "✓"],
      ["Google Workspace", "-", "-", "✓"],
      ["NÚKIB feed", "-", "✓", "✓"],
    ],
  },
  {
    name: "Automatizace",
    rows: [
      ["Počet testů/hod", "0", "200+", "200+"],
      ["Automatický sběr důkazů", "-", "✓", "✓"],
      ["Upozornění na selhání", "-", "✓", "✓"],
      ["Scheduler", "-", "✓", "✓"],
    ],
  },
  {
    name: "Dokumenty",
    rows: [
      ["Vzory politik", "3", "neomezeně", "neomezeně"],
      ["Generování PDF", "-", "✓", "✓"],
      ["Šablony školení", "-", "✓", "✓"],
      ["Export pro auditora", "-", "✓", "✓"],
    ],
  },
  {
    name: "Trust Center",
    rows: [
      ["Veřejná stránka", "-", "-", "✓"],
      ["NDA brána", "-", "-", "✓"],
      ["Vlastní subdoména", "-", "-", "✓"],
      ["Vlastní doména", "-", "-", "volitelně"],
    ],
  },
  {
    name: "Tým",
    rows: [
      ["Počet uživatelů", "1", "5", "25"],
      ["Role a oprávnění", "-", "✓", "✓"],
      ["SSO/SAML", "-", "-", "volitelně"],
    ],
  },
  {
    name: "Podpora",
    rows: [
      ["Email", "-", "✓", "✓"],
      ["Prioritní email", "-", "-", "✓"],
      ["Dedikovaný CSM", "-", "-", "volitelně"],
      ["SLA", "-", "-", "volitelně"],
    ],
  },
];

export const faqs = [
  {
    question: "Mohu zrušit předplatné kdykoliv?",
    answer:
      "Ano. Žádné roční závazky u měsíčního tarifu. U ročního tarifu vrátíme poměrnou část.",
  },
  {
    question: "Jsou moje data uložena v EU?",
    answer:
      "Ano. Všechna data jsou uložena v AWS eu-west-1 (Irsko). Nikdy neopustí EU.",
  },
  {
    question: "Potřebuji technické znalosti k nastavení?",
    answer: "Ne. Průvodce nastavením zabere 15 minut bez IT oddělení.",
  },
  {
    question: "Je Splnit.eu právní poradenství?",
    answer:
      "Ne. Platforma vám pomáhá připravit se na právní přezkum — nenahrazuje kvalifikovaného právníka.",
  },
  {
    question: "Nabízíte slevu pro neziskové organizace nebo startupy?",
    answer:
      "Ano. Kontaktujte nás na hello@splnit.eu pro speciální podmínky.",
  },
  {
    question: "Co se stane s mými daty po zrušení?",
    answer:
      "Máte 30 dní na export veškerých dat. Poté jsou trvale smazána.",
  },
];
