import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { QuestionnaireResultSchema } from "@/lib/questionnaires/types";
import { renderQuestionnaireAnswersPdf } from "@/lib/pdf/questionnaire-answers";

export async function POST(request: Request) {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const payload = formData.get("payload");

  if (typeof payload !== "string") {
    return NextResponse.json({ error: "Missing export payload" }, { status: 400 });
  }

  const result = QuestionnaireResultSchema.parse(JSON.parse(payload));
  const pdf = await renderQuestionnaireAnswersPdf(result);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Disposition": 'attachment; filename="questionnaire-answers.pdf"',
      "Content-Type": "application/pdf",
    },
  });
}
