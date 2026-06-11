import { getMappingsByBaselineId, type VboNMappingFit } from "./mapping";
import { VBO_N_CONTROLS, type VboNControl } from "./spec";

export type VboNCoverageStatus = "covered" | "partial" | "missing";

export type VboNMappedControlState = {
  controlKey: string;
  fit: VboNMappingFit;
  /** Org status from org_control_statuses; null when the org has no row. */
  status: string | null;
};

export type VboNCoverageItem = VboNControl & {
  coverage: VboNCoverageStatus;
  mappedControls: VboNMappedControlState[];
};

export type VboNCoverageSummary = {
  covered: number;
  partial: number;
  missing: number;
  total: number;
};

/**
 * Confirmed coverage semantics (conservative by design):
 * - missing: no mapped controls and no satisfied record rule
 * - covered: a satisfied record rule, OR mappings exist, all fits are
 *   "direct", and every mapped control's org status is "pass"
 * - partial: everything else (any partial fit caps the result at partial
 *   even when all statuses pass; absent status rows count as not passing)
 */
export function computeVboNCoverage(input: {
  /** controlKey -> org status; omit keys the org has no status row for. */
  statusesByControlKey: Record<string, string>;
  /** baselineId -> true when an A3 record rule is satisfied (N-4-xx). */
  recordOverrides?: Record<string, boolean>;
}): VboNCoverageItem[] {
  const mappingsByBaselineId = getMappingsByBaselineId();
  const overrides = input.recordOverrides ?? {};

  return VBO_N_CONTROLS.map((control) => {
    const mappings = mappingsByBaselineId.get(control.id) ?? [];
    const mappedControls: VboNMappedControlState[] = mappings.map((mapping) => ({
      controlKey: mapping.controlKey,
      fit: mapping.fit,
      status: input.statusesByControlKey[mapping.controlKey] ?? null,
    }));

    let coverage: VboNCoverageStatus;

    if (overrides[control.id] === true) {
      coverage = "covered";
    } else if (mappedControls.length === 0) {
      coverage = "missing";
    } else {
      const allDirect = mappedControls.every((mapped) => mapped.fit === "direct");
      const allPass = mappedControls.every((mapped) => mapped.status === "pass");
      coverage = allDirect && allPass ? "covered" : "partial";
    }

    return { ...control, coverage, mappedControls };
  });
}

export function summarizeVboNCoverage(
  items: readonly VboNCoverageItem[],
): VboNCoverageSummary {
  const summary: VboNCoverageSummary = {
    covered: 0,
    missing: 0,
    partial: 0,
    total: items.length,
  };

  for (const item of items) {
    summary[item.coverage] += 1;
  }

  return summary;
}

/** Groups coverage items by tier, then area, preserving spec order. */
export function groupVboNCoverage(items: readonly VboNCoverageItem[]) {
  const tiers: { tier: VboNControl["tier"]; areas: { area: string; items: VboNCoverageItem[] }[] }[] = [];

  for (const item of items) {
    let tierGroup = tiers.find((group) => group.tier === item.tier);
    if (!tierGroup) {
      tierGroup = { areas: [], tier: item.tier };
      tiers.push(tierGroup);
    }

    let areaGroup = tierGroup.areas.find((group) => group.area === item.area);
    if (!areaGroup) {
      areaGroup = { area: item.area, items: [] };
      tierGroup.areas.push(areaGroup);
    }

    areaGroup.items.push(item);
  }

  return tiers;
}
