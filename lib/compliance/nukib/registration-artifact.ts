import {
  createGeneratedArtifact,
  type GeneratedArtifactKind,
} from "@/lib/db/queries/generated-artifacts";
import {
  NukibRegistrationSchema,
  type NukibRegistration,
} from "@/lib/compliance/nukib/registration-schema";

export const NUKIB_REGISTRATION_KIND = "nukib_registration" as const;

export function serializeNukibRegistrationContent(data: NukibRegistration) {
  return JSON.stringify(data);
}

export function parseNukibRegistrationContent(content: unknown): NukibRegistration {
  const raw =
    typeof content === "string"
      ? JSON.parse(content)
      : content;

  return NukibRegistrationSchema.parse(raw);
}

export async function buildNukibRegistrationArtifact(
  orgId: string,
  data: NukibRegistration,
  createdBy: string,
): Promise<{ id: string }> {
  const parsed = NukibRegistrationSchema.parse(data);
  const content = serializeNukibRegistrationContent(parsed);
  const artifact = await createGeneratedArtifact({
    clerkOrgId: orgId,
    content: content as unknown as Record<string, unknown>,
    createdBy,
    kind: NUKIB_REGISTRATION_KIND satisfies GeneratedArtifactKind,
    model: null,
    source: "manual",
    title: `Registrace NÚKIB — ${parsed.organisationName}`,
  });

  return { id: artifact.id };
}
