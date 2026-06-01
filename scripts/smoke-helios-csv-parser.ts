import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { mapHeliosCsvRecords } from "@/lib/workspaces/helios-csv/mapping";
import { parseHeliosCsv } from "@/lib/workspaces/helios-csv/parser";
import type { HeliosCsvFileKind } from "@/lib/workspaces/helios-csv/types";

const fixtureDir = path.join(process.cwd(), "tests", "fixtures", "helios");
const kinds: HeliosCsvFileKind[] = ["users", "roles", "backups", "integrations"];

async function main() {
  for (const kind of kinds) {
    const csv = await readFile(path.join(fixtureDir, `${kind}.csv`), "utf8");
    const parsed = parseHeliosCsv(kind, csv);
    assert.equal(parsed.ok, true, `${kind} fixture should parse`);
    assert.equal(parsed.errors.length, 0, `${kind} fixture should not emit parse errors`);
    assert.ok(parsed.records.length > 0, `${kind} fixture should produce typed records`);
    assert.ok(parsed.records.every((record) => record.sourceFileKind === kind));
    assert.ok(parsed.records.every((record) => Object.hasOwn(record, "unknownMetadata")));

    const candidates = mapHeliosCsvRecords(parsed.records);
    assert.ok(candidates.length > 0, `${kind} should map to evidence candidates`);
    assert.ok(candidates.every((candidate) => candidate.evidenceType === "helios_csv_import"));
    assert.ok(candidates.every((candidate) => candidate.provenance === "customer_reported_csv_template"));
    assert.ok(candidates.every((candidate) => !(["pass"] as string[]).includes(candidate.assessmentResult)));
    assert.ok(candidates.every((candidate) => candidate.snapshotData.customerReported === true));
  }

  const missingColumns = parseHeliosCsv("users", "username,active\njnovak,true\n");
  assert.equal(missingColumns.ok, false, "missing required columns must fail");
  assert.ok(missingColumns.errors.some((error) => error.code === "missing_required_column"));

  const malformed = parseHeliosCsv(
    "integrations",
    "name,type,protocol,auth_type,tls_enabled,network_restricted,credentials_rotated_at\nBridge,BAD,REST,service_account,true,true,2026-01-01\n",
  );
  assert.equal(malformed.ok, false, "malformed enum row must fail");
  assert.ok(malformed.errors.some((error) => error.row === 2 && error.code === "invalid_value"));

  const unknown = parseHeliosCsv(
    "users",
    "username,display_name,active,last_login_at,role,employee_type,shared_account_flag,password,custom note\njnovak,Jan Novak,true,2026-05-20,Operator,employee,false,SuperSecret,kept\n",
  );
  assert.equal(unknown.ok, true, "secret-like unknown columns are redacted, not fatal");
  assert.equal(unknown.records[0]?.unknownMetadata.custom_note, "kept");
  assert.equal(unknown.records[0]?.unknownMetadata.password, "[redacted-secret-column]");
  assert.ok(!JSON.stringify(unknown.records).includes("SuperSecret"), "secret values must not survive parsing");

  console.log("smoke:helios-csv-parser ok");
}

main().catch((error) => {
  console.error("smoke:helios-csv-parser failed");
  console.error(error);
  process.exit(1);
});
