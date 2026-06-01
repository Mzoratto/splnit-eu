import type {
  HeliosBackupRecord,
  HeliosCsvEvidenceCandidate,
  HeliosCsvFileKind,
  HeliosCsvRecord,
  HeliosIntegrationRecord,
} from "@/lib/workspaces/helios-csv/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const BACKUP_STALE_DAYS = 2;
const RESTORE_TEST_STALE_DAYS = 365;
const CREDENTIAL_ROTATION_STALE_DAYS = 365;

function olderThan(dateValue: string | null, days: number) {
  if (!dateValue) return true;
  const timestamp = Date.parse(dateValue);
  return Number.isNaN(timestamp) || Date.now() - timestamp > days * DAY_MS;
}

function candidate(input: {
  assessmentResult: "gap" | "manual_review";
  controlKey: string;
  description: string;
  findings: string[];
  rowCount: number;
  sourceFileKind: HeliosCsvFileKind;
  summary: Record<string, number | string | boolean>;
}): HeliosCsvEvidenceCandidate {
  return {
    assessmentResult: input.assessmentResult,
    controlKey: input.controlKey,
    description: input.description,
    evidenceType: "helios_csv_import",
    provenance: "customer_reported_csv_template",
    snapshotData: {
      customerReported: true,
      findings: input.findings,
      labels: {
        measurement: "not_measured_by_splnit",
        valueSource: "customer-reported",
      },
      rowCount: input.rowCount,
      sourceFileKind: input.sourceFileKind,
      summary: input.summary,
    },
    sourceFileKind: input.sourceFileKind,
  };
}

function mapUsers(records: HeliosCsvRecord[]) {
  const users = records.filter((record) => record.sourceFileKind === "users");
  if (users.length === 0) return [];
  const sharedAccounts = users.filter((record) => record.sharedAccountFlag).length;
  const activeUsers = users.filter((record) => record.active).length;
  return [
    candidate({
      assessmentResult: sharedAccounts > 0 ? "gap" : "manual_review",
      controlKey: "helios-iam-user-accounts",
      description:
        sharedAccounts > 0
          ? "Splnit template import: customer-reported Helios user list contains shared account flags."
          : "Splnit template import: customer-reported Helios user list did not mark shared accounts; manual review still required.",
      findings:
        sharedAccounts > 0
          ? [`${sharedAccounts} customer-reported shared account row(s) found.`]
          : ["No shared_account_flag=true rows in the customer-reported template."],
      rowCount: users.length,
      sourceFileKind: "users",
      summary: { activeUsers, sharedAccounts, totalUsers: users.length },
    }),
  ];
}

function mapRoles(records: HeliosCsvRecord[]) {
  const roles = records.filter((record) => record.sourceFileKind === "roles");
  if (roles.length === 0) return [];
  const modules = new Set(roles.map((record) => record.module)).size;
  const businessOwners = roles.filter((record) => record.businessOwner.trim().length > 0).length;
  return [
    candidate({
      assessmentResult: "manual_review",
      controlKey: "helios-iam-module-role-hierarchy",
      description:
        "Splnit template import: customer-reported Helios role/module matrix uploaded for manual review.",
      findings: ["Role hierarchy evidence requires reviewer validation against least-privilege expectations."],
      rowCount: roles.length,
      sourceFileKind: "roles",
      summary: { businessOwners, modules, roleRows: roles.length },
    }),
  ];
}

function mapBackups(records: HeliosCsvRecord[]) {
  const backups = records.filter(
    (record): record is HeliosBackupRecord => record.sourceFileKind === "backups",
  );
  if (backups.length === 0) return [];
  const staleOrMissingSuccess = backups.filter((record) => olderThan(record.lastSuccessAt, BACKUP_STALE_DAYS)).length;
  const unencrypted = backups.filter((record) => !record.encrypted).length;
  const notOffsiteOrImmutable = backups.filter((record) => !record.offsiteOrImmutable).length;
  const staleOrMissingRestore = backups.filter((record) => olderThan(record.restoreTestedAt, RESTORE_TEST_STALE_DAYS)).length;
  return [
    candidate({
      assessmentResult: staleOrMissingSuccess > 0 ? "gap" : "manual_review",
      controlKey: "helios-backup-sql-agent-jobs",
      description: "Splnit template import: customer-reported Helios backup job status summary.",
      findings:
        staleOrMissingSuccess > 0
          ? [`${staleOrMissingSuccess} backup row(s) have missing or stale last_success_at.`]
          : ["Backup last_success_at values are present and recent in the customer-reported template."],
      rowCount: backups.length,
      sourceFileKind: "backups",
      summary: { staleOrMissingSuccess, totalBackupJobs: backups.length },
    }),
    candidate({
      assessmentResult: unencrypted > 0 ? "gap" : "manual_review",
      controlKey: "helios-backup-encryption",
      description: "Splnit template import: customer-reported Helios backup encryption summary.",
      findings:
        unencrypted > 0
          ? [`${unencrypted} backup row(s) are marked encrypted=false.`]
          : ["All backup rows are marked encrypted=true in the customer-reported template."],
      rowCount: backups.length,
      sourceFileKind: "backups",
      summary: { totalBackupJobs: backups.length, unencrypted },
    }),
    candidate({
      assessmentResult: notOffsiteOrImmutable > 0 ? "gap" : "manual_review",
      controlKey: "helios-backup-offsite-immutable",
      description: "Splnit template import: customer-reported offsite/immutable backup summary.",
      findings:
        notOffsiteOrImmutable > 0
          ? [`${notOffsiteOrImmutable} backup row(s) are marked offsite_or_immutable=false.`]
          : ["All backup rows are marked offsite_or_immutable=true in the customer-reported template."],
      rowCount: backups.length,
      sourceFileKind: "backups",
      summary: { notOffsiteOrImmutable, totalBackupJobs: backups.length },
    }),
    candidate({
      assessmentResult: staleOrMissingRestore > 0 ? "gap" : "manual_review",
      controlKey: "helios-backup-restoration-test",
      description: "Splnit template import: customer-reported Helios restore-test summary.",
      findings:
        staleOrMissingRestore > 0
          ? [`${staleOrMissingRestore} backup row(s) have missing or stale restore_tested_at.`]
          : ["Restore tests are present within the expected window in the customer-reported template."],
      rowCount: backups.length,
      sourceFileKind: "backups",
      summary: { staleOrMissingRestore, totalBackupJobs: backups.length },
    }),
  ];
}

