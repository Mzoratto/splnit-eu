export type HeliosCsvFileKind =
  | "users"
  | "roles"
  | "backups"
  | "integrations"
  | "suppliers"
  | "payables";

export type HeliosCsvParseError = {
  code:
    | "empty_csv"
    | "missing_required_column"
    | "invalid_value"
    | "malformed_row";
  column?: string;
  message: string;
  row?: number;
};

export type UnknownMetadata = Record<string, string>;

export type HeliosCsvBaseRecord = {
  rowNumber: number;
  sourceFileKind: HeliosCsvFileKind;
  unknownMetadata: UnknownMetadata;
};

export type HeliosUserRecord = HeliosCsvBaseRecord & {
  sourceFileKind: "users";
  username: string;
  displayName: string;
  active: boolean;
  lastLoginAt: string | null;
  role: string;
  employeeType: string;
  sharedAccountFlag: boolean;
};

export type HeliosRoleRecord = HeliosCsvBaseRecord & {
  sourceFileKind: "roles";
  role: string;
  module: string;
  permission: string;
  businessOwner: string;
};

export type HeliosBackupRecord = HeliosCsvBaseRecord & {
  sourceFileKind: "backups";
  jobName: string;
  backupType: string;
  lastSuccessAt: string | null;
  encrypted: boolean;
  offsiteOrImmutable: boolean;
  restoreTestedAt: string | null;
};

export type HeliosIntegrationType = "MES" | "SCADA" | "EDI" | "OTHER";

export type HeliosIntegrationRecord = HeliosCsvBaseRecord & {
  sourceFileKind: "integrations";
  name: string;
  type: HeliosIntegrationType;
  protocol: string;
  authType: string;
  tlsEnabled: boolean;
  networkRestricted: boolean;
  credentialsRotatedAt: string | null;
};

export type HeliosSupplierRecord = HeliosCsvBaseRecord & {
  sourceFileKind: "suppliers";
  supplierId: string;
  name: string;
  ico: string | null;
  dic: string | null;
  supplierFlag: boolean;
};

export type HeliosPayableRecord = HeliosCsvBaseRecord & {
  sourceFileKind: "payables";
  invoiceId: string;
  supplierId: string;
  invoiceDate: string;
  totalPayableCzk: number;
};

export type HeliosCsvRecord =
  | HeliosUserRecord
  | HeliosRoleRecord
  | HeliosBackupRecord
  | HeliosIntegrationRecord
  | HeliosSupplierRecord
  | HeliosPayableRecord;

export type HeliosCsvParseResult = {
  errors: HeliosCsvParseError[];
  ok: boolean;
  records: HeliosCsvRecord[];
  rowCount: number;
  sourceFileKind: HeliosCsvFileKind;
};

export type HeliosCsvEvidenceCandidate = {
  assessmentResult: "gap" | "manual_review";
  controlKey: string;
  description: string;
  evidenceType: "helios_csv_import";
  provenance: "customer_reported_csv_template";
  snapshotData: {
    customerReported: true;
    findings: string[];
    labels: {
      valueSource: "customer-reported";
      measurement: "not_measured_by_splnit";
    };
    rowCount: number;
    sourceFileKind: HeliosCsvFileKind;
    summary: Record<string, number | string | boolean>;
  };
  sourceFileKind: HeliosCsvFileKind;
};

export type HeliosCsvImportResult = {
  created: { controlKey: string; evidenceId: string }[];
  errors: HeliosCsvParseError[];
  gapsCount: number;
  manualReviewCount: number;
  parsedRows: number;
  skippedRows: number;
  sourceFileKind: HeliosCsvFileKind;
};
