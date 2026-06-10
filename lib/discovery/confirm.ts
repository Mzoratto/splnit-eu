import { and, eq } from "drizzle-orm";
import { createEvidenceState } from "@/lib/activation/evidence-state";
import { recalculateFrameworkScore } from "@/lib/controls/scorer";
import { getDb } from "@/lib/db";
import { createManualEvidence } from "@/lib/db/queries/evidence";
import {
  assets,
  controls,
  discoveredAssets,
  discoveredVendors,
  evidence,
  frameworkControls,
  orgControlStatuses,
  orgFrameworks,
  vendors,
} from "@/lib/db/schema";
import { getContactEmailFromMetadata } from "@/lib/vendors/contact-email";
import { maybeAutoSendVendorQuestionnaireForConfirmedVendor } from "@/lib/vendors/questionnaire-send";
import type { CiaRating } from "./types";

const DISCOVERY_ASSET_INVENTORY_CONTROL_KEY = "ctrl_asset_inventory";
const DISCOVERY_VENDOR_SECURITY_CONTROL_KEY = "ctrl_vendor_security_assessment";
const DISCOVERY_VENDOR_CONFIRMATION_EVIDENCE_TYPE = "auto_discovery_vendor_confirmation";

function riskTierFromCriticality(value: string) {
  if (value === "critical" || value === "high") {
    return value;
  }

  return "low";
}

async function recalculateFrameworkScoresForControl(input: {
  clerkOrgId: string;
  controlId: string;
}) {
  const db = getDb();
  const frameworkRows = await db
    .select({ frameworkId: frameworkControls.frameworkId })
    .from(frameworkControls)
    .innerJoin(
      orgFrameworks,
      and(
        eq(orgFrameworks.frameworkId, frameworkControls.frameworkId),
        eq(orgFrameworks.clerkOrgId, input.clerkOrgId),
      ),
    )
    .where(eq(frameworkControls.controlId, input.controlId));

  await Promise.all(
    frameworkRows.map((row) =>
      recalculateFrameworkScore(input.clerkOrgId, row.frameworkId),
    ),
  );
}

async function getControlIdByKey(controlKey: string) {
  const db = getDb();
  const controlRows = await db
    .select({ id: controls.id })
    .from(controls)
    .where(eq(controls.key, controlKey))
    .limit(1);

  return controlRows[0]?.id ?? null;
}

async function hasVendorControlEvidence(input: {
  clerkOrgId: string;
  controlId: string;
  vendorId: string;
}) {
  const db = getDb();
  const rows = await db
    .select({ snapshotData: evidence.snapshotData })
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, input.clerkOrgId),
        eq(evidence.controlId, input.controlId),
      ),
    );

  return rows.some((row) => {
    const snapshotData = row.snapshotData as { vendorId?: unknown } | null;
    return snapshotData?.vendorId === input.vendorId;
  });
}

