import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  discoveredVendors,
  discoveryRuns,
  integrations,
} from "@/lib/db/schema";
import type { DiscoveredVendor } from "@/lib/discovery/types";
import { normalizeContactEmail } from "@/lib/vendors/contact-email";
import { parseHeliosCsv } from "@/lib/workspaces/helios-csv/parser";
import type {
  HeliosCsvRecord,
  HeliosPayableRecord,
  HeliosSupplierRecord,
} from "@/lib/workspaces/helios-csv/types";

const HELIOS_PROVIDER = "helios" as DiscoveredVendor["provider"];
const SUPPLY_TYPE = "Supplier (from Helios CSV export)";
const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

type CriticalityThresholds = {
  criticalInvoiceCount: number;
  criticalSpendCzk: number;
  highInvoiceCount: number;
  highSpendCzk: number;
};

type PayableSummary = {
  invoiceCount: number;
  supplierId: string;
  totalPayableCzk: number;
};

export type HeliosCsvVendorDraftStore = {
  completeRun(input: {
    runId: string;
    vendorsProposed: number;
    warnings: string[];
  }): Promise<void>;
  createRun(input: {
    clerkOrgId: string;
    integrationId: string;
    provider: string;
  }): Promise<string>;
  ensureIntegration(input: { clerkOrgId: string }): Promise<string>;
  upsertVendors(input: {
    clerkOrgId: string;
    runId: string;
    vendors: DiscoveredVendor[];
  }): Promise<number>;
};

export type StageHeliosCsvVendorDraftsResult = {
  discoveryRunId: string;
  newVendors: number;
  vendorsProposed: number;
  warnings: string[];
};

const DEFAULT_THRESHOLDS: CriticalityThresholds = {
  criticalInvoiceCount: 24,
  criticalSpendCzk: 1_000_000,
  highInvoiceCount: 6,
  highSpendCzk: 100_000,
};

function isSupplierRecord(record: HeliosCsvRecord): record is HeliosSupplierRecord {
  return record.sourceFileKind === "suppliers";
}

function isPayableRecord(record: HeliosCsvRecord): record is HeliosPayableRecord {
  return record.sourceFileKind === "payables";
}

function inLastTwelveMonths(dateValue: string, now: Date) {
  const timestamp = Date.parse(dateValue);
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const nowTimestamp = now.getTime();
  return timestamp <= nowTimestamp && timestamp >= nowTimestamp - TWELVE_MONTHS_MS;
}

function summarizePayables(payables: HeliosPayableRecord[], now: Date) {
  const summaries = new Map<string, PayableSummary>();

  for (const payable of payables) {
    if (!inLastTwelveMonths(payable.invoiceDate, now)) {
      continue;
    }

    const current = summaries.get(payable.supplierId) ?? {
      invoiceCount: 0,
      supplierId: payable.supplierId,
      totalPayableCzk: 0,
    };
    current.invoiceCount += 1;
    current.totalPayableCzk += payable.totalPayableCzk;
    summaries.set(payable.supplierId, current);
  }

  return summaries;
}

function criticalityFromSpend(
  spend: PayableSummary | undefined,
  thresholds: CriticalityThresholds,
): DiscoveredVendor["suggestedCriticality"] {
  if (!spend) {
    return "standard";
  }

  if (
    spend.totalPayableCzk >= thresholds.criticalSpendCzk ||
    spend.invoiceCount >= thresholds.criticalInvoiceCount
  ) {
    return "critical";
  }

  if (
    spend.totalPayableCzk >= thresholds.highSpendCzk ||
    spend.invoiceCount >= thresholds.highInvoiceCount
  ) {
    return "high";
  }

  return "standard";
}

