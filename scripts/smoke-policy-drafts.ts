import assert from "node:assert/strict";
import {
  buildInitialPolicyDraftContent,
  buildPolicyTemplateFromDraft,
  parsePolicyDraftFormData,
} from "@/lib/policies/policy-drafts";
import type { PolicyTemplate } from "@/lib/policies/templates";

const template: PolicyTemplate = {
  controlKeys: ["ctrl_policy_documented"],
  description: "Review and approve the internal policy.",
  jurisdiction: "IT",
  locale: "it-IT",
  reviewStatus: "draft",
  sections: [
    {
      body: "Default access rules.",
      fields: ["Responsabile", "Ambito"],
      title: "Accesso",
    },
    {
      body: "Default review cadence.",
      title: "Revisione",
    },
  ],
  sourceDocument: "italian-nis2",
  templateFamily: "security_policy",
  titleCs: "Politica di sicurezza",
  type: "security_policy",
};

const sourceDocument = {
  citation: "ACN guidance, Article 24",
  filename: "acn-guidance.pdf",
  lastReviewed: "2026-05-01T00:00:00.000Z",
  title: "Linee guida ACN",
  url: "https://www.acn.gov.it/",
};

const draft = buildInitialPolicyDraftContent({
  generatedAt: new Date("2026-05-17T10:00:00.000Z"),
  organisation: {
    ico: "IT-123",
    name: "Example S.r.l.",
    primaryJurisdiction: "IT",
  },
  reviewDate: "2027-05-17",
  sourceDocument,
  template,
});

assert.equal(draft.status, "draft");
assert.equal(draft.templateType, "security_policy");
assert.equal(draft.title, "Politica di sicurezza");
assert.equal(draft.organisation.name, "Example S.r.l.");
assert.equal(draft.organisation.legalIdentifier, "IT-123");
assert.equal(draft.organisation.jurisdiction, "IT");
assert.equal(draft.reviewDate, "2027-05-17");
assert.equal(draft.sourceDocument.citation, "ACN guidance, Article 24");
assert.equal(draft.sections[0]?.body, "Default access rules.");
assert.deepEqual(draft.sections[0]?.fields, ["Responsabile", "Ambito"]);

const formData = new FormData();
formData.set("title", "Politica sicurezza aggiornata");
formData.set("reviewDate", "2027-06-01");
formData.set("sectionTitle:0", "Accesso logico");
formData.set("sectionBody:0", "Regole aggiornate dopo revisione owner.");
formData.set("sectionFields:0", "Owner\nAmbito\nEccezioni approvate");
formData.set("sectionTitle:1", "Revisione annuale");
formData.set("sectionBody:1", "Riesaminare almeno una volta l'anno.");
formData.set("sectionFields:1", "");

const parsed = parsePolicyDraftFormData({
  currentDraft: draft,
  formData,
});

assert.equal(parsed.title, "Politica sicurezza aggiornata");
assert.equal(parsed.reviewDate, "2027-06-01");
assert.equal(parsed.sections.length, 2);
assert.equal(parsed.sections[0]?.title, "Accesso logico");
assert.deepEqual(parsed.sections[0]?.fields, ["Owner", "Ambito", "Eccezioni approvate"]);
assert.equal(parsed.sections[1]?.fields?.length ?? 0, 0);

const templateFromDraft = buildPolicyTemplateFromDraft({
  draft: parsed,
  template,
});
assert.equal(templateFromDraft.titleCs, "Politica sicurezza aggiornata");
assert.equal(templateFromDraft.sections[0]?.body, "Regole aggiornate dopo revisione owner.");
assert.equal(templateFromDraft.reviewStatus, "draft");
assert.deepEqual(templateFromDraft.controlKeys, template.controlKeys);

console.log("Policy draft smoke test passed.");
