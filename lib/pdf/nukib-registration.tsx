import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { NukibRegistration } from "@/lib/compliance/nukib/registration-schema";
import {
  CONTACT_ROLE_LABELS,
  ENTITY_SIZE_LABELS,
  GEOGRAPHIC_SCOPE_LABELS,
  NETWORK_SCOPE_FIELD_META,
  REGIME_LABELS,
  SERVICE_CATEGORY_LABELS,
} from "@/lib/compliance/nukib/registration-labels";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#18181b",
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.45,
    padding: 36,
  },
  eyebrow: {
    color: "#2563eb",
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    color: "#52525b",
    fontSize: 11,
    marginBottom: 18,
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
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 5,
  },
  label: {
    color: "#71717a",
    width: 145,
  },
  value: {
    flex: 1,
  },
  tableHeader: {
    backgroundColor: "#f4f4f5",
    borderBottomColor: "#d4d4d8",
    borderBottomWidth: 1,
    flexDirection: "row",
    fontWeight: 700,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tableRow: {
    borderBottomColor: "#e4e4e7",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingBottom: 5,
    paddingTop: 5,
  },
  colRole: {
    paddingHorizontal: 4,
    width: "18%",
  },
  colName: {
    paddingHorizontal: 4,
    width: "22%",
  },
  colEmail: {
    paddingHorizontal: 4,
    width: "25%",
  },
  colPhone: {
    paddingHorizontal: 4,
    width: "17%",
  },
  colPosition: {
    paddingHorizontal: 4,
    width: "18%",
  },
  footer: {
    borderTopColor: "#e4e4e7",
    borderTopWidth: 1,
    color: "#52525b",
    fontSize: 9,
    marginTop: 12,
    paddingTop: 10,
  },
});

function valueOrDash(value: string | undefined | null) {
  return value?.trim() ? value : "-";
}

function networkScopeValue(values: string[] | undefined) {
  return values && values.length > 0 ? values.join(", ") : "— nevyplněno —";
}

function booleanLabel(value: boolean | undefined) {
  if (value === undefined) {
    return "-";
  }

  return value ? "Ano" : "Ne";
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function NukibRegistrationDocument({ registration }: { registration: NukibRegistration }) {
  return (
    <Document
      author="Splnit.eu"
      subject="Přípravný podklad pro registraci regulované služby na Portálu NÚKIB"
      title="NÚKIB Portal - Registrace regulované služby"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>NÚKIB Portal</Text>
        <Text style={styles.title}>Registrace regulované služby</Text>
        <Text style={styles.subtitle}>Zákon č. 264/2025 Sb.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Identifikace organizace</Text>
          <FieldRow label="IČO" value={registration.ico} />
          <FieldRow label="Název" value={registration.organisationName} />
          <FieldRow label="Datová schránka" value={valueOrDash(registration.dataBoxId)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Klasifikace služby</Text>
          <FieldRow
            label="Kategorie"
            value={SERVICE_CATEGORY_LABELS[registration.serviceCategory]}
          />
          <FieldRow label="Popis" value={registration.serviceDescription} />
          <FieldRow label="Režim" value={REGIME_LABELS[registration.regime]} />
          <FieldRow
            label="Velikost subjektu"
            value={ENTITY_SIZE_LABELS[registration.entitySize]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Geografický rozsah</Text>
          <FieldRow
            label="Rozsah"
            value={GEOGRAPHIC_SCOPE_LABELS[registration.geographicScope]}
          />
          <FieldRow
            label="Dotčené členské státy"
            value={registration.affectedMemberStates?.join(", ") ?? "-"}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3b. Síťový rozsah služby (§ 11 zákona č. 264/2025 Sb.)
          </Text>
          <FieldRow
            label="IP adresy / rozsahy"
            value={networkScopeValue(registration.serviceNetworkScope?.ipRanges)}
          />
          <FieldRow
            label={NETWORK_SCOPE_FIELD_META.domainNames.label}
            value={networkScopeValue(registration.serviceNetworkScope?.domainNames)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Kontaktní osoby</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colRole}>Role</Text>
            <Text style={styles.colName}>Jméno</Text>
            <Text style={styles.colEmail}>E-mail</Text>
            <Text style={styles.colPhone}>Telefon</Text>
            <Text style={styles.colPosition}>Pozice</Text>
          </View>
          {registration.contacts.map((contact, index) => (
            <View key={`${contact.email}-${index}`} style={styles.tableRow}>
              <Text style={styles.colRole}>{CONTACT_ROLE_LABELS[contact.role]}</Text>
              <Text style={styles.colName}>{contact.name}</Text>
              <Text style={styles.colEmail}>{contact.email}</Text>
              <Text style={styles.colPhone}>{contact.phone}</Text>
              <Text style={styles.colPosition}>{valueOrDash(contact.position)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Doplňující údaje (30denní lhůta)</Text>
          <FieldRow
            label="Vlastnická struktura"
            value={valueOrDash(registration.ownershipChain)}
          />
          <FieldRow
            label="Přeshraniční závislosti"
            value={valueOrDash(registration.crossBorderDependencies)}
          />
          <FieldRow
            label="Manažer kybernetické bezpečnosti"
            value={booleanLabel(registration.cyberSecurityManagerAppointed)}
          />
        </View>

        <View style={styles.footer}>
          <Text>
            Vytvořeno: {registration.preparedAt} | Připravil:{" "}
            {registration.preparedBy}
          </Text>
          <Text>
            Toto prohlášení slouží jako přípravný podklad pro vyplnění formuláře
            na Portálu NÚKIB.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderNukibRegistrationPdf(registration: NukibRegistration) {
  return renderToBuffer(<NukibRegistrationDocument registration={registration} />);
}
