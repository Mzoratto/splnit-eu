import type { CiaLevel } from "@/lib/db/schema";
import type { CiaRating, DiscoveredAsset } from "@/lib/discovery/types";

export type AssetSignals = {
  blastRadius: number;
  handlesSensitiveData: boolean;
  internetFacing: boolean;
  privileged: boolean;
  production: boolean;
};

const HIGH = "high" as const;
const MEDIUM = "medium" as const;
const LOW = "low" as const;

export function suggestCia(signals: AssetSignals): {
  rating: CiaRating;
  rationale: string;
} {
  const reasons: string[] = [];

  let confidentiality: CiaLevel = LOW;
  if (signals.handlesSensitiveData) {
    confidentiality = HIGH;
    reasons.push("processes personal or financial data");
  } else if (signals.privileged) {
    confidentiality = MEDIUM;
    reasons.push("has privileged access scope");
  }

  let integrity: CiaLevel = LOW;
  if (signals.privileged && signals.production) {
    integrity = HIGH;
    reasons.push("privileged changes affect production integrity");
  } else if (signals.production) {
    integrity = MEDIUM;
    reasons.push("production system");
  }

  let availability: CiaLevel = LOW;
  if (signals.production && signals.blastRadius >= 25) {
    availability = HIGH;
    reasons.push(`outage would affect ~${signals.blastRadius} dependents`);
  } else if (signals.production && signals.blastRadius > 0) {
    availability = MEDIUM;
    reasons.push("production system with active dependents");
  }

  if (signals.internetFacing) {
    confidentiality = raise(confidentiality, MEDIUM);
    integrity = raise(integrity, MEDIUM);
    reasons.push("internet-facing (exposure raises the floor)");
  }

  return {
    rationale: reasons.length > 0
      ? `Suggested from: ${reasons.join("; ")}.`
      : "No elevating signals found; defaulted to low. Confirm manually.",
    rating: {
      availability,
      confidentiality,
      integrity,
    },
  };
}

function raise(current: CiaLevel, floor: CiaLevel): CiaLevel {
  const order = { high: 2, low: 0, medium: 1 } as const;
  return order[current] >= order[floor] ? current : floor;
}

export function ciaFor(signals: AssetSignals): Pick<
  DiscoveredAsset,
  "rationale" | "suggestedCia"
> {
  const { rating, rationale } = suggestCia(signals);
  return { rationale, suggestedCia: rating };
}
