import { describe, expect, it } from "vitest";
import csMessages from "@/messages/cs-CZ.json";
import enMessages from "@/messages/en-EU.json";
import itMessages from "@/messages/it-IT.json";
import {
  getAllVendorQuestionIds,
  getVendorQuestionSet,
  getVendorTemplateForRegime,
  normalizeVendorQuestionnaireTemplate,
  scoreVendorAnswers,
  validateVendorAssessmentAnswers,
  VENDOR_QUESTIONNAIRE_TEMPLATES,
} from "@/lib/vendors/questions";

function answersFor(
  template: (typeof VENDOR_QUESTIONNAIRE_TEMPLATES)[number],
  value: string,
) {
  return Object.fromEntries(
    getVendorQuestionSet(template).map((question) => [question.id, value]),
  );
}

describe("vendor question sets", () => {
  it("has the expected sizes per template", () => {
    expect(getVendorQuestionSet("basic")).toHaveLength(12);
    expect(getVendorQuestionSet("nis2_lower")).toHaveLength(12);
    expect(getVendorQuestionSet("nis2_higher")).toHaveLength(30);
  });

  it("uses unique question ids within each template", () => {
    for (const template of VENDOR_QUESTIONNAIRE_TEMPLATES) {
      const ids = getVendorQuestionSet(template).map((question) => question.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("cites every lower-regime question at § level of vyhláška 410/2025", () => {
    const references = getVendorQuestionSet("nis2_lower").map(
      (question) => question.legalReference,
    );

    expect(references).toHaveLength(12);
    const sections = references.map((reference) => {
      const match = reference?.match(/^§ (\d+) vyhl\. č\. 410\/2025 Sb\.$/);
      expect(match, `unexpected citation: ${reference}`).toBeTruthy();
      return Number(match?.[1]);
    });
    // One question per measure area § 3–§ 14 of the lower-regime decree.
    expect([...sections].sort((a, b) => a - b)).toEqual([
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    ]);
  });

  it("never cites unverified § numbers of vyhláška 409/2025", () => {
    // The § -level structure of the higher-regime decree has not been
    // verified against the primary text; citations must stay decree-level.
    for (const question of getVendorQuestionSet("nis2_higher")) {
      if (question.legalReference?.includes("409/2025")) {
        expect(question.legalReference).toBe("vyhl. č. 409/2025 Sb.");
      }
    }
  });

  it("includes the full lower set inside the higher set", () => {
    const higherIds = new Set(
      getVendorQuestionSet("nis2_higher").map((question) => question.id),
    );

    for (const question of getVendorQuestionSet("nis2_lower")) {
      expect(higherIds.has(question.id)).toBe(true);
    }
  });

  it("has labels for every question in all three locales", () => {
    const locales = [csMessages, enMessages, itMessages] as const;

    for (const id of getAllVendorQuestionIds()) {
      for (const messages of locales) {
        const label = (
          messages.vendorsPage.assessment.questions as Record<string, string>
        )[id];
        expect(label, `missing label for ${id}`).toBeTruthy();
      }
    }
  });

  it("has template labels in all three locales", () => {
    for (const messages of [csMessages, enMessages, itMessages]) {
      for (const template of VENDOR_QUESTIONNAIRE_TEMPLATES) {
        const label = (
          messages.vendorsPage.assessment.templates as Record<string, string>
        )[template];
        expect(label, `missing template label for ${template}`).toBeTruthy();
      }
    }
  });
});

describe("template helpers", () => {
  it("normalizes unknown template values to basic", () => {
    expect(normalizeVendorQuestionnaireTemplate("nis2_lower")).toBe("nis2_lower");
    expect(normalizeVendorQuestionnaireTemplate("nis2_higher")).toBe("nis2_higher");
    expect(normalizeVendorQuestionnaireTemplate("unknown")).toBe("basic");
    expect(normalizeVendorQuestionnaireTemplate(null)).toBe("basic");
  });

  it("maps the Czech obligations regime to a template", () => {
    expect(getVendorTemplateForRegime("vyssi")).toBe("nis2_higher");
    expect(getVendorTemplateForRegime("nizsi")).toBe("nis2_lower");
    expect(getVendorTemplateForRegime(null)).toBe("basic");
    expect(getVendorTemplateForRegime("something_else")).toBe("basic");
  });
});

describe("template-aware validation and scoring", () => {
  it("validates against the template's question set", () => {
    const lowerAnswers = answersFor("nis2_lower", "yes");

    expect(validateVendorAssessmentAnswers(lowerAnswers, "nis2_lower").ok).toBe(true);
    // The same answers are incomplete for the higher template…
    expect(validateVendorAssessmentAnswers(lowerAnswers, "nis2_higher").ok).toBe(false);
    // …and for the basic template, which uses different ids.
    expect(validateVendorAssessmentAnswers(lowerAnswers, "basic").ok).toBe(false);
  });

  it("scores a fully compliant lower-regime questionnaire at 100", () => {
    expect(scoreVendorAnswers(answersFor("nis2_lower", "yes"), "nis2_lower")).toBe(100);
  });

  it("reverse-scores the incident-history question in the higher template", () => {
    const base = answersFor("nis2_higher", "yes");
    const withCleanHistory = { ...base, nis2_incident_history: "no" };

    const withIncident = scoreVendorAnswers(base, "nis2_higher");
    const clean = scoreVendorAnswers(withCleanHistory, "nis2_higher");

    expect(clean).toBe(100);
    expect(withIncident).toBeLessThan(100);
  });

  it("returns null when every answer is not applicable", () => {
    expect(
      scoreVendorAnswers(answersFor("nis2_higher", "not_applicable"), "nis2_higher"),
    ).toBeNull();
  });
});
