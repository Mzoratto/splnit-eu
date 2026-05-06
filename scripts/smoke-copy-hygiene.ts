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

assert.deepEqual(failures, [], failures.join("\n"));

console.log("Copy hygiene smoke test passed.");
