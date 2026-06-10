import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { DiscoveredVendor } from "@/lib/discovery/types";
import {
  mapHeliosCsvToVendorDrafts,
  stageHeliosCsvVendorDrafts,
  type HeliosCsvVendorDraftStore,
} from "@/lib/discovery/import/helios-csv-to-drafts";
import { parseHeliosCsv } from "@/lib/workspaces/helios-csv/parser";

const fixtureDir = path.join(process.cwd(), "tests", "fixtures", "helios");
const now = new Date("2026-06-09T00:00:00.000Z");

type StoredVendor = DiscoveredVendor & { clerkOrgId: string; discoveryRunId: string };

class MemoryDraftStore implements HeliosCsvVendorDraftStore {
  private runIndex = 0;
  readonly runs: { clerkOrgId: string; completed: boolean; id: string; provider: string; vendorsProposed: number }[] = [];
  readonly vendors = new Map<string, StoredVendor>();

  async ensureIntegration(input: { clerkOrgId: string }) {
    return `integration-${input.clerkOrgId}`;
  }

  async createRun(input: { clerkOrgId: string; integrationId: string; provider: string }) {
    this.runIndex += 1;
    const id = `run-${this.runIndex}-${input.integrationId}`;
    this.runs.push({ clerkOrgId: input.clerkOrgId, completed: false, id, provider: input.provider, vendorsProposed: 0 });
    return id;
  }

  async completeRun(input: { runId: string; vendorsProposed: number; warnings: string[] }) {
    assert.deepEqual(input.warnings, [], "fixture import should not produce warnings");
    const run = this.runs.find((item) => item.id === input.runId);
    assert.ok(run, `run ${input.runId} should exist`);
    run.completed = true;
    run.vendorsProposed = input.vendorsProposed;
  }

  async upsertVendors(input: { clerkOrgId: string; runId: string; vendors: DiscoveredVendor[] }) {
    let newCount = 0;
    for (const vendor of input.vendors) {
      const key = `${input.clerkOrgId}:${vendor.externalKey}`;
      if (!this.vendors.has(key)) {
        newCount += 1;
      }
      this.vendors.set(key, { ...vendor, clerkOrgId: input.clerkOrgId, discoveryRunId: input.runId });
    }
    return newCount;
  }
}

async function main() {
  const suppliersCsv = await readFile(path.join(fixtureDir, "suppliers.csv"), "utf8");
  const payablesCsv = await readFile(path.join(fixtureDir, "payables.csv"), "utf8");

  const parsedSuppliers = parseHeliosCsv("suppliers", suppliersCsv);
  assert.equal(parsedSuppliers.ok, true, "supplier fixture should parse");
  assert.equal(parsedSuppliers.records.length, 4, "supplier fixture should keep all supplier rows before vendor filtering");
  assert.ok(parsedSuppliers.records.every((record) => record.sourceFileKind === "suppliers"));

  const parsedPayables = parseHeliosCsv("payables", payablesCsv);
  assert.equal(parsedPayables.ok, true, "payables fixture should parse");
  assert.equal(parsedPayables.records.length, 5, "payables fixture should parse invoice rows");
  assert.ok(parsedPayables.records.every((record) => record.sourceFileKind === "payables"));

  const vendors = mapHeliosCsvToVendorDrafts({
    now,
    payableRecords: parsedPayables.records,
    supplierRecords: parsedSuppliers.records,
  });
  const vendorsByKey = new Map(vendors.map((vendor) => [vendor.externalKey, vendor]));

  assert.equal(vendors.length, 3, "customer-only rows are not vendor drafts");
  const atlas = vendorsByKey.get("helios-csv:vendor:12345678");
  assert.ok(atlas, "supplier with IČO maps to stable IČO external key");
  assert.equal(atlas.name, "Atlas Components s.r.o.");
  assert.equal(atlas.ico, "12345678", "IČO is extracted and normalized");
  assert.equal(atlas.provider, "helios", "Helios CSV drafts carry the future provider string");
  assert.equal(atlas.supplyType, "Supplier (from Helios CSV export)");
  assert.equal(atlas.suggestedCriticality, "critical", "spend over CZK 1m is critical");
  assert.equal(
    atlas.metadata.contactEmail,
    undefined,
    "current Helios supplier fixture does not provide a contact email column.",
  );
  assert.match(atlas.rationale, /2 invoices/);
  assert.match(atlas.rationale, /1\s*100\s*000/);

  const machines = vendorsByKey.get("helios-csv:vendor:87654321");
  assert.ok(machines, "second supplier maps to a vendor draft");
  assert.equal(machines.suggestedCriticality, "high", "spend over CZK 100k is high");

  const snacks = vendorsByKey.get("helios-csv:vendor:11223344");
  assert.ok(snacks, "supplier without in-window spend still maps from supplier list");
  assert.equal(snacks.suggestedCriticality, "standard", "out-of-window spend is ignored for current criticality");
  assert.match(snacks.rationale, /Listed as a supplier/);

  const suppliersWithEmail = parseHeliosCsv(
    "suppliers",
    [
      "supplier_id,name,ico,dic,supplier_flag,contact_email",
      "SUP-E,Email Supplier s.r.o.,12340001,CZ12340001,true,security@example.test",
    ].join("\n"),
  );
  assert.equal(suppliersWithEmail.ok, true, "optional contact_email column should not break Helios supplier parsing");
  const vendorsWithEmail = mapHeliosCsvToVendorDrafts({
    now,
    supplierRecords: suppliersWithEmail.records,
  });
  assert.equal(
    vendorsWithEmail[0]?.metadata.contactEmail,
    "security@example.test",
    "Helios supplier drafts should carry contact email when the export provides it.",
  );

  const store = new MemoryDraftStore();
  const first = await stageHeliosCsvVendorDrafts({
    clerkOrgId: "org_helios_csv_discovery_smoke",
    now,
    payablesCsvText: payablesCsv,
    store,
    suppliersCsvText: suppliersCsv,
  });
  assert.equal(first.vendorsProposed, 3, "first import proposes mapped vendors");
  assert.equal(first.newVendors, 3, "first import inserts new drafts");
  assert.equal(store.vendors.size, 3, "store contains one row per proposed vendor");

  const second = await stageHeliosCsvVendorDrafts({
    clerkOrgId: "org_helios_csv_discovery_smoke",
    now,
    payablesCsvText: payablesCsv,
    store,
    suppliersCsvText: suppliersCsv,
  });
  assert.equal(second.vendorsProposed, 3, "reimport still sees all vendor drafts");
  assert.equal(second.newVendors, 0, "reimport reconciles by externalKey instead of duplicating");
  assert.equal(store.vendors.size, 3, "dedupe-on-reimport keeps stable draft count");
  assert.ok(store.runs.every((run) => run.provider === "helios" && run.completed), "staging runs are completed for provider helios");

  console.log("smoke:helios-csv-discovery-drafts ok");
}

main().catch((error) => {
  console.error("smoke:helios-csv-discovery-drafts failed");
  console.error(error);
  process.exit(1);
});
