import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { getDb } from "@/lib/db";
import { generatedArtifacts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export type GeneratedArtifactKind = "questionnaire_answers" | "gap_analysis";

export const GENERATED_ARTIFACT_ENTITY_TYPE = "generated_artifact";
export const GENERATED_ARTIFACT_CREATED_ACTION = "generated_artifact.created";

export function buildGeneratedArtifactAuditLog(input: {
  artifactId: string;
  kind: GeneratedArtifactKind;
  model: string | null;
  source: string;
  title: string;
}) {
  return {
    action: GENERATED_ARTIFACT_CREATED_ACTION,
    entityId: input.artifactId,
    entityType: GENERATED_ARTIFACT_ENTITY_TYPE,
    metadata: {
      kind: input.kind,
      model: input.model,
      source: input.source,
      title: input.title,
    },
  };
}

export function normalizeGeneratedArtifactLimit(limit = 10) {
  if (!Number.isFinite(limit)) {
    return 10;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), 50);
}

export async function listGeneratedArtifactSummaries(input: {
  clerkOrgId: string;
  limit?: number;
}) {
  const db = getDb();

  return db
    .select({
      createdAt: generatedArtifacts.createdAt,
      id: generatedArtifacts.id,
      kind: generatedArtifacts.kind,
      model: generatedArtifacts.model,
      source: generatedArtifacts.source,
      title: generatedArtifacts.title,
    })
    .from(generatedArtifacts)
    .where(eq(generatedArtifacts.clerkOrgId, input.clerkOrgId))
    .orderBy(desc(generatedArtifacts.createdAt))
    .limit(normalizeGeneratedArtifactLimit(input.limit));
}

export async function createGeneratedArtifact(input: {
  clerkOrgId: string;
  content: Record<string, unknown>;
  createdBy: string;
  kind: GeneratedArtifactKind;
  model: string | null;
  source?: string;
  title: string;
}) {
  const db = getDb();
  const source = input.source ?? "questionnaire_ai";
  const rows = await db
    .insert(generatedArtifacts)
    .values({
      clerkOrgId: input.clerkOrgId,
      content: input.content,
      createdBy: input.createdBy,
      kind: input.kind,
      model: input.model,
      source,
      title: input.title,
    })
    .returning({
      createdAt: generatedArtifacts.createdAt,
      id: generatedArtifacts.id,
    });
  const artifact = rows[0] ?? null;

  if (!artifact) {
    throw new Error("Failed to create generated artifact.");
  }

  await createAuditLog({
    ...buildGeneratedArtifactAuditLog({
      artifactId: artifact.id,
      kind: input.kind,
      model: input.model,
      source,
      title: input.title,
    }),
    clerkOrgId: input.clerkOrgId,
    clerkUserId: input.createdBy,
  });

  return artifact;
}
