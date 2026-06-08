import { auth } from "@clerk/nextjs/server";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import {
  DiscoveryReview,
  type ProposedAsset,
  type ProposedVendor,
} from "@/components/discovery/discovery-review";
import { listProposedDiscoveryItemsForOrg } from "@/lib/db/queries/discovery";
import type { CiaLevel } from "@/lib/db/schema";
import {
  confirmDiscoveredAssetAction,
  confirmDiscoveredVendorAction,
  dismissDiscoveredItemAction,
  runDiscoveryAction,
} from "./actions";

function asCia(value: unknown): ProposedAsset["suggestedCia"] {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const toLevel = (item: unknown): CiaLevel =>
    item === "medium" || item === "high" ? item : "low";

  return {
    availability: toLevel(record.availability),
    confidentiality: toLevel(record.confidentiality),
    integrity: toLevel(record.integrity),
  };
}

export default async function DiscoveryPage() {
  const session = await auth();

  if (!session.orgId) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Auto-discovery"
          title="Draft your register from connected systems"
          subtitle="Sign in with an active organisation to review discovered assets and suppliers."
        />
      </div>
    );
  }

  const proposals = await listProposedDiscoveryItemsForOrg(session.orgId).catch(() => ({
    assets: [],
    vendors: [],
  }));
  const assets: ProposedAsset[] = proposals.assets.map((asset) => ({
    category: asset.category,
    id: asset.id,
    name: asset.name,
    provider: asset.provider,
    rationale: asset.rationale,
    suggestedCia: asCia(asset.suggestedCia),
    suggestedOwner: asset.suggestedOwner,
    tier: asset.tier,
  }));
  const vendors: ProposedVendor[] = proposals.vendors.map((vendor) => ({
    ico: vendor.ico,
    id: vendor.id,
    name: vendor.name,
    provider: vendor.provider,
    rationale: vendor.rationale,
    suggestedCriticality:
      vendor.suggestedCriticality === "critical" || vendor.suggestedCriticality === "high"
        ? vendor.suggestedCriticality
        : "standard",
    supplyType: vendor.supplyType,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <form action={runDiscoveryAction}>
            <button type="submit" className="btn btn-primary inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Run discovery
            </button>
          </form>
        }
        eyebrow="Auto-discovery"
        title="Review your draft asset and supplier register"
        subtitle="Splnit.eu reads connected systems into a staging area. Confirmed rows become real register entries; dismissed rows stay out of compliance evidence."
      />

      <DiscoveryReview
        assets={assets}
        onConfirmAsset={confirmDiscoveredAssetAction}
        onConfirmVendor={confirmDiscoveredVendorAction}
        onDismiss={dismissDiscoveredItemAction}
        vendors={vendors}
      />
    </div>
  );
}
