import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { QuestionnaireResultSchema } from "@/lib/questionnaires/types";
import { renderQuestionnaireAnswersXlsx } from "@/lib/questionnaires/xlsx";

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
  const workbook = await renderQuestionnaireAnswersXlsx(result);

  return new Response(new Uint8Array(workbook), {
    headers: {
      "Content-Disposition": 'attachment; filename="questionnaire-answers.xlsx"',
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
