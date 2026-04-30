import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { incidents } from "@/lib/db/schema";

type Incident = typeof incidents.$inferSelect;

type IncidentNotificationInput = {
  generatedAt: Date;
  incident: Incident;
  organisation: {
    ico: string | null;
    name: string;
  };
  regulator: "nukib" | "uoou";
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
  },
  grid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
    marginTop: 18,
  },
  box: {
    borderColor: "#e4e4e7",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  label: {
    color: "#71717a",
    fontSize: 8,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 12,
    fontWeight: 700,
  },
  section: {
    borderColor: "#e4e4e7",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  },
  checklistItem: {
    marginTop: 5,
  },
});

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toISOString();
}

function getRegulatorTitle(regulator: "nukib" | "uoou") {
  return regulator === "nukib"
    ? "NUKIB initial notification template"
    : "UOOU GDPR breach notification template";
}

function IncidentNotification({
  generatedAt,
  incident,
  organisation,
  regulator,
}: IncidentNotificationInput) {
  const article =
    regulator === "nukib" ? "NIS2 Article 23" : "GDPR Article 33";

  return (
    <Document
      author="Splnit.eu"
      subject={getRegulatorTitle(regulator)}
      title={getRegulatorTitle(regulator)}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Splnit.eu incident management</Text>
        <Text style={styles.title}>{getRegulatorTitle(regulator)}</Text>
        <Text style={styles.muted}>
          Generated {generatedAt.toISOString().slice(0, 10)} · {article}
        </Text>

        <View style={styles.grid}>
          <View style={styles.box}>
            <Text style={styles.label}>Organisation</Text>
            <Text style={styles.value}>{organisation.name}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>ICO</Text>
            <Text style={styles.value}>{organisation.ico ?? "N/A"}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>Severity</Text>
            <Text style={styles.value}>{incident.severity}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident summary</Text>
          <Text>Title: {incident.title}</Text>
          <Text>Status: {incident.status}</Text>
          <Text>Detected at: {formatDate(incident.detectedAt)}</Text>
          <Text>Resolved at: {formatDate(incident.resolvedAt)}</Text>
          <Text>
            Personal data affected: {incident.affectsPersonalData ? "yes" : "no"}
          </Text>
          <Text>
            Critical systems affected:{" "}
            {incident.affectsCriticalSystems ? "yes" : "no"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text>{incident.description ?? "No description provided."}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification checklist</Text>
          <Text style={styles.checklistItem}>
            [ ] Incident classification and severity reviewed
          </Text>
          <Text style={styles.checklistItem}>
            [ ] Affected systems and users identified
          </Text>
          <Text style={styles.checklistItem}>
            [ ] Containment and mitigation actions documented
          </Text>
          <Text style={styles.checklistItem}>
            [ ] Follow-up report owner assigned
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderIncidentNotificationPdf(
  input: IncidentNotificationInput,
) {
  return renderToBuffer(<IncidentNotification {...input} />);
}
