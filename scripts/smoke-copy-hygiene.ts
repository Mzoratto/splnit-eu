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

const heliosAutomationClaimForbiddenPatterns = [
  /\bHelios\s+evidence\s+is\s+collected\s+automatically\b/i,
  /\bHelios\s+automated\s+evidence\b/i,
  /\bHelios\s+API\s+checks\s+are\s+live\b/i,
  /\b(?:MES\/SCADA|EDI)\s+automatically\s+verified\b/i,
  /\bHelios\b[^\n.]{0,100}\b(?:native|API|runtime)\b[^\n.]{0,100}\b(?:automation|automated|connection|checks?|verification|verified|live)\b/i,
  /\bHelios\b[^\n.]{0,100}\b(?:evidence|checks?|verification|runtime)\b[^\n.]{0,100}\b(?:collected|verified|runs?)\s+automatically\b/i,
] as const;

const heliosAutomationClaimAllowedPatterns = [/\bnot\s+an\s+automated\s+Helios\s+API\s+connection\b/gi] as const;

const activationAutomationLocaleCopyPaths = [
  ["dashboard", "activation", "automationOutcomeTitle"],
  ["dashboard", "activation", "automationOutcomeBody"],
  ["evidence", "records", "emptyAutomationOutcome"],
  ["evidence", "records", "emptyAutomationBlockedAction"],
  ["controlsPage", "index", "automationBlockedStatus"],
] as const;

const activationAutomationBlockedCopyPaths = new Set([
  "evidence.records.emptyAutomationOutcome",
  "evidence.records.emptyAutomationBlockedAction",
  "controlsPage.index.automationBlockedStatus",
]);