function formatCzk(amount: number) {
  return new Intl.NumberFormat("cs-CZ", {
    currency: "CZK",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

function stableExternalKey(supplier: HeliosSupplierRecord) {
  return `helios-csv:vendor:${supplier.ico ?? encodeURIComponent(supplier.supplierId)}`;
}

function supplierContactEmail(supplier: HeliosSupplierRecord) {
  return (
    normalizeContactEmail(supplier.unknownMetadata.contact_email) ??
    normalizeContactEmail(supplier.unknownMetadata.email) ??
    normalizeContactEmail(supplier.unknownMetadata.e_mail) ??
    normalizeContactEmail(supplier.unknownMetadata.kontakt_email)
  );
}

export function mapHeliosCsvToVendorDrafts(input: {
  now?: Date;
  payableRecords?: HeliosCsvRecord[];
  supplierRecords: HeliosCsvRecord[];
  thresholds?: Partial<CriticalityThresholds>;
}): DiscoveredVendor[] {
  const now = input.now ?? new Date();
  const thresholds = { ...DEFAULT_THRESHOLDS, ...input.thresholds };
  const suppliers = input.supplierRecords.filter(isSupplierRecord);
  const payables = (input.payableRecords ?? []).filter(isPayableRecord);
  const spendBySupplier = summarizePayables(payables, now);
  const vendors = new Map<string, DiscoveredVendor>();

  for (const supplier of suppliers) {
    if (!supplier.supplierFlag) {
      continue;
    }

    const spend = spendBySupplier.get(supplier.supplierId);
    const externalKey = stableExternalKey(supplier);
    const contactEmail = supplierContactEmail(supplier);
    const vendor: DiscoveredVendor = {
      externalKey,
      ico: supplier.ico,
      metadata: {
        ...(contactEmail ? { contactEmail } : {}),
        dic: supplier.dic,
        invoiceCount: spend?.invoiceCount ?? null,
        supplierId: supplier.supplierId,
        totalPayableCzk: spend?.totalPayableCzk ?? null,
      },
      name: supplier.name,
      provider: HELIOS_PROVIDER,
      rationale: spend
        ? `Active supplier in Helios CSV export: ${spend.invoiceCount} invoices, ~${formatCzk(spend.totalPayableCzk)} payable in the last 12 months sample.`
        : "Listed as a supplier in the Helios CSV export; no last-12-month payable spend matched this supplier.",
      suggestedCriticality: criticalityFromSpend(spend, thresholds),
      supplyType: SUPPLY_TYPE,
    };
    vendors.set(externalKey, vendor);
  }

  return [...vendors.values()];
}

function parseSupplierRecords(suppliersCsvText: string) {
  const parsed = parseHeliosCsv("suppliers", suppliersCsvText);
  if (!parsed.ok) {
    throw new Error("Helios supplier CSV could not be parsed.");
  }
  return parsed.records;
}

function parsePayableRecords(payablesCsvText: string | null | undefined, warnings: string[]) {
  if (!payablesCsvText?.trim()) {
    warnings.push(
      "No Helios payables CSV was provided; supplier criticality is estimated from the supplier list only.",
    );
    return [];
  }

  const parsed = parseHeliosCsv("payables", payablesCsvText);
  if (!parsed.ok) {
    warnings.push(
      "Helios payables CSV could not be parsed; supplier criticality is estimated without spend data.",
    );
    return [];
  }

  return parsed.records;
}

function createDrizzleDraftStore(): HeliosCsvVendorDraftStore {
  return {
    async completeRun(input) {
      const db = getDb();
      await db
        .update(discoveryRuns)
        .set({
          finishedAt: new Date(),
          status: "complete",
          vendorsProposed: input.vendorsProposed,
          warnings: input.warnings,
        })
        .where(eq(discoveryRuns.id, input.runId));
    },

    async createRun(input) {
      const db = getDb();
      const rows = await db
        .insert(discoveryRuns)
        .values({
          clerkOrgId: input.clerkOrgId,
          integrationId: input.integrationId,
          provider: input.provider,
          status: "running",
        })
        .returning({ id: discoveryRuns.id });
      const runId = rows[0]?.id;
      if (!runId) {
        throw new Error("Failed to create Helios CSV discovery run.");
      }
      return runId;
    },

    async ensureIntegration(input) {
      const db = getDb();
      const rows = await db
        .insert(integrations)
        .values({
          clerkOrgId: input.clerkOrgId,
          config: {
            credentialType: "helios_csv_import",
            tokenType: "manual_csv",
          },
          lastErrorMsg: null,
          provider: "helios",
          status: "connected",
        })
        .onConflictDoUpdate({
          set: {
            lastErrorMsg: null,
            status: "connected",
          },
          target: [integrations.clerkOrgId, integrations.provider],
        })
        .returning({ id: integrations.id });
      const integrationId = rows[0]?.id;
      if (!integrationId) {
        throw new Error("Failed to create Helios CSV integration row.");
      }
      return integrationId;
    },

    async upsertVendors(input) {
      if (input.vendors.length === 0) {
        return 0;
      }

      const db = getDb();
      const keys = input.vendors.map((vendor) => vendor.externalKey);
      const existing = await db
        .select({ externalKey: discoveredVendors.externalKey })
        .from(discoveredVendors)
        .where(
          and(
            eq(discoveredVendors.clerkOrgId, input.clerkOrgId),
            inArray(discoveredVendors.externalKey, keys),
          ),
        );
      const existingKeys = new Set(existing.map((item) => item.externalKey));
      const now = new Date();
      let newCount = 0;

      for (const vendor of input.vendors) {
        if (existingKeys.has(vendor.externalKey)) {
          await db
            .update(discoveredVendors)
            .set({
              discoveryRunId: input.runId,
              ico: vendor.ico ?? null,
              lastSeenAt: now,
              metadata: vendor.metadata,
              name: vendor.name,
              provider: vendor.provider,
              rationale: vendor.rationale,
              suggestedCriticality: vendor.suggestedCriticality,
              supplyType: vendor.supplyType,
            })
            .where(
              and(
                eq(discoveredVendors.clerkOrgId, input.clerkOrgId),
                eq(discoveredVendors.externalKey, vendor.externalKey),
              ),
            );
          continue;
        }

        newCount += 1;
        await db.insert(discoveredVendors).values({
          clerkOrgId: input.clerkOrgId,
          discoveryRunId: input.runId,
          externalKey: vendor.externalKey,
          ico: vendor.ico ?? null,
          metadata: vendor.metadata,
          name: vendor.name,
          provider: vendor.provider,
          rationale: vendor.rationale,
          reviewStatus: "proposed",
          suggestedCriticality: vendor.suggestedCriticality,
          supplyType: vendor.supplyType,
        });
      }

      return newCount;
    },
  };
}

export async function stageHeliosCsvVendorDrafts(input: {
  clerkOrgId: string;
  integrationId?: string;
  now?: Date;
  payablesCsvText?: string | null;
  store?: HeliosCsvVendorDraftStore;
  suppliersCsvText: string;
  thresholds?: Partial<CriticalityThresholds>;
}): Promise<StageHeliosCsvVendorDraftsResult> {
  const warnings: string[] = [];
  const supplierRecords = parseSupplierRecords(input.suppliersCsvText);
  const payableRecords = parsePayableRecords(input.payablesCsvText, warnings);
  const vendors = mapHeliosCsvToVendorDrafts({
    now: input.now,
    payableRecords,
    supplierRecords,
    thresholds: input.thresholds,
  });
  const store = input.store ?? createDrizzleDraftStore();
  const integrationId = input.integrationId ?? await store.ensureIntegration({
    clerkOrgId: input.clerkOrgId,
  });
  const discoveryRunId = await store.createRun({
    clerkOrgId: input.clerkOrgId,
    integrationId,
    provider: "helios",
  });
  const newVendors = await store.upsertVendors({
    clerkOrgId: input.clerkOrgId,
    runId: discoveryRunId,
    vendors,
  });
  await store.completeRun({
    runId: discoveryRunId,
    vendorsProposed: vendors.length,
    warnings,
  });

  return {
    discoveryRunId,
    newVendors,
    vendorsProposed: vendors.length,
    warnings,
  };
}