export async function confirmDiscoveredAsset(input: {
  clerkOrgId: string;
  discoveredAssetId: string;
  overrides?: {
    cia?: CiaRating;
    name?: string;
    owner?: string;
  };
  userId: string;
}): Promise<{ assetId: string }> {
  const db = getDb();
  const result = await db.transaction(async (tx) => {
    const draftRows = await tx
      .select()
      .from(discoveredAssets)
      .where(
        and(
          eq(discoveredAssets.clerkOrgId, input.clerkOrgId),
          eq(discoveredAssets.id, input.discoveredAssetId),
        ),
      )
      .limit(1);
    const draft = draftRows[0] ?? null;

    if (!draft) {
      throw new Error("Discovered asset not found.");
    }

    if (draft.linkedAssetId) {
      return { assetId: draft.linkedAssetId, controlId: null as string | null };
    }

    if (draft.reviewStatus === "dismissed") {
      throw new Error("Dismissed discoveries cannot be confirmed.");
    }

    const controlRows = await tx
      .select({ id: controls.id })
      .from(controls)
      .where(eq(controls.key, DISCOVERY_ASSET_INVENTORY_CONTROL_KEY))
      .limit(1);
    const controlId = controlRows[0]?.id;

    if (!controlId) {
      throw new Error(`Unknown control: ${DISCOVERY_ASSET_INVENTORY_CONTROL_KEY}`);
    }

    const now = new Date();
    const cia = input.overrides?.cia ?? draft.suggestedCia;
    const assetRows = await tx
      .insert(assets)
      .values({
        availability: cia.availability,
        category: draft.category,
        clerkOrgId: input.clerkOrgId,
        confidentiality: cia.confidentiality,
        externalKey: draft.externalKey,
        integrity: cia.integrity,
        metadata: draft.metadata,
        name: input.overrides?.name ?? draft.name,
        owner: input.overrides?.owner ?? draft.suggestedOwner,
        source: "auto_discovery",
        sourceProvider: draft.provider,
        tier: draft.tier,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [assets.clerkOrgId, assets.externalKey],
        set: {
          availability: cia.availability,
          category: draft.category,
          confidentiality: cia.confidentiality,
          integrity: cia.integrity,
          metadata: draft.metadata,
          name: input.overrides?.name ?? draft.name,
          owner: input.overrides?.owner ?? draft.suggestedOwner,
          source: "auto_discovery",
          sourceProvider: draft.provider,
          tier: draft.tier,
          updatedAt: now,
        },
      })
      .returning({ id: assets.id });
    const assetId = assetRows[0]?.id;

    if (!assetId) {
      throw new Error("Failed to create asset.");
    }

    const evidenceState = createEvidenceState({
      assessment_result: "pass",
      collected_at: now,
      collection_status: "collected",
      confidence: "high",
      source: "connector",
    });

    await tx.insert(evidence).values({
      assessmentResult: evidenceState.assessment_result,
      blockedReason: evidenceState.blocked_reason,
      clerkOrgId: input.clerkOrgId,
      collectedAt: evidenceState.collected_at,
      collectedBy: input.userId,
      collectionStatus: evidenceState.collection_status,
      confidence: evidenceState.confidence,
      controlId,
      description: `Asset "${input.overrides?.name ?? draft.name}" was confirmed from ${draft.provider} discovery and added to the asset register.`,
      snapshotData: {
        assetId,
        boundary: "human_confirmed_auto_discovery_draft",
        externalKey: draft.externalKey,
        provider: draft.provider,
        rationale: draft.rationale,
      },
      source: evidenceState.source,
      type: "auto_discovery_asset_confirmation",
    });

    await tx
      .insert(orgControlStatuses)
      .values({
        clerkOrgId: input.clerkOrgId,
        controlId,
        lastEvidenceAt: now,
        status: "pass",
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
        set: {
          lastEvidenceAt: now,
          status: "pass",
          updatedAt: now,
        },
      });

    await tx
      .update(discoveredAssets)
      .set({
        linkedAssetId: assetId,
        reviewStatus: "confirmed",
      })
      .where(
        and(
          eq(discoveredAssets.clerkOrgId, input.clerkOrgId),
          eq(discoveredAssets.id, input.discoveredAssetId),
        ),
      );

    return { assetId, controlId };
  });

  if (result.controlId) {
    await recalculateFrameworkScoresForControl({
      clerkOrgId: input.clerkOrgId,
      controlId: result.controlId,
    });
  }

  return { assetId: result.assetId };
}

