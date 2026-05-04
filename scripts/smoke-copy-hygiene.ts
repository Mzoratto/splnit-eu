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

const checkedFiles = [
  "messages/en-EU.json",
  "messages/it-IT.json",
  ...listSourceFiles("app/(app)"),
];

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return listSourceFiles(path);
    }

    return /\.(ts|tsx)$/.test(path) ? [path] : [];
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

assert.deepEqual(failures, [], failures.join("\n"));

console.log("Copy hygiene smoke test passed.");
