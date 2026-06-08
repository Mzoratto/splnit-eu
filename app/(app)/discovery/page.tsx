import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import {
  DiscoveryReview,
  type ProposedAsset,
  type ProposedVendor,
} from "@/components/discovery/discovery-review";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import { listProposedDiscoveryItemsForOrg } from "@/lib/db/queries/discovery";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { isDiscoveryEnabledForOrg } from "@/lib/discovery/flags";
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
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const session = await auth();
  const organisation = session.orgId
    ? await getOrganisationByClerkOrgId(session.orgId).catch(() => null)
    : null;
  const locale = normalizeLocale(organisation?.locale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).discovery;

  if (!session.orgId) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={copy.page.eyebrow}
          title={copy.page.signedOutTitle}
          subtitle={copy.page.signedOutSubtitle}
        />
      </div>
    );
  }

  if (!isDiscoveryEnabledForOrg(session.orgId)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={copy.page.eyebrow}
          title={copy.page.disabledTitle}
          subtitle={copy.page.disabledSubtitle}
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
              {copy.page.runDiscovery}
            </button>
          </form>
        }
        eyebrow={copy.page.eyebrow}
        title={copy.page.title}
        subtitle={copy.page.subtitle}
      />

      <DiscoveryReview
        assets={assets}
        copy={copy.review}
        onConfirmAsset={confirmDiscoveredAssetAction}
        onConfirmVendor={confirmDiscoveredVendorAction}
        onDismiss={dismissDiscoveredItemAction}
        vendors={vendors}
      />
    </div>
  );
}
