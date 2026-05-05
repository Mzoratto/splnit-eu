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
import {
  getIncidentReportLabels,
  getIncidentReportProfile,
  type IncidentReportTrack,
} from "@/lib/incidents/reporting";

type Incident = typeof incidents.$inferSelect;

type IncidentNotificationInput = {
  generatedAt: Date;
  incident: Incident;
  organisation: {
    ico: string | null;
    locale?: string | null;
    name: string;
    primaryJurisdiction?: string | null;
  };
  track: IncidentReportTrack;
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

function IncidentNotification({
  generatedAt,
  incident,
  organisation,
  track,
}: IncidentNotificationInput) {
  const profile = getIncidentReportProfile({
    jurisdiction: organisation.primaryJurisdiction,
    locale: organisation.locale,
    track,
  });
  const labels = getIncidentReportLabels({
    jurisdiction: organisation.primaryJurisdiction,
    locale: organisation.locale,
  });

  return (
    <Document
      author="Splnit.eu"
      subject={profile.subject}
      title={profile.title}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Splnit.eu incident management</Text>
        <Text style={styles.title}>{profile.title}</Text>
        <Text style={styles.muted}>
          {labels.generated} {generatedAt.toISOString().slice(0, 10)} ·{" "}
          {profile.citation}
        </Text>

        <View style={styles.grid}>
          <View style={styles.box}>
            <Text style={styles.label}>{labels.organisation}</Text>
            <Text style={styles.value}>{organisation.name}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>{labels.legalId}</Text>
            <Text style={styles.value}>{organisation.ico ?? "N/A"}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>{labels.authority}</Text>
            <Text style={styles.value}>{profile.authority}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.incidentSummary}</Text>
          <Text>
            {labels.title}: {incident.title}
          </Text>
          <Text>
            {labels.status}: {incident.status}
          </Text>
          <Text>
            {labels.detectedAt}: {formatDate(incident.detectedAt)}
          </Text>
          <Text>
            {labels.resolvedAt}: {formatDate(incident.resolvedAt)}
          </Text>
          <Text>
            {labels.affectedPersonalData}:{" "}
            {incident.affectsPersonalData ? labels.yes : labels.no}
          </Text>
          <Text>
            {labels.affectedCriticalSystems}:{" "}
            {incident.affectsCriticalSystems ? labels.yes : labels.no}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.description}</Text>
          <Text>{incident.description ?? labels.noDescription}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.legalBasisAndTimeline}</Text>
          <Text>{profile.legalBasis}</Text>
          {profile.timeline.map((item) => (
            <Text key={item} style={styles.checklistItem}>
              [ ] {item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.notificationChecklist}</Text>
          {profile.checklist.map((item) => (
            <Text key={item} style={styles.checklistItem}>
              [ ] {item}
            </Text>
          ))}
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
