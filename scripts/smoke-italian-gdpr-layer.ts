import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";

import { GDPR_EU_ARTICLES, GDPR_EU_IT_SOURCE } from "../lib/regulations/gdpr-eu";
import { ITALIAN_GDPR_CODICE_PRIVACY_DOCUMENT } from "../lib/regulations/italian-gdpr-codice-privacy";
import { ITALIAN_GDPR_GARANTE_GUIDANCE_DOCUMENTS } from "../lib/regulations/italian-gdpr-garante";

const requiredGaranteArticleKeys = [
  "Garante Data Breach",
  "Garante DPIA",
  "Garante Registro Trattamenti FAQ",
] as const;

const requiredGdprArticleIds = [5, 30, 32, 33, 35, 99] as const;

function assertOfficialHost(url: string, expectedHostname: string, label: string) {
  assert.equal(new URL(url).hostname, expectedHostname, `${label} should use ${expectedHostname}.`);
}

assert.equal(GDPR_EU_IT_SOURCE.filename, "eu/gdpr-2016-679-it.pdf");
assert.equal(GDPR_EU_IT_SOURCE.jurisdiction, "EU");
assert.equal(GDPR_EU_IT_SOURCE.locale, "it-IT");
assertOfficialHost(GDPR_EU_IT_SOURCE.url, "eur-lex.europa.eu", GDPR_EU_IT_SOURCE.filename);
assert.equal(
  GDPR_EU_ARTICLES.length,
  99,
  "Italian GDPR EUR-Lex source model should enumerate 99 GDPR articles.",
);

for (const articleId of requiredGdprArticleIds) {
  assert.ok(
    GDPR_EU_ARTICLES.some((article) => article.articleId === articleId),
    `GDPR Article ${articleId} should be represented in the Italian GDPR source model.`,
  );
}

assert.equal(ITALIAN_GDPR_CODICE_PRIVACY_DOCUMENT.articleKey, "D.Lgs. 196/2003");
assert.equal(
  ITALIAN_GDPR_CODICE_PRIVACY_DOCUMENT.sourceDocument.filename,
  "it/codice-privacy-dlgs-196-2003.html",
);
assertOfficialHost(
  ITALIAN_GDPR_CODICE_PRIVACY_DOCUMENT.sourceDocument.url,
  "www.normattiva.it",
  ITALIAN_GDPR_CODICE_PRIVACY_DOCUMENT.sourceDocument.filename,
);

assert.deepEqual(
  ITALIAN_GDPR_GARANTE_GUIDANCE_DOCUMENTS.map((document) => document.articleKey),
  [...requiredGaranteArticleKeys],
  "Italian GDPR Garante source metadata should include the expected guidance documents.",
);

for (const document of ITALIAN_GDPR_GARANTE_GUIDANCE_DOCUMENTS) {
  assert.match(document.sourceDocument.filename, /^it\/garante-/);
  assertOfficialHost(
    document.sourceDocument.url,
    "www.garanteprivacy.it",
    document.sourceDocument.filename,
  );
}

const italianGdprImportScripts = [
  "scripts/import-gdpr-eu-it-articles.ts",
  "scripts/import-italian-gdpr-codice-privacy.ts",
  "scripts/import-italian-gdpr-garante-guidance.ts",
] as const;

for (const scriptPath of italianGdprImportScripts) {
  assert.ok(existsSync(scriptPath), `${scriptPath} should exist for local/test DB imports.`);
  const source = readFileSync(scriptPath, "utf8");

  assert.match(
    source,
    /reviewStatus:\s*"draft"/,
    `${scriptPath} must keep Italian GDPR article imports draft/secondary until reviewed-row promotion is approved.`,
  );
  assert.doesNotMatch(
    source,
    /reviewStatus:\s*"reviewed"/,
    `${scriptPath} must not promote Italian GDPR articles to reviewed in T4-G.`,
  );
}

console.log("Italian GDPR draft/secondary source-layer smoke test passed.");
