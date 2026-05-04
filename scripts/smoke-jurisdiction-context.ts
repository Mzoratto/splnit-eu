import assert from "node:assert/strict";
import { getJurisdictionContext } from "../lib/jurisdictions/context";
import {
  getPolicyStatusLabel,
  getPolicyUiCopy,
} from "../lib/policies/ui-copy";

const cz = getJurisdictionContext("CZ", "cs-CZ");
assert.equal(cz.jurisdiction, "CZ");
assert.equal(cz.locale, "cs-CZ");
assert.equal(cz.labels.legalIdentifier, "IČO");
assert.equal(cz.authorities.dataProtection, "ÚOOÚ");
assert.equal(cz.authorities.cybersecurity, "NÚKIB");

const eu = getJurisdictionContext("EU", "en-EU");
assert.equal(eu.jurisdiction, "EU");
assert.equal(eu.locale, "en-EU");
assert.equal(eu.labels.legalIdentifier, "Legal identifier");
assert.equal(eu.authorities.dataProtection, "Competent data protection authority");
assert.equal(eu.authorities.cybersecurity, "Competent cybersecurity authority");

const it = getJurisdictionContext("IT", "it-IT");
assert.equal(it.jurisdiction, "IT");
assert.equal(it.locale, "it-IT");
assert.equal(it.labels.legalIdentifier, "Codice fiscale / Partita IVA");
assert.equal(
  it.authorities.dataProtection,
  "Garante per la protezione dei dati personali",
);
assert.equal(it.authorities.cybersecurity, "ACN");

const unknown = getJurisdictionContext("DE", "de-DE");
assert.equal(unknown.jurisdiction, "EU");
assert.equal(unknown.locale, "en-EU");
assert.notEqual(unknown.labels.legalIdentifier, "IČO");
assert.notEqual(unknown.authorities.dataProtection, "ÚOOÚ");
assert.notEqual(unknown.authorities.cybersecurity, "NÚKIB");

const italianWithUnknownLocale = getJurisdictionContext("IT", "cs-CZ");
assert.equal(italianWithUnknownLocale.jurisdiction, "IT");
assert.equal(italianWithUnknownLocale.locale, "it-IT");
assert.notEqual(italianWithUnknownLocale.labels.legalIdentifier, "IČO");

const enPolicyCopy = getPolicyUiCopy("en-EU");
assert.equal(enPolicyCopy.list.title, "Compliance documents");
assert.equal(enPolicyCopy.actions.generatePdf, "Generate PDF");
assert.equal(getPolicyStatusLabel("active", "en-EU"), "active");
assert.notEqual(enPolicyCopy.list.emptyDate, "bez data");

const itPolicyCopy = getPolicyUiCopy("it-IT");
assert.equal(itPolicyCopy.list.title, "Documenti di compliance");
assert.equal(itPolicyCopy.actions.generatePdf, "Genera PDF");
assert.equal(getPolicyStatusLabel("active", "it-IT"), "attivo");
assert.notEqual(itPolicyCopy.detail.emptyVersions, "Zatím není vygenerovaná žádná verze.");

console.log("Jurisdiction context smoke test passed.");
