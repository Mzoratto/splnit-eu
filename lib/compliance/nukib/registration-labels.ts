import type { NukibRegistration } from "@/lib/compliance/nukib/registration-schema";

type LabelOption<T extends string> = {
  label: string;
  value: T;
};

export const SERVICE_CATEGORY_LABELS = {
  energetika: "Energetika",
  doprava: "Doprava",
  bankovnictvi: "Bankovnictví",
  financni_trhy: "Infrastruktura finančních trhů",
  zdravotnictvi: "Zdravotnictví",
  pitna_voda: "Pitná voda",
  odpadni_vody: "Odpadní vody",
  digitalni_infrastruktura: "Digitální infrastruktura",
  rizeni_ict_sluzeb: "Řízení služeb ICT",
  verejna_sprava: "Veřejná správa",
  vesmir: "Vesmír",
  postovni_sluzby: "Poštovní a kurýrní služby",
  nakladani_s_odpady: "Nakládání s odpady",
  chemicke_latky: "Chemické látky",
  potraviny: "Potraviny",
  vyroba: "Výroba",
  digitalni_poskytovatele: "Digitální poskytovatelé",
  vyzkum: "Výzkum",
} as const satisfies Record<NukibRegistration["serviceCategory"], string>;

export const SERVICE_CATEGORY_OPTIONS = Object.entries(SERVICE_CATEGORY_LABELS).map(
  ([value, label]) => ({
    label,
    value,
  }),
) as LabelOption<NukibRegistration["serviceCategory"]>[];

export const CONTACT_ROLE_LABELS = {
  primary: "Primární",
  technical: "Technický",
  security_manager: "Manažer KB",
  statutory: "Statutární",
} as const satisfies Record<NukibRegistration["contacts"][number]["role"], string>;

export const CONTACT_ROLE_OPTIONS = Object.entries(CONTACT_ROLE_LABELS).map(
  ([value, label]) => ({
    label,
    value,
  }),
) as LabelOption<NukibRegistration["contacts"][number]["role"]>[];

export const ENTITY_SIZE_LABELS = {
  micro: "Mikro",
  small: "Malý",
  medium: "Střední",
  large: "Velký",
} as const satisfies Record<NukibRegistration["entitySize"], string>;

export const ENTITY_SIZE_OPTIONS = Object.entries(ENTITY_SIZE_LABELS).map(
  ([value, label]) => ({
    label,
    value,
  }),
) as LabelOption<NukibRegistration["entitySize"]>[];

export const REGIME_LABELS = {
  nizsi: "Nižší",
  vyssi: "Vyšší",
} as const satisfies Record<NukibRegistration["regime"], string>;

export const REGIME_OPTIONS = Object.entries(REGIME_LABELS).map(([value, label]) => ({
  label,
  value,
})) as LabelOption<NukibRegistration["regime"]>[];

export const GEOGRAPHIC_SCOPE_LABELS = {
  cross_border: "Přeshraniční",
  cz_only: "CZ pouze",
} as const satisfies Record<NukibRegistration["geographicScope"], string>;

export const GEOGRAPHIC_SCOPE_OPTIONS = Object.entries(GEOGRAPHIC_SCOPE_LABELS).map(
  ([value, label]) => ({
    label,
    value,
  }),
) as LabelOption<NukibRegistration["geographicScope"]>[];
