import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { ITALIAN_NIS2_ACN_GUIDANCE_DOCUMENTS } from "../lib/regulations/italian-nis2-acn";
import { ITALIAN_NIS2_ARTICLES, ITALIAN_NIS2_SOURCE } from "../lib/regulations/italian-nis2";

function assertOfficialHost(url: string, expectedHostname: string, label: string) {
  assert.equal(new URL(url).hostname, expectedHostname, `${label} should use ${expectedHostname}.`);
}

assert.equal(ITALIAN_NIS2_SOURCE.filename, "it/dlgs-138-2024.html");
assert.equal(ITALIAN_NIS2_SOURCE.jurisdiction, "IT");
assert.equal(ITALIAN_NIS2_SOURCE.locale, "it-IT");
assertOfficialHost(
  ITALIAN_NIS2_SOURCE.url,
  "www.gazzettaufficiale.it",
  ITALIAN_NIS2_SOURCE.filename,
);

assert.equal(
  ITALIAN_NIS2_ARTICLES.length,
  44,
  "Italian NIS2 source model should enumerate all 44 D.Lgs. 138/2024 article fetch targets.",
);

for (const articleId of [1, 23, 24, 25, 44]) {
  const article = ITALIAN_NIS2_ARTICLES.find((candidate) => candidate.articleId === articleId);

  assert.ok(article, `D.Lgs. 138/2024 Art. ${articleId} should be represented.`);
  assert.equal(article.citation, `D.Lgs. 138/2024, Art. ${articleId}`);
  assertOfficialHost(
    article.url,
    "www.gazzettaufficiale.it",
    `D.Lgs. 138/2024 Art. ${articleId}`,
  );
}

const acnGuidanceArticleKeys = [
  "ACN 136117/2025",
  "ACN 164179/2025",
  "ACN 164179/2025 Allegato 1",
  "ACN 164179/2025 Allegato 2",
  "ACN 164179/2025 Allegato 3",
  "ACN 164179/2025 Allegato 4",
  "ACN 112335/2026",
  "ACN 276206/2025",
  "ACN 127437/2026",
  "ACN 136118/2025",
  "ACN 379907/2025",
  "ACN 127434/2026",
  "ACN 155238/2026",
] as const;

assert.deepEqual(
  ITALIAN_NIS2_ACN_GUIDANCE_DOCUMENTS.map((document) => document.articleKey),
  [...acnGuidanceArticleKeys],
  "Italian NIS2 ACN source metadata should include the expected guidance documents.",
);

for (const document of ITALIAN_NIS2_ACN_GUIDANCE_DOCUMENTS) {
  assert.match(document.sourceDocument.filename, /^it\/acn-/);
  assertOfficialHost(document.sourceDocument.url, "www.acn.gov.it", document.sourceDocument.filename);
}

const importScriptPaths = [
  "scripts/import-italian-nis2-articles.ts",
  "scripts/import-italian-nis2-acn-guidance.ts",
] as const;

for (const importScriptPath of importScriptPaths) {
  assert.ok(existsSync(importScriptPath), `${importScriptPath} should exist for local/test DB imports.`);
  const importScript = readFileSync(importScriptPath, "utf8");

  assert.match(
    importScript,
    /reviewStatus:\s*"draft"/,
    `${importScriptPath} must keep Italian NIS2 imports draft/secondary until reviewed-row promotion is approved.`,
  );
  assert.doesNotMatch(
    importScript,
    /reviewStatus:\s*"reviewed"/,
    `${importScriptPath} must not promote Italian NIS2 articles to reviewed in T4-G.`,
  );
}

const articleImportScript = readFileSync("scripts/import-italian-nis2-articles.ts", "utf8");
assert.match(
  articleImportScript,
  /confidence:\s*"draft"/,
  "Italian NIS2 framework-control links should remain draft pending mapping review.",
);
assert.doesNotMatch(
  articleImportScript,
  /confidence:\s*"reviewed"/,
  "Italian NIS2 mapping imports must not be promoted to reviewed in T4-G.",
);

console.log("Italian NIS2 draft/secondary source-layer smoke test passed.");
