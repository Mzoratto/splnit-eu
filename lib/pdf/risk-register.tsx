import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { riskItems } from "@/lib/db/schema";

type RiskItem = typeof riskItems.$inferSelect;

type RiskRegisterInput = {
  generatedAt: Date;
  organisationName: string;
  risks: RiskItem[];
};

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
    marginBottom: 18,
  },
  risk: {
    borderColor: "#e4e4e7",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    padding: 10,
  },
  riskHeader: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 4,
  },
  riskTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: 700,
  },
  score: {
    backgroundColor: "#f4f4f5",
    borderRadius: 4,
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
});

function RiskRegister({ generatedAt, organisationName, risks }: RiskRegisterInput) {
  return (
    <Document
      author="Splnit.eu"
      subject="ISO 27001 risk register"
      title="Risk register"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Splnit.eu risk register</Text>
        <Text style={styles.title}>ISO 27001 risk register</Text>
        <Text style={styles.muted}>
          {organisationName} · {generatedAt.toISOString().slice(0, 10)}
        </Text>
        {risks.map((risk) => (
          <View key={risk.id} style={styles.risk} wrap={false}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskTitle}>{risk.title}</Text>
              <Text style={styles.score}>{risk.riskScore ?? risk.likelihood * risk.impact}</Text>
            </View>
            <Text>Category: {risk.category ?? "n/a"}</Text>
            <Text>Status: {risk.status}</Text>
            <Text>Likelihood: {risk.likelihood} · Impact: {risk.impact}</Text>
            <Text>Owner: {risk.owner ?? "n/a"}</Text>
            <Text>Due date: {risk.dueDate ?? "not scheduled"}</Text>
            <Text>{risk.description ?? "No mitigation notes provided."}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderRiskRegisterPdf(input: RiskRegisterInput) {
  return renderToBuffer(<RiskRegister {...input} />);
}
