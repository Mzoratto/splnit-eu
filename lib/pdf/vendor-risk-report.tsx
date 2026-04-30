import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { vendors } from "@/lib/db/schema";

type Vendor = typeof vendors.$inferSelect;

type VendorRiskReportInput = {
  generatedAt: Date;
  organisationName: string;
  vendors: Vendor[];
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
  vendor: {
    borderColor: "#e4e4e7",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    padding: 10,
  },
  vendorHeader: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 12,
    fontWeight: 700,
  },
  tier: {
    backgroundColor: "#f4f4f5",
    borderRadius: 4,
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
});

function VendorRiskReport({
  generatedAt,
  organisationName,
  vendors,
}: VendorRiskReportInput) {
  return (
    <Document
      author="Splnit.eu"
      subject="NIS2 supply chain vendor risk report"
      title="Vendor risk report"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Splnit.eu vendor risk</Text>
        <Text style={styles.title}>NIS2 supply chain report</Text>
        <Text style={styles.muted}>
          {organisationName} · {generatedAt.toISOString().slice(0, 10)}
        </Text>
        {vendors.map((vendor) => (
          <View key={vendor.id} style={styles.vendor}>
            <View style={styles.vendorHeader}>
              <Text style={styles.vendorName}>{vendor.name}</Text>
              <Text style={styles.tier}>{vendor.riskTier ?? "pending"}</Text>
            </View>
            <Text>Category: {vendor.category ?? "n/a"}</Text>
            <Text>Status: {vendor.status}</Text>
            <Text>Last assessed: {vendor.lastAssessedAt ?? "not assessed"}</Text>
            <Text>Next review: {vendor.nextReviewAt ?? "not scheduled"}</Text>
            <Text>Website: {vendor.website ?? "n/a"}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderVendorRiskReportPdf(input: VendorRiskReportInput) {
  return renderToBuffer(<VendorRiskReport {...input} />);
}
