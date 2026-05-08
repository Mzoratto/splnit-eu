import { auth } from "@clerk/nextjs/server";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";
import { getGeneratedArtifactForOrg } from "@/lib/db/queries/generated-artifacts";
import { QUESTIONNAIRE_ARTIFACT_KIND } from "@/lib/questionnaires/artifacts";
import { QuestionnaireResultSchema } from "@/lib/questionnaires/types";
import { renderQuestionnaireAnswersPdf } from "@/lib/pdf/questionnaire-answers";
import { getQuestionnaireExportEligibility } from "@/lib/questionnaires/review-gate";

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

export async function POST(request: Request) {
  if (!hasClerkConfig()) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const artifactId = formData.get("artifactId");

  if (typeof artifactId !== "string" || !artifactId) {
    return privateJson({ error: "Missing artifact id" }, { status: 400 });
  }

  const artifact = await getGeneratedArtifactForOrg({
    artifactId,
    clerkOrgId: session.orgId,
    kind: QUESTIONNAIRE_ARTIFACT_KIND,
  });

  if (!artifact) {
    return privateJson({ error: "Artifact not found" }, { status: 404 });
  }

  const content = artifact.content as { result?: unknown };
  const result = QuestionnaireResultSchema.parse(content.result);
  const eligibility = getQuestionnaireExportEligibility(result);

  if (!eligibility.allowed) {
    return privateJson(
      {
        blockedAnswers: eligibility.blockedAnswers,
        error: eligibility.reason,
      },
      { status: 409 },
    );
  }

  const pdf = await renderQuestionnaireAnswersPdf(result);

  return new Response(new Uint8Array(pdf), {
    headers: withPrivateNoStore({
      "Content-Disposition": 'attachment; filename="questionnaire-answers.pdf"',
      "Content-Type": "application/pdf",
    }),
  });
}
