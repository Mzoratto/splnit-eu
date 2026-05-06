import { auth } from "@clerk/nextjs/server";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";
import { QuestionnaireResultSchema } from "@/lib/questionnaires/types";
import { renderQuestionnaireAnswersPdf } from "@/lib/pdf/questionnaire-answers";

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
  const payload = formData.get("payload");

  if (typeof payload !== "string") {
    return privateJson({ error: "Missing export payload" }, { status: 400 });
  }

  const result = QuestionnaireResultSchema.parse(JSON.parse(payload));
  const pdf = await renderQuestionnaireAnswersPdf(result);

  return new Response(new Uint8Array(pdf), {
    headers: withPrivateNoStore({
      "Content-Disposition": 'attachment; filename="questionnaire-answers.pdf"',
      "Content-Type": "application/pdf",
    }),
  });
}
