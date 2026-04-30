export const VENDOR_ASSESSMENT_QUESTIONS = [
  {
    id: "security_owner",
    label: "Má dodavatel určeného vlastníka bezpečnosti?",
  },
  {
    id: "iso_certification",
    label: "Má dodavatel ISO 27001, SOC 2 nebo ekvivalentní audit?",
  },
  {
    id: "data_processing",
    label: "Zpracovává dodavatel osobní nebo citlivá data?",
    reverseScore: true,
  },
  {
    id: "subprocessors",
    label: "Dokládá dodavatel seznam subdodavatelů?",
  },
  {
    id: "incident_notice",
    label: "Má smluvní povinnost hlásit incidenty do 24 hodin?",
  },
  {
    id: "access_control",
    label: "Používá MFA a pravidelné revize přístupů?",
  },
  {
    id: "encryption",
    label: "Šifruje data při přenosu i v klidu?",
  },
  {
    id: "backup_recovery",
    label: "Testuje zálohy a disaster recovery?",
  },
  {
    id: "vulnerability_management",
    label: "Má proces řízení zranitelností?",
  },
  {
    id: "business_continuity",
    label: "Má plán kontinuity provozu?",
  },
  {
    id: "data_location",
    label: "Udržuje data v EU/EHP nebo v právně ošetřeném režimu?",
  },
  {
    id: "termination",
    label: "Umí po ukončení smlouvy data bezpečně vrátit nebo smazat?",
  },
] as const;

export const VENDOR_ANSWER_OPTIONS = [
  { label: "Ano", value: "yes" },
  { label: "Částečně", value: "partial" },
  { label: "Ne", value: "no" },
] as const;

export type VendorAnswerValue = (typeof VENDOR_ANSWER_OPTIONS)[number]["value"];

export function scoreVendorAnswers(answers: Record<string, unknown>) {
  const total = VENDOR_ASSESSMENT_QUESTIONS.length * 2;
  const score = VENDOR_ASSESSMENT_QUESTIONS.reduce((sum, question) => {
    const answer = answers[question.id];
    const rawPoints = answer === "yes" ? 2 : answer === "partial" ? 1 : 0;
    const points =
      "reverseScore" in question && question.reverseScore
        ? 2 - rawPoints
        : rawPoints;

    return sum + points;
  }, 0);

  return Math.round((score / total) * 100);
}

export function getVendorRiskTier(score: number) {
  if (score >= 85) {
    return "low";
  }

  if (score >= 65) {
    return "medium";
  }

  if (score >= 45) {
    return "high";
  }

  return "critical";
}
