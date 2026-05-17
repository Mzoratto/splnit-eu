import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const forbiddenPatterns = [
  /NÚKIB/,
  /ÚOOÚ/,
  /ČTÚ/,
  /Přehled/,
  /Předpisy/,
  /Důkazy/,
  /Dodavatel/,
  /Vygenerováno/,
  /Stáhnout/,
  /Označit/,
  /Uložit/,
  /Zobrazit/,
  /Vyberte/,
  /nenastaveno/,
  /neodesláno/,
] as const;

const globalForbiddenPatterns = [
  /Splnit Technology/i,
  /Splnit Technology\s+s\.r\.o\.\s*[—-]\s*Ostrava/i,
  /pendingEntity/i,
  /Finální IČO/i,
  /Finální OSVČ/i,
  /ARES odkaz budou doplněn/i,
  /OSVČ údaje budou doplněn/i,
  /\b200\+\s+(automatic|automated|automatick(?:é|ých|ych)?|testy|tests|kontrol|controls|controlli)/i,
  /\b247\s+(automatic|automated|automatick(?:é|ých|ych)?|testy|tests|kontrol|controls|controlli)/i,
] as const;

const marketingForbiddenPatterns = [
  /Splnit Technology/i,
  /CS\s*\|\s*EN\s*\|\s*DE/i,
  /platform#integrace/i,
  /Founder photo before launch/i,
  /Founder-led onboarding/i,
  /Finální IČO/i,
  /OSVČ údaje budou doplněné/i,
] as const;

const productPricingForbiddenPatterns = [
  /\bMost popular\b|\bNejoblíbenější\b|\bPiù scelto\b/i,
  /setup takes 5 minutes|Nastavení trvá 5 minut|configurazione richiede 5 minuti/i,
  /takes 15 minutes|zabere 15 minut|richiede 15 minuti/i,
  /in 2 minutes|within 2 minutes|za 2 minuty|do 2 minut|in 2 minuti|entro 2 minuti/i,
  /Immediate results|Výsledky okamžitě|Risultati immediati/i,
  /No hidden fees|Bez skrytých poplatků|Nessun costo nascosto/i,
  /Cancel anytime|Zrušení kdykoliv|Cancellazione quando volete/i,
  /Unlimited clients|Neomezený počet klientů|Clienti illimitati/i,
  /partner badge|partnerský odznak|badge partner/i,
  /catch .* immediately|Zachyťte .* okamžitě|Intercettate .* subito/i,
  /audit documentation prepared for your auditor|auditní dokumentace připravená pro auditora|documentazione audit pronta per l'auditor/i,
] as const;

const publicLegalForbiddenPatterns = [
  /before production launch/i,
  /must be completed/i,
  /deve essere completat/i,
  /musí být dopln/i,
] as const;

const publicRegulatoryResourceForbiddenPatterns = [
  /Which EU regulations apply to you|Které EU předpisy se vás týkají|Quali normative UE vi riguardano/i,
  /Who must comply|Kdo to musí splnit|Chi deve conformarsi/i,
  /Download all for free|Stáhnout vše zdarma|Scarica tutto gratis/i,
  /compliance status in real time|compliance status v reálném čase|stato compliance in tempo reale/i,
  /Setup in 5 minutes|Nastavení za 5 minut|Setup in 5 minuti/i,
  /MFA kontrola[^.]*splňuje[^.]*NIS2|one MFA control[^.]*satisfies[^.]*NIS2|Un controllo MFA[^.]*soddisfa[^.]*NIS2/i,
  /auditor documentation in one place|dokumentace pro auditora|documentazione per auditor/i,
] as const;

const policyEvidenceForbiddenPatterns = [
  /\bcompliant\b/i,
  /\bNIS2 compliant\b/i,
  /\bGDPR compliant\b/i,
  /\bauditor-ready\b/i,
  /\bcertified\b/i,
  /\blegal proof\b/i,
  /\bsatisfies Article\b/i,
  /\breal-time compliance status\b/i,
] as const;