function weakAuth(authType: string) {
  const normalized = authType.trim().toLowerCase();
  return normalized === "" || ["none", "anonymous", "no_auth", "basic"].includes(normalized);
}

function mapIntegrations(records: HeliosCsvRecord[]) {
  const integrations = records.filter(
    (record): record is HeliosIntegrationRecord => record.sourceFileKind === "integrations",
  );
  if (integrations.length === 0) return [];
  const mesScada = integrations.filter((record) => record.type === "MES" || record.type === "SCADA");
  const edi = integrations.filter((record) => record.type === "EDI");
  const weakMesScada = mesScada.filter(
    (record) => !record.tlsEnabled || !record.networkRestricted || weakAuth(record.authType),
  ).length;
  const weakEdi = edi.filter(
    (record) => !record.tlsEnabled || !record.networkRestricted || weakAuth(record.authType),
  ).length;
  const staleCredentials = integrations.filter((record) => olderThan(record.credentialsRotatedAt, CREDENTIAL_ROTATION_STALE_DAYS)).length;
  const tlsGaps = integrations.filter((record) => !record.tlsEnabled).length;
  const networkGaps = integrations.filter((record) => !record.networkRestricted).length;

  return [
    candidate({
      assessmentResult: weakMesScada > 0 ? "gap" : "manual_review",
      controlKey: "helios-api-mes-scada-integration",
      description: "Splnit template import: customer-reported Helios MES/SCADA integration summary.",
      findings:
        weakMesScada > 0
          ? [`${weakMesScada} MES/SCADA integration row(s) lack TLS, authentication, or network restriction.`]
          : ["MES/SCADA rows do not report missing TLS/auth/network restriction; manual validation required."],
      rowCount: integrations.length,
      sourceFileKind: "integrations",
      summary: { mesScadaRows: mesScada.length, weakMesScada },
    }),
    candidate({
      assessmentResult: weakEdi > 0 ? "gap" : "manual_review",
      controlKey: "helios-api-edi-supplier-customer",
      description: "Splnit template import: customer-reported Helios EDI integration summary.",
      findings:
        weakEdi > 0
          ? [`${weakEdi} EDI row(s) lack TLS, authentication, or network restriction.`]
          : ["EDI rows do not report missing TLS/auth/network restriction; manual validation required."],
      rowCount: integrations.length,
      sourceFileKind: "integrations",
      summary: { ediRows: edi.length, weakEdi },
    }),
    candidate({
      assessmentResult: staleCredentials > 0 ? "gap" : "manual_review",
      controlKey: "helios-api-credential-rotation",
      description: "Splnit template import: customer-reported Helios integration credential rotation summary.",
      findings:
        staleCredentials > 0
          ? [`${staleCredentials} integration row(s) have missing or stale credentials_rotated_at.`]
          : ["Integration credential rotation dates are present within the expected window in the customer-reported template."],
      rowCount: integrations.length,
      sourceFileKind: "integrations",
      summary: { staleCredentials, totalIntegrations: integrations.length },
    }),
    candidate({
      assessmentResult: networkGaps > 0 ? "gap" : "manual_review",
      controlKey: "helios-api-network-access-control",
      description: "Splnit template import: customer-reported Helios integration network restriction summary.",
      findings:
        networkGaps > 0
          ? [`${networkGaps} integration row(s) are marked network_restricted=false.`]
          : ["All integration rows are marked network_restricted=true in the customer-reported template."],
      rowCount: integrations.length,
      sourceFileKind: "integrations",
      summary: { networkGaps, totalIntegrations: integrations.length },
    }),
    candidate({
      assessmentResult: tlsGaps > 0 ? "gap" : "manual_review",
      controlKey: "helios-api-tls-enforcement",
      description: "Splnit template import: customer-reported Helios integration TLS summary.",
      findings:
        tlsGaps > 0
          ? [`${tlsGaps} integration row(s) are marked tls_enabled=false.`]
          : ["All integration rows are marked tls_enabled=true in the customer-reported template."],
      rowCount: integrations.length,
      sourceFileKind: "integrations",
      summary: { tlsGaps, totalIntegrations: integrations.length },
    }),
  ];
}

export function mapHeliosCsvRecords(records: HeliosCsvRecord[]): HeliosCsvEvidenceCandidate[] {
  return [
    ...mapUsers(records),
    ...mapRoles(records),
    ...mapBackups(records),
    ...mapIntegrations(records),
  ];
}
