import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

type GapReportControl = {
  articleRef: string | null;
  category: string | null;
  description: string | null;
  key: string;
  requirementLevel: string;
  status: string | null;
  title: string;
};

type GapReportInput = {
  controls: GapReportControl[];
  framework: {
    description: string | null;
    mandatoryDeadline: string | null;
    name: string;
    regulator: string | null;
    version: string | null;
  };
  generatedAt: Date;
  locale: "cs-CZ" | "en-EU" | "it-IT";
  score: number;
};

const GAP_REPORT_COPY = {
  "cs-CZ": {
    continuous: "prubezne",
    generated: "Vygenerovano",
    noReference: "bez reference",
    noVersion: "bez verze",
    openControls: "otevrenych kontrol z",
    priorityGaps: "Prioritni mezery",
    regulator: "Regulator",
    score: "Skore",
    subject: "gap report",
    term: "Termin",
    unknownCategory: "obecne",
  },
  "en-EU": {
    continuous: "continuous",
    generated: "Generated",
    noReference: "no reference",
    noVersion: "no version",
    openControls: "open controls of",
    priorityGaps: "Priority gaps",
    regulator: "Regulator",
    score: "Score",
    subject: "gap report",
    term: "Deadline",
    unknownCategory: "general",
  },
  "it-IT": {
    continuous: "continuativo",
    generated: "Generato",
    noReference: "nessun riferimento",
    noVersion: "nessuna versione",
    openControls: "controlli aperti su",
    priorityGaps: "Gap prioritari",
    regulator: "Regolatore",
    score: "Punteggio",
    subject: "gap report",
    term: "Scadenza",
    unknownCategory: "generale",
  },
} as const satisfies Record<GapReportInput["locale"], Record<string, string>>;

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
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
    marginTop: 20,
  },
  summaryBox: {
    borderColor: "#e4e4e7",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  summaryLabel: {
    color: "#71717a",
    fontSize: 8,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    marginTop: 10,
  },
  control: {
    borderColor: "#e4e4e7",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    padding: 10,
  },
  controlHeader: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 4,
  },
  controlTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: 700,
  },
  status: {
    borderRadius: 4,
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  pass: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  fail: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  review: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  unknown: {
    backgroundColor: "#f4f4f5",
    color: "#52525b",
  },
  meta: {
    color: "#71717a",
    fontSize: 8,
    marginTop: 4,
  },
});

function getStatusStyle(status: string | null) {
  if (status === "pass" || status === "not_applicable") {
    return [styles.status, styles.pass];
  }

  if (status === "fail") {
    return [styles.status, styles.fail];
  }

  if (status === "manual_review" || status === "warning") {
    return [styles.status, styles.review];
  }

  return [styles.status, styles.unknown];
}

function GapReportDocument({
  controls,
  framework,
  generatedAt,
  locale,
  score,
}: GapReportInput) {
  const copy = GAP_REPORT_COPY[locale];
  const failingControls = controls.filter((control) =>
    ["fail", "manual_review", "unknown", null].includes(control.status),
  );

  return (
    <Document
      author="Splnit.eu"
      subject={`${framework.name} ${copy.subject}`}
      title={`${framework.name} ${copy.subject}`}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Splnit.eu {copy.subject}</Text>
        <Text style={styles.title}>{framework.name}</Text>
        <Text style={styles.muted}>{framework.description}</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>{copy.score}</Text>
            <Text style={styles.summaryValue}>{score}%</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>{copy.regulator}</Text>
            <Text style={styles.summaryValue}>{framework.regulator ?? "N/A"}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>{copy.term}</Text>
            <Text style={styles.summaryValue}>
              {framework.mandatoryDeadline ?? copy.continuous}
            </Text>
          </View>
        </View>

        <Text style={styles.meta}>
          {copy.generated} {new Intl.DateTimeFormat(locale).format(generatedAt)} ·{" "}
          {framework.version ?? copy.noVersion} · {failingControls.length}{" "}
          {copy.openControls} {controls.length}
        </Text>

        <Text style={styles.sectionTitle}>{copy.priorityGaps}</Text>
        {(failingControls.length ? failingControls : controls).slice(0, 20).map((control) => (
          <View key={control.key} style={styles.control} wrap={false}>
            <View style={styles.controlHeader}>
              <Text style={styles.controlTitle}>{control.title}</Text>
              <Text style={getStatusStyle(control.status)}>
                {control.status ?? "unknown"}
              </Text>
            </View>
            <Text style={styles.muted}>{control.description}</Text>
            <Text style={styles.meta}>
              {control.articleRef ?? copy.noReference} · {control.requirementLevel} ·{" "}
              {control.category ?? copy.unknownCategory}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderGapReportPdf(input: GapReportInput) {
  return renderToBuffer(<GapReportDocument {...input} />);
}
