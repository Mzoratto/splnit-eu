import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { QuestionnaireResult } from "@/lib/questionnaires/types";

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

function QuestionnaireAnswers({ result }: { result: QuestionnaireResult }) {
  return (
    <Document
      author="Splnit.eu"
      subject="Security questionnaire answers"
      title="Security questionnaire answers"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Splnit.eu Questionnaire AI</Text>
        <Text style={styles.title}>Security questionnaire answers</Text>
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
            <Text style={styles.confidence}>Confidence: {answer.confidence}</Text>
            <Text>{answer.answer}</Text>
            <Text style={styles.meta}>
              Evidence: {answer.evidenceRefs.join(", ") || "none"}
            </Text>
            <Text style={styles.meta}>
              Legal: {answer.legalRefs.join(", ") || "none"}
            </Text>
            <Text style={styles.meta}>
              Policies: {answer.policyRefs.join(", ") || "none"}
            </Text>
            {answer.notes ? <Text style={styles.meta}>{answer.notes}</Text> : null}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderQuestionnaireAnswersPdf(result: QuestionnaireResult) {
  return renderToBuffer(<QuestionnaireAnswers result={result} />);
}
