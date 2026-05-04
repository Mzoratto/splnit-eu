import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { getJurisdictionContext } from "@/lib/jurisdictions/context";
import type { PolicySourceDocument } from "@/lib/policies/source-documents";
import type { PolicyTemplate } from "@/lib/policies/templates";

type PolicyDocumentInput = {
  generatedAt: Date;
  organisation: {
    ico: string | null;
    name: string;
  };
  reviewDate: string;
  sourceDocument: PolicySourceDocument;
  template: PolicyTemplate;
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#18181b",
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
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
  metaGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
    marginTop: 20,
  },
  metaBox: {
    borderColor: "#e4e4e7",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  metaLabel: {
    color: "#71717a",
    fontSize: 8,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  metaValue: {
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
  field: {
    borderBottomColor: "#e4e4e7",
    borderBottomWidth: 1,
    color: "#52525b",
    marginTop: 8,
    paddingBottom: 5,
  },
});

function PolicyDocument({
  generatedAt,
  organisation,
  reviewDate,
  sourceDocument,
  template,
}: PolicyDocumentInput) {
  const jurisdiction = getJurisdictionContext(
    template.jurisdiction,
    template.locale,
  );
  const { labels } = jurisdiction;

  return (
    <Document
      author="Splnit.eu"
      subject={template.description}
      title={template.titleCs}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>{labels.policyLibrary}</Text>
        <Text style={styles.title}>{template.titleCs}</Text>
        <Text style={styles.muted}>{template.description}</Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>{labels.organisation}</Text>
            <Text style={styles.metaValue}>{organisation.name}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>{labels.legalIdentifier}</Text>
            <Text style={styles.metaValue}>{organisation.ico ?? "N/A"}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>{labels.nextReview}</Text>
            <Text style={styles.metaValue}>{reviewDate}</Text>
          </View>
        </View>

        <Text style={[styles.muted, { marginBottom: 14 }]}>
          {labels.generated}{" "}
          {new Intl.DateTimeFormat(jurisdiction.dateLocale).format(generatedAt)} ·{" "}
          {labels.source} {sourceDocument.citation}
        </Text>

        {template.sections.map((section) => (
          <View key={section.title} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.body ? <Text style={styles.muted}>{section.body}</Text> : null}
            {section.fields?.map((field) => (
              <Text key={field} style={styles.field}>
                {field}: ________________________________
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderPolicyPdf(input: PolicyDocumentInput) {
  return renderToBuffer(<PolicyDocument {...input} />);
}