const activationAutomationPostureInflationForbiddenPatterns = [
  /\bcompliant\b/i,
  /\bcertified\b/i,
  /\bauditor-ready\b/i,
  /\blegal proof\b/i,
  /\bsatisfies Article\b/i,
  /\bready for audit\b/i,
  /\bcompliance status\b/i,
  /\bspln(?:ě|e)n(?:í|i|o|ou|á|a|ý|y|é|e)?\b/i,
  /\bv souladu\b/i,
  /\bvyhovuje\b/i,
  /\bprávn(?:í|i) důkaz\b/i,
  /\bauditn(?:ě|e) připraven/i,
  /\bconforme\b/i,
  /\bconformità\b/i,
  /\bcertificat/i,
  /\bprova legale\b/i,
  /\bpront[oa] per (?:l['’])?audit\b/i,
  /\bsoddisfa (?:l['’])?articolo\b/i,
] as const;

const activationAutomationBlockedFailureForbiddenPatterns = [
  /\b(?:failed|failure|errored|error)\b/i,
  /\b(?:selhal|selhala|selhání|selhani|neuspěl|neuspela|neúspěch|neuspech)\b/i,
  /\b(?:fallito|fallita|fallimento|errore)\b/i,
] as const;

function redactAllowedHeliosClaimPhrases(content: string) {
  return heliosAutomationClaimAllowedPatterns.reduce(
    (current, pattern) => current.replace(pattern, "[allowed Helios manual-boundary phrase]"),
    content,
  );
}

function matchesHeliosAutomationClaim(content: string, pattern: RegExp) {
  return redactAllowedHeliosClaimPhrases(content).match(pattern);
}

function getJsonPathValue(source: unknown, path: readonly string[]) {
  let current = source;

  for (const segment of path) {
    if (!current || typeof current !== "object" || !(segment in current)) {
      throw new Error(`Missing locale copy path: ${path.join(".")}`);
    }

    current = (current as Record<string, unknown>)[segment];
  }

  if (typeof current !== "string") {
    throw new Error(`Locale copy path is not a string: ${path.join(".")}`);
  }

  return current;
}

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

const jsonLdCheckedFiles = [
  "components/marketing/software-json-ld.tsx",
  "lib/marketing/platform-copy.ts",
];

const jsonLdAutomationTerms = [
  /automated/i,
  /automatic/i,
  /automatiz(?:e|uje|za)/i,
  /automatick(?:ý|é|ych|ých|a|i|ou|ým|ému)?/i,
  /automatici/i,
  /automatica/i,
] as const;

const jsonLdAutomationScopeTerms = [
  /connected integration/i,
  /connected integrations/i,
  /připojen(?:é|ých|ymi|ými)? integrac/i,
  /integrazioni collegate/i,
  /Microsoft 365/i,
  /GitHub/i,
  /AWS/i,
] as const;

const heliosAutomationClaimCheckedFiles = [
  "messages/cs-CZ.json",
  "messages/en-EU.json",
  "messages/it-IT.json",
  ...listSourceFiles("app"),
  ...listSourceFiles("components"),
  ...listSourceFiles("lib"),
  ...listSourceFiles("public"),
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

function assertHeliosClaimGuardSelfTest() {
  const forbiddenSamples = [
    "Helios evidence is collected automatically",
    "Helios automated evidence",
    "Helios API checks are live",
    "MES/SCADA automatically verified",
    "EDI automatically verified",
    "Helios native API automation is live",
    "Helios runtime verification runs automatically",
  ];

  const allowedSamples = [
    "Helios workspace/checklist",
    "manual readiness review",
    "CSV-assisted evidence import",
    "not an automated Helios API connection",
  ];

  const missedForbidden = forbiddenSamples.filter(
    (sample) => !heliosAutomationClaimForbiddenPatterns.some((pattern) => matchesHeliosAutomationClaim(sample, pattern)),
  );
  const rejectedAllowed = allowedSamples.filter((sample) =>
    heliosAutomationClaimForbiddenPatterns.some((pattern) => matchesHeliosAutomationClaim(sample, pattern)),
  );

  assert.deepEqual(missedForbidden, [], `Helios claim guard missed forbidden samples: ${missedForbidden.join(", ")}`);
  assert.deepEqual(rejectedAllowed, [], `Helios claim guard rejected allowed samples: ${rejectedAllowed.join(", ")}`);

  console.log("Helios claim guard self-test passed.");
}

if (process.env.HELIOS_CLAIM_GUARD_SELF_TEST === "1") {
  assertHeliosClaimGuardSelfTest();
}

function assertActivationAutomationCopyGuardSelfTest() {
  const forbiddenSamples = [
    "Automation proves this control is compliant.",
    "Connector evidence is auditor-ready.",
    "Záznam je právní důkaz splnění.",
    "Automatizace je auditně připravená.",
    "Il controllo è conforme.",
    "Prova legale pronta per audit.",
  ];
  const forbiddenBlockedSamples = [
    "Review failed automation",
    "Automatizace selhala",
    "Rivedi errore automazione",
  ];
  const allowedSamples = [
    "Review blocked automation",
    "Zkontrolovat blokovanou automatizaci",
    "Rivedi automazione bloccata",
    "This reflects existing connector evidence and remediation task state.",
  ];

  const missedPostureSamples = forbiddenSamples.filter(
    (sample) => !activationAutomationPostureInflationForbiddenPatterns.some((pattern) => pattern.test(sample)),
  );
  const missedBlockedSamples = forbiddenBlockedSamples.filter(
    (sample) => !activationAutomationBlockedFailureForbiddenPatterns.some((pattern) => pattern.test(sample)),
  );
  const rejectedAllowed = allowedSamples.filter((sample) =>
    activationAutomationPostureInflationForbiddenPatterns.some((pattern) => pattern.test(sample)) ||
    activationAutomationBlockedFailureForbiddenPatterns.some((pattern) => pattern.test(sample)),
  );

  assert.deepEqual(
    missedPostureSamples,
    [],
    `Activation automation copy guard missed forbidden posture samples: ${missedPostureSamples.join(", ")}`,
  );
  assert.deepEqual(
    missedBlockedSamples,
    [],
    `Activation automation copy guard missed forbidden blocked-copy samples: ${missedBlockedSamples.join(", ")}`,
  );
  assert.deepEqual(
    rejectedAllowed,
    [],
    `Activation automation copy guard rejected allowed samples: ${rejectedAllowed.join(", ")}`,
  );
}

assertActivationAutomationCopyGuardSelfTest();

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

for (const file of ["messages/cs-CZ.json", "messages/en-EU.json", "messages/it-IT.json"]) {
  const source = JSON.parse(readFileSync(file, "utf8")) as unknown;

  for (const path of activationAutomationLocaleCopyPaths) {
    const pathLabel = path.join(".");
    const value = getJsonPathValue(source, path);

    for (const pattern of activationAutomationPostureInflationForbiddenPatterns) {
      const match = value.match(pattern);

      if (match) {
        failures.push(`${file}:${pathLabel}: activation automation posture guard matched ${pattern}`);
      }
    }

    if (activationAutomationBlockedCopyPaths.has(pathLabel)) {
      for (const pattern of activationAutomationBlockedFailureForbiddenPatterns) {
        const match = value.match(pattern);

        if (match) {
          failures.push(`${file}:${pathLabel}: activation automation blocked/failure copy guard matched ${pattern}`);
        }
      }
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

function extractQuotedStrings(content: string) {
  return Array.from(content.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)).map(
    (match) => match[1],
  );
}

function extractJsonLdStrings(file: string) {
  const content = readFileSync(file, "utf8");

  if (file === "components/marketing/software-json-ld.tsx") {
    const defaultsBlock = content.match(/const localizedDefaults:[\s\S]*?\n};/);
    return defaultsBlock ? extractQuotedStrings(defaultsBlock[0]) : [];
  }

  if (file === "lib/marketing/platform-copy.ts") {
    return Array.from(
      content.matchAll(/jsonLdDescription:\s*\n\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g),
    ).map((match) => match[1]);
  }

  return [];
}

function hasAnyPattern(value: string, patterns: readonly RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function hasFrameworkAutomationOrTestAdjacency(value: string) {
  const frameworkAlternation = "(?:NIS2|EU AI Act|GDPR|ISO\\s*27001)";
  const automationOrTestAlternation = "(?:test(?:s|y)?|automat\\w*|automatic\\w*)";
  const adjacent = "(?:\\W+\\w+){0,4}\\W+";

  return new RegExp(
    `${frameworkAlternation}${adjacent}${automationOrTestAlternation}|${automationOrTestAlternation}${adjacent}${frameworkAlternation}`,
    "i",
  ).test(value);
}
for (const file of jsonLdCheckedFiles) {
  const strings = extractJsonLdStrings(file);

  for (const value of strings) {
    const hasAutomation = hasAnyPattern(value, jsonLdAutomationTerms);
    const hasScope = hasAnyPattern(value, jsonLdAutomationScopeTerms);
    const hasFrameworkAutomationOrTest = hasFrameworkAutomationOrTestAdjacency(value);

    if (hasAutomation && !hasScope) {
      failures.push(
        `${file}: JSON-LD automation claim is not scoped to connected integrations: ${value}`,
      );
    }

    if (hasFrameworkAutomationOrTest && !hasScope) {
      failures.push(
        `${file}: JSON-LD framework name is adjacent to automation/test claim: ${value}`,
      );
    }
  }
}

for (const file of heliosAutomationClaimCheckedFiles) {
  const content = readFileSync(file, "utf8");

  for (const pattern of heliosAutomationClaimForbiddenPatterns) {
    const match = matchesHeliosAutomationClaim(content, pattern);

    if (match) {
      failures.push(`${file}: Helios automation claim guard matched ${pattern}`);
    }
  }
}

assert.deepEqual(failures, [], failures.join("\n"));

console.log("Copy hygiene smoke test passed.");
