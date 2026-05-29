import { z } from "zod";

export const NUKIB_REGISTRATION_LEGAL_BASIS = "zákon č. 264/2025 Sb.";

export const NUKIB_SERVICE_CATEGORIES = [
  "energetika",
  "doprava",
  "bankovnictvi",
  "financni_trhy",
  "zdravotnictvi",
  "pitna_voda",
  "odpadni_vody",
  "digitalni_infrastruktura",
  "rizeni_ict_sluzeb",
  "verejna_sprava",
  "vesmir",
  "postovni_sluzby",
  "nakladani_s_odpady",
  "chemicke_latky",
  "potraviny",
  "vyroba",
  "digitalni_poskytovatele",
  "vyzkum",
] as const;

export const NUKIB_CONTACT_ROLES = [
  "primary",
  "technical",
  "security_manager",
  "statutory",
] as const;

function isValidIpv4Cidr(value: string) {
  const [address, mask, extra] = value.split("/");

  if (extra !== undefined || !address) {
    return false;
  }

  const octets = address.split(".");

  if (octets.length !== 4) {
    return false;
  }

  const hasValidOctets = octets.every((octet) => {
    if (!/^\d{1,3}$/.test(octet)) {
      return false;
    }

    const number = Number(octet);

    return Number.isInteger(number) && number >= 0 && number <= 255;
  });

  if (!hasValidOctets) {
    return false;
  }

  if (mask === undefined) {
    return true;
  }

  if (!/^\d{1,2}$/.test(mask)) {
    return false;
  }

  const maskNumber = Number(mask);

  return Number.isInteger(maskNumber) && maskNumber >= 0 && maskNumber <= 32;
}

function isValidInternationalPhone(value: string) {
  if (!/^\+[1-9]\d{0,3}(?: ?\d)+$/.test(value)) {
    return false;
  }

  const digitCount = value.replace(/\D/g, "").length;

  return digitCount >= 8 && digitCount <= 15;
}

export const NukibRegistrationSchema = z
  .object({
    ico: z.string().regex(/^\d{8}$/, "IČO must be 8 digits"),
    organisationName: z.string().min(1),
    dataBoxId: z.string().optional(),

    serviceCategory: z.enum(NUKIB_SERVICE_CATEGORIES),
    serviceDescription: z.string().min(1),
    regime: z.enum(["vyssi", "nizsi"]),
    entitySize: z.enum(["micro", "small", "medium", "large"]),

    geographicScope: z.enum(["cz_only", "cross_border"]),
    affectedMemberStates: z.array(z.string().regex(/^[A-Z]{2}$/)).optional(),

    serviceNetworkScope: z
      .object({
        ipRanges: z
          .array(
            z.string().refine(
              isValidIpv4Cidr,
              "Musí být platná IPv4 adresa nebo rozsah CIDR",
            ),
          )
          .optional()
          .default([]),
        domainNames: z
          .array(
            z.string().regex(
              /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
              "Musí být platné doménové jméno",
            ),
          )
          .optional()
          .default([]),
      })
      .optional(),

    contacts: z
      .array(
        z.object({
          role: z.enum(NUKIB_CONTACT_ROLES),
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().refine(
            isValidInternationalPhone,
            "Telefon musí být v mezinárodním formátu, např. +420 200 000 001",
          ),
          position: z.string().optional(),
        }),
      )
      .min(2),

    ownershipChain: z.string().optional(),
    crossBorderDependencies: z.string().optional(),
    cyberSecurityManagerAppointed: z.boolean().optional(),

    preparedAt: z.string().datetime(),
    preparedBy: z.string().min(1),
    legalBasis: z.literal(NUKIB_REGISTRATION_LEGAL_BASIS),
  })
  .refine(
    (registration) =>
      registration.contacts.some((contact) => contact.role === "primary") &&
      registration.contacts.some((contact) => contact.role === "technical") &&
      registration.contacts.some((contact) => contact.role === "statutory"),
    {
      message:
        "Alespoň jeden kontakt musí mít roli primary, technical a statutory",
      path: ["contacts"],
    },
  );

export type NukibRegistration = z.infer<typeof NukibRegistrationSchema>;
