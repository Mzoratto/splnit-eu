import specJson from "@/regulations/cz-vbo-n/v1.1.json";

export type VboNTier = "neopominutelné" | "vyhodnotitelné";

export type VboNControl = {
  id: string;
  ref: string;
  tier: VboNTier;
  area: string;
  control: string;
  params: string;
};

export type VboNSpec = {
  meta: {
    source: string;
    legal_basis: string[];
    implementation_deadline: string;
    extracted: string;
  };
  controls: VboNControl[];
};

/**
 * Canonical VBO-N baseline (vyhláška č. 410/2025 Sb., režim nižších
 * povinností), extracted from the NÚKIB manual v1.1. The JSON is a verbatim
 * copy of the provided spec — never edit its content; ship a new versioned
 * file instead. Legal references in UI/exports must come from `ref` here.
 */
export const VBO_N_SPEC = specJson as VboNSpec;

export const VBO_N_CONTROLS: readonly VboNControl[] = VBO_N_SPEC.controls;

const controlsById = new Map(VBO_N_CONTROLS.map((control) => [control.id, control]));

export function getVboNControl(id: string): VboNControl | null {
  return controlsById.get(id) ?? null;
}

export function isVboNBaselineId(id: string): boolean {
  return controlsById.has(id);
}
