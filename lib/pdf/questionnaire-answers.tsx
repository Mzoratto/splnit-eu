import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Locale } from "@/i18n/routing";
import type { QuestionnaireResult } from "@/lib/questionnaires/types";

const QUESTIONNAIRE_PDF_COPY = {
  "cs-CZ": {
    confidence: "Spolehlivost",
    evidence: "Evidence",
    evidenceFallback: "žádná",
    eyebrow: "Splnit.eu AI dotazník",
    legal: "Právní odkazy",
    legalFallback: "žádné",
    policies: "Politiky",
    policiesFallback: "žádné",
    title: "Odpovědi bezpečnostního dotazníku",
  },
  "en-EU": {
    confidence: "Confidence",
    evidence: "Evidence",
    evidenceFallback: "none",
    eyebrow: "Splnit.eu Questionnaire AI",
    legal: "Legal",
    legalFallback: "none",
    policies: "Policies",
    policiesFallback: "none",
    title: "Security questionnaire answers",
  },
  "it-IT": {
    confidence: "Confidenza",
    evidence: "Evidenze",
    evidenceFallback: "nessuna",
    eyebrow: "Questionario AI Splnit.eu",
    legal: "Riferimenti legali",
    legalFallback: "nessuno",
    policies: "Policy",
    policiesFallback: "nessuna",
    title: "Risposte al questionario di sicurezza",
  },
} as const satisfies Record<Locale, Record<string, string>>;

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#18181b",
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.45,
    padding: 36,
  },
  eyebrow: {
    color: "#2563eb",
    fontSize: 9,
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  muted: {
    color: "#71717a",
    marginBottom: 16,
  },
  answer: {
    borderColor: "#e4e4e7",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    padding: 10,
  },
  question: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 5,
  },
  confidence: {
    backgroundColor: "#f4f4f5",
    borderRadius: 4,
    fontSize: 8,
    marginBottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  meta: {
    color: "#71717a",
    fontSize: 8,
    marginTop: 5,
  },
});

function QuestionnaireAnswers({
  locale,
  result,
}: {
  locale: Locale;
  result: QuestionnaireResult;
}) {
  const copy = QUESTIONNAIRE_PDF_COPY[locale];

  return (
    <Document author="Splnit.eu" subject={copy.title} title={copy.title}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.muted}>
          {result.organisationName} · {result.generatedAt.slice(0, 10)} ·{" "}
          {result.model}
        </Text>
        <Text style={styles.muted}>{result.summary}</Text>

        {result.answers.map((answer, index) => (
          <View key={`${answer.question}-${index}`} style={styles.answer} wrap={false}>
            <Text style={styles.question}>
              {index + 1}. {answer.question}
            </Text>
            <Text style={styles.confidence}>
              {copy.confidence}: {answer.confidence}
            </Text>
            <Text>{answer.answer}</Text>
            <Text style={styles.meta}>
              {copy.evidence}: {answer.evidenceRefs.join(", ") || copy.evidenceFallback}
            </Text>
            <Text style={styles.meta}>
              {copy.legal}: {answer.legalRefs.join(", ") || copy.legalFallback}
            </Text>
            <Text style={styles.meta}>
              {copy.policies}: {answer.policyRefs.join(", ") || copy.policiesFallback}
            </Text>
            {answer.notes ? <Text style={styles.meta}>{answer.notes}</Text> : null}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderQuestionnaireAnswersPdf(
  result: QuestionnaireResult,
  locale: Locale,
) {
  return renderToBuffer(<QuestionnaireAnswers locale={locale} result={result} />);
}
