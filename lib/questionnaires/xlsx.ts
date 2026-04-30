import writeXlsxFile from "write-excel-file/node";
import type { QuestionnaireResult } from "@/lib/questionnaires/types";

export async function renderQuestionnaireAnswersXlsx(
  result: QuestionnaireResult,
) {
  const rows = [
    ["Question", "Answer", "Confidence", "Evidence refs", "Policy refs", "Notes"],
    ...result.answers.map((answer) => [
      answer.question,
      answer.answer,
      answer.confidence,
      answer.evidenceRefs.join(", "),
      answer.policyRefs.join(", "),
      answer.notes,
    ]),
  ];

  return writeXlsxFile(rows, {
    columns: [
      { width: 44 },
      { width: 80 },
      { width: 14 },
      { width: 32 },
      { width: 32 },
      { width: 48 },
    ],
    sheet: "Answers",
  }).toBuffer();
}
