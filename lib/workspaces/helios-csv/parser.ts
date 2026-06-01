import type {
  HeliosBackupRecord,
  HeliosCsvFileKind,
  HeliosCsvParseError,
  HeliosCsvParseResult,
  HeliosCsvRecord,
  HeliosIntegrationRecord,
  HeliosIntegrationType,
  HeliosRoleRecord,
  HeliosUserRecord,
  UnknownMetadata,
} from "@/lib/workspaces/helios-csv/types";

const REQUIRED_COLUMNS: Record<HeliosCsvFileKind, readonly string[]> = {
  backups: [
    "job_name",
    "backup_type",
    "last_success_at",
    "encrypted",
    "offsite_or_immutable",
    "restore_tested_at",
  ],
  integrations: [
    "name",
    "type",
    "protocol",
    "auth_type",
    "tls_enabled",
    "network_restricted",
    "credentials_rotated_at",
  ],
  roles: ["role", "module", "permission", "business_owner"],
  users: [
    "username",
    "display_name",
    "active",
    "last_login_at",
    "role",
    "employee_type",
    "shared_account_flag",
  ],
};

const SECRET_COLUMN_RE = /password|secret|token|api_key/i;
const INTEGRATION_TYPES = new Set(["MES", "SCADA", "EDI", "OTHER"]);

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const next = csvText[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

function parseBoolean(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y", "ano"].includes(normalized)) return true;
  if (["false", "0", "no", "n", "ne"].includes(normalized)) return false;
  return null;
}

function parseDate(value: string): string | null | false {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const timestamp = Date.parse(trimmed);
  if (Number.isNaN(timestamp)) return false;
  return trimmed;
}

function read(row: Record<string, string>, column: string) {
  return row[column]?.trim() ?? "";
}

function unknownMetadata(row: Record<string, string>, knownColumns: readonly string[]): UnknownMetadata {
  const known = new Set(knownColumns);
  const metadata: UnknownMetadata = {};
  for (const [column, value] of Object.entries(row)) {
    if (known.has(column)) continue;
    metadata[column] = SECRET_COLUMN_RE.test(column) ? "[redacted-secret-column]" : value.trim().slice(0, 200);
  }
  return metadata;
}

function validateRequiredStrings(
  row: Record<string, string>,
  columns: readonly string[],
  rowNumber: number,
  errors: HeliosCsvParseError[],
) {
  let ok = true;
  for (const column of columns) {
    if (!read(row, column)) {
      ok = false;
      errors.push({
        code: "invalid_value",
        column,
        message: `Required value '${column}' is empty on row ${rowNumber}.`,
        row: rowNumber,
      });
    }
  }
  return ok;
}

function parseRecord(kind: HeliosCsvFileKind, row: Record<string, string>, rowNumber: number, errors: HeliosCsvParseError[]): HeliosCsvRecord | null {
  const metadata = unknownMetadata(row, REQUIRED_COLUMNS[kind]);
  if (kind === "users") {
    if (!validateRequiredStrings(row, ["username", "display_name", "role", "employee_type"], rowNumber, errors)) return null;
    const active = parseBoolean(read(row, "active"));
    const shared = parseBoolean(read(row, "shared_account_flag"));
    const lastLoginAt = parseDate(read(row, "last_login_at"));
    if (active === null || shared === null || lastLoginAt === false) {
      errors.push({ code: "invalid_value", message: `Malformed users row ${rowNumber}.`, row: rowNumber });
      return null;
    }
    return {
      active,
      displayName: read(row, "display_name"),
      employeeType: read(row, "employee_type"),
      lastLoginAt,
      role: read(row, "role"),
      rowNumber,
      sharedAccountFlag: shared,
      sourceFileKind: "users",
      unknownMetadata: metadata,
      username: read(row, "username"),
    } satisfies HeliosUserRecord;
  }

  if (kind === "roles") {
    if (!validateRequiredStrings(row, REQUIRED_COLUMNS.roles, rowNumber, errors)) return null;
    return {
      businessOwner: read(row, "business_owner"),
      module: read(row, "module"),
      permission: read(row, "permission"),
      role: read(row, "role"),
      rowNumber,
      sourceFileKind: "roles",
      unknownMetadata: metadata,
    } satisfies HeliosRoleRecord;
  }

  if (kind === "backups") {
    if (!validateRequiredStrings(row, ["job_name", "backup_type"], rowNumber, errors)) return null;
    const encrypted = parseBoolean(read(row, "encrypted"));
    const offsiteOrImmutable = parseBoolean(read(row, "offsite_or_immutable"));
    const lastSuccessAt = parseDate(read(row, "last_success_at"));
    const restoreTestedAt = parseDate(read(row, "restore_tested_at"));
    if (encrypted === null || offsiteOrImmutable === null || lastSuccessAt === false || restoreTestedAt === false) {
      errors.push({ code: "invalid_value", message: `Malformed backups row ${rowNumber}.`, row: rowNumber });
      return null;
    }
    return {
      backupType: read(row, "backup_type"),
      encrypted,
      jobName: read(row, "job_name"),
      lastSuccessAt,
      offsiteOrImmutable,
      restoreTestedAt,
      rowNumber,
      sourceFileKind: "backups",
      unknownMetadata: metadata,
    } satisfies HeliosBackupRecord;
  }

  if (!validateRequiredStrings(row, ["name", "type", "protocol", "auth_type"], rowNumber, errors)) return null;
  const type = read(row, "type").toUpperCase();
  const tlsEnabled = parseBoolean(read(row, "tls_enabled"));
  const networkRestricted = parseBoolean(read(row, "network_restricted"));
  const credentialsRotatedAt = parseDate(read(row, "credentials_rotated_at"));
  if (!INTEGRATION_TYPES.has(type) || tlsEnabled === null || networkRestricted === null || credentialsRotatedAt === false) {
    errors.push({ code: "invalid_value", message: `Malformed integrations row ${rowNumber}.`, row: rowNumber });
    return null;
  }
  return {
    authType: read(row, "auth_type"),
    credentialsRotatedAt,
    name: read(row, "name"),
    networkRestricted,
    protocol: read(row, "protocol"),
    rowNumber,
    sourceFileKind: "integrations",
    tlsEnabled,
    type: type as HeliosIntegrationType,
    unknownMetadata: metadata,
  } satisfies HeliosIntegrationRecord;
}

export function parseHeliosCsv(kind: HeliosCsvFileKind, csvText: string): HeliosCsvParseResult {
  const rows = parseCsvRows(csvText);
  if (rows.length === 0) {
    return {
      errors: [{ code: "empty_csv", message: "CSV file is empty." }],
      ok: false,
      records: [],
      rowCount: 0,
      sourceFileKind: kind,
    };
  }

  const headers = rows[0].map(normalizeHeader);
  const errors: HeliosCsvParseError[] = [];
  const required = REQUIRED_COLUMNS[kind];
  for (const column of required) {
    if (!headers.includes(column)) {
      errors.push({
        code: "missing_required_column",
        column,
        message: `Required column '${column}' is missing from ${kind} template.`,
      });
    }
  }
  if (errors.length > 0) {
    return { errors, ok: false, records: [], rowCount: rows.length - 1, sourceFileKind: kind };
  }

  const records: HeliosCsvRecord[] = [];
  for (let index = 1; index < rows.length; index += 1) {
    const cells = rows[index];
    if (cells.length > headers.length) {
      errors.push({ code: "malformed_row", message: `Row ${index + 1} has too many columns.`, row: index + 1 });
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((header, cellIndex) => {
      row[header] = cells[cellIndex] ?? "";
    });
    const record = parseRecord(kind, row, index + 1, errors);
    if (record) records.push(record);
  }

  return {
    errors,
    ok: errors.length === 0,
    records,
    rowCount: rows.length - 1,
    sourceFileKind: kind,
  };
}
