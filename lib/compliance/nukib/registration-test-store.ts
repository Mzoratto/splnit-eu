import { randomUUID } from "node:crypto";
import {
  NukibRegistrationSchema,
  type NukibRegistration,
} from "./registration-schema";

export type NukibRegistrationTestArtifact = {
  clerkOrgId: string;
  content: NukibRegistration;
  createdAt: Date;
  createdBy: string;
  id: string;
  title: string;
};

const globalStore = globalThis as typeof globalThis & {
  __splnitNukibRegistrationTestArtifacts?: Map<
    string,
    NukibRegistrationTestArtifact
  >;
};

function getStore() {
  globalStore.__splnitNukibRegistrationTestArtifacts ??= new Map<
    string,
    NukibRegistrationTestArtifact
  >();

  return globalStore.__splnitNukibRegistrationTestArtifacts;
}

export function createNukibRegistrationTestArtifact(input: {
  clerkOrgId: string;
  createdBy: string;
  data: NukibRegistration;
}) {
  const content = NukibRegistrationSchema.parse(input.data);
  const artifact: NukibRegistrationTestArtifact = {
    clerkOrgId: input.clerkOrgId,
    content,
    createdAt: new Date(),
    createdBy: input.createdBy,
    id: randomUUID(),
    title: `Registrace NÚKIB — ${content.organisationName}`,
  };

  getStore().set(artifact.id, artifact);

  return artifact;
}

export function getLatestNukibRegistrationTestArtifact(clerkOrgId: string) {
  let latest: NukibRegistrationTestArtifact | null = null;

  for (const artifact of getStore().values()) {
    if (artifact.clerkOrgId !== clerkOrgId) {
      continue;
    }

    if (!latest || artifact.createdAt.getTime() > latest.createdAt.getTime()) {
      latest = artifact;
    }
  }

  return latest;
}

export function getNukibRegistrationTestArtifact(input: {
  artifactId: string;
  clerkOrgId: string;
}) {
  const artifact = getStore().get(input.artifactId) ?? null;

  if (!artifact || artifact.clerkOrgId !== input.clerkOrgId) {
    return null;
  }

  return artifact;
}