export async function confirmDiscoveredVendor(input: {
  clerkOrgId: string;
  discoveredVendorId: string;
  overrides?: {
    name?: string;
    riskTier?: string;
  };
}): Promise<{ vendorId: string }> {
  const db = getDb();
  const result = await db.transaction(async (tx) => {
    const draftRows = await tx
      .select()
      .from(discoveredVendors)
      .where(
        and(
          eq(discoveredVendors.clerkOrgId, input.clerkOrgId),
          eq(discoveredVendors.id, input.discoveredVendorId),
        ),
      )
      .limit(1);
    const draft = draftRows[0] ?? null;

    if (!draft) {
      throw new Error("Discovered supplier not found.");
    }

    if (draft.linkedVendorId) {
      return {
        autoSendInput: null,
        evidenceInput: {
          externalKey: draft.externalKey,
          name: input.overrides?.name ?? draft.name,
          provider: draft.provider,
          rationale: draft.rationale,
          suggestedCriticality: draft.suggestedCriticality,
          supplyType: draft.supplyType,
        },
        vendorId: draft.linkedVendorId,
      };
    }

    if (draft.reviewStatus === "dismissed") {
      throw new Error("Dismissed discoveries cannot be confirmed.");
    }

    const vendorName = input.overrides?.name ?? draft.name;
    const riskTier = input.overrides?.riskTier ?? riskTierFromCriticality(draft.suggestedCriticality);
    const contactEmail = getContactEmailFromMetadata(draft.metadata);
    const vendorRows = await tx
      .insert(vendors)
      .values({
        category: draft.supplyType,
        clerkOrgId: input.clerkOrgId,
        externalKey: draft.externalKey,
        ico: draft.ico,
        name: vendorName,
        riskTier,
        source: "auto_discovery",
        sourceProvider: draft.provider,
        status: "pending",
        supplyType: draft.supplyType,
      })
      .onConflictDoUpdate({
        target: [vendors.clerkOrgId, vendors.externalKey],
        set: {
          category: draft.supplyType,
          ico: draft.ico,
          name: vendorName,
          riskTier,
          source: "auto_discovery",
          sourceProvider: draft.provider,
          status: "pending",
          supplyType: draft.supplyType,
        },
      })
      .returning({ id: vendors.id });
    const vendorId = vendorRows[0]?.id;

    if (!vendorId) {
      throw new Error("Failed to create supplier.");
    }

    await tx
      .update(discoveredVendors)
      .set({
        linkedVendorId: vendorId,
        reviewStatus: "confirmed",
      })
      .where(
        and(
          eq(discoveredVendors.clerkOrgId, input.clerkOrgId),
          eq(discoveredVendors.id, input.discoveredVendorId),
        ),
      );

    return {
      autoSendInput: {
        contactEmail,
        riskTier,
      },
      evidenceInput: {
        externalKey: draft.externalKey,
        name: vendorName,
        provider: draft.provider,
        rationale: draft.rationale,
        suggestedCriticality: draft.suggestedCriticality,
        supplyType: draft.supplyType,
      },
      vendorId,
    };
  });

  if (!result.evidenceInput) {
    return { vendorId: result.vendorId };
  }

  const controlId = await getControlIdByKey(DISCOVERY_VENDOR_SECURITY_CONTROL_KEY);

  if (!controlId) {
    throw new Error(`Unknown control: ${DISCOVERY_VENDOR_SECURITY_CONTROL_KEY}`);
  }

  const evidenceExists = await hasVendorControlEvidence({
    clerkOrgId: input.clerkOrgId,
    controlId,
    vendorId: result.vendorId,
  });

  if (!evidenceExists) {
    await createManualEvidence({
      assessmentResult: "manual_review",
      blobUrl: null,
      clerkOrgId: input.clerkOrgId,
      collectedBy: "system:discovery-confirmation",
      controlKey: DISCOVERY_VENDOR_SECURITY_CONTROL_KEY,
      description: `Dodavatel "${result.evidenceInput.name}" přidán do registru z ${result.evidenceInput.provider} objevení; čeká na bezpečnostní hodnocení.`,
      expiresAt: null,
      fileType: DISCOVERY_VENDOR_CONFIRMATION_EVIDENCE_TYPE,
      snapshotData: {
        boundary: "supplier_listed_assessment_pending",
        discoveredVendorId: input.discoveredVendorId,
        externalKey: result.evidenceInput.externalKey,
        provider: result.evidenceInput.provider,
        rationale: result.evidenceInput.rationale,
        suggestedCriticality: result.evidenceInput.suggestedCriticality,
        supplyType: result.evidenceInput.supplyType,
        vendorId: result.vendorId,
      },
      source: "connector",
    });
  }

  if (result.autoSendInput) {
    await maybeAutoSendVendorQuestionnaireForConfirmedVendor({
      clerkOrgId: input.clerkOrgId,
      contactEmail: result.autoSendInput.contactEmail,
      riskTier: result.autoSendInput.riskTier,
      vendorId: result.vendorId,
    });
  }

  return { vendorId: result.vendorId };
}

export async function dismissDiscoveredItem(input: {
  clerkOrgId: string;
  id: string;
  kind: "asset" | "vendor";
}) {
  const db = getDb();
  const table = input.kind === "asset" ? discoveredAssets : discoveredVendors;

  await db
    .update(table)
    .set({ reviewStatus: "dismissed" })
    .where(and(eq(table.clerkOrgId, input.clerkOrgId), eq(table.id, input.id)));
}
