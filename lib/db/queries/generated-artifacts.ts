import { getDb } from "@/lib/db";
import { generatedArtifacts } from "@/lib/db/schema";

export type GeneratedArtifactKind = "questionnaire_answers" | "gap_analysis";

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
  const rows = await db
    .insert(generatedArtifacts)
    .values({
      clerkOrgId: input.clerkOrgId,
      content: input.content,
      createdBy: input.createdBy,
      kind: input.kind,
      model: input.model,
      source: input.source ?? "questionnaire_ai",
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

  return artifact;
}