const checkedFiles = [
  "messages/en-EU.json",
  "messages/it-IT.json",
  ...listSourceFiles("app/(app)"),
];

const globalCheckedFiles = [
  "messages/cs-CZ.json",
  "messages/en-EU.json",
  "messages/it-IT.json",
  ...listSourceFiles("app"),
  ...listSourceFiles("components"),
  ...listSourceFiles("lib"),
  ...listSourceFiles("public"),
];

const marketingCheckedFiles = [
  ...listSourceFiles("app/(marketing)"),
  "components/nav.tsx",
  "components/footer.tsx",
  "components/locale-switcher.tsx",
];

const productPricingCheckedFiles = [
  "messages/cs-CZ.json",
  "messages/en-EU.json",
  "messages/it-IT.json",
  ...listSourceFiles("app/(marketing)"),
  "components/marketing/software-json-ld.tsx",
  "components/footer.tsx",
  "components/nav.tsx",
];

const publicLegalCheckedFiles = ["lib/legal/legal-page-copy.ts"];

const publicRegulatoryResourceCheckedFiles = [
  "messages/cs-CZ.json",
  "messages/en-EU.json",
  "messages/it-IT.json",
  ...listSourceFiles("app/(marketing)"),
  ...listSourceFiles("lib/marketing"),
];

const policyEvidenceCheckedFiles = [
  ...listSourceFiles("app/(app)/controls"),
  ...listSourceFiles("components/policy-evidence"),
  ...listSourceFiles("lib/policy-evidence"),
];

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return listSourceFiles(path);
    }

    return /\.(json|js|ts|tsx)$/.test(path) ? [path] : [];
  });
}

const failures: string[] = [];

for (const file of checkedFiles) {
  const content = readFileSync(file, "utf8");

  for (const pattern of forbiddenPatterns) {
    const match = content.match(pattern);

    if (match) {
      failures.push(`${file}: forbidden copy matched ${pattern}`);
    }
  }
}

for (const file of globalCheckedFiles) {
  const content = readFileSync(file, "utf8");

  for (const pattern of globalForbiddenPatterns) {
    const match = content.match(pattern);

    if (match) {
      failures.push(`${file}: public honesty guard matched ${pattern}`);
    }
  }
}

for (const file of marketingCheckedFiles) {
  const content = readFileSync(file, "utf8");

  for (const pattern of marketingForbiddenPatterns) {
    const match = content.match(pattern);

    if (match) {
      failures.push(`${file}: marketing copy guard matched ${pattern}`);
    }
  }
}

for (const file of productPricingCheckedFiles) {
  const content = readFileSync(file, "utf8");

  for (const pattern of productPricingForbiddenPatterns) {
    const match = content.match(pattern);

    if (match) {
      failures.push(`${file}: product/pricing copy guard matched ${pattern}`);
    }
  }
}

for (const file of publicLegalCheckedFiles) {
  const content = readFileSync(file, "utf8");

  for (const pattern of publicLegalForbiddenPatterns) {
    const match = content.match(pattern);

    if (match) {
      failures.push(`${file}: public legal copy guard matched ${pattern}`);
    }
  }
}

for (const file of publicRegulatoryResourceCheckedFiles) {
  const content = readFileSync(file, "utf8");

  for (const pattern of publicRegulatoryResourceForbiddenPatterns) {
    const match = content.match(pattern);

    if (match) {
      failures.push(`${file}: public regulatory resource guard matched ${pattern}`);
    }
  }
}

for (const file of policyEvidenceCheckedFiles) {
  const content = readFileSync(file, "utf8");

  for (const pattern of policyEvidenceForbiddenPatterns) {
    const match = content.match(pattern);

    if (match) {
      failures.push(`${file}: policy-to-evidence copy guard matched ${pattern}`);
    }
  }
}

assert.deepEqual(failures, [], failures.join("\n"));

console.log("Copy hygiene smoke test passed.");
