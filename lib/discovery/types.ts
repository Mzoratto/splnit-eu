import type {
  AssetCategory,
  AssetTier,
  CiaLevel,
  Integration,
} from "@/lib/db/schema";
import type { IntegrationProvider } from "@/lib/integrations/types";

export type CiaRating = {
  availability: CiaLevel;
  confidentiality: CiaLevel;
  integrity: CiaLevel;
};

export type DiscoveredAsset = {
  category: AssetCategory;
  externalKey: string;
  metadata: Record<string, unknown>;
  name: string;
  provider: IntegrationProvider;
  rationale: string;
  suggestedCia: CiaRating;
  suggestedOwner: string;
  tier: AssetTier;
};

export type DiscoveredVendor = {
  externalKey: string;
  ico?: string | null;
  metadata: Record<string, unknown>;
  name: string;
  provider: IntegrationProvider;
  rationale: string;
  suggestedCriticality: "critical" | "high" | "standard";
  supplyType: string;
};

export type DiscoveryResult = {
  assets: DiscoveredAsset[];
  vendors: DiscoveredVendor[];
  warnings: string[];
};

export type DiscoveryAdapter = {
  discover(integration: Integration): Promise<DiscoveryResult>;
  provider: IntegrationProvider;
};
