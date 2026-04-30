"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getQuestionnaireComplianceContext } from "@/lib/db/queries/questionnaires";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { answerQuestionnaireWithClaude, hasClaudeConfig } from "@/lib/questionnaires/claude";
import { parseQuestionnaireText, truncateQuestionnaireText } from "@/lib/questionnaires/parser";
import { enforceQuestionnaireRateLimit } from "@/lib/questionnaires/rate-limit";
import type { QuestionnaireResult } from "@/lib/questionnaires/types";

export type QuestionnaireActionState = {
  error: string | null;
  rateLimit: {
    limit: number | null;
    remaining: number | null;
    resetAt: string | null;
  } | null;
  result: QuestionnaireResult | null;
};

const questionnaireSchema = z.object({
  questionnaire: z.string().trim().min(10).max(40_000),
});

const initialQuestionnaireState: QuestionnaireActionState = {
  error: null,
  rateLimit: null,
  result: null,
};

export async function answerQuestionnaireAction(
  _previousState: QuestionnaireActionState,
  formData: FormData,
): Promise<QuestionnaireActionState> {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return {
      ...initialQuestionnaireState,
      error: "Přihlášení a aktivní organizace jsou povinné.",
    };
  }

  const questionnaire = await getQuestionnaireInput(formData);
  const parsed = questionnaireSchema.safeParse({ questionnaire });

  if (!parsed.success) {
    return {
      ...initialQuestionnaireState,
      error: "Vložte text dotazníku nebo nahrajte textový soubor.",
    };
  }

  if (!hasClaudeConfig()) {
    return {
      ...initialQuestionnaireState,
      error: "ANTHROPIC_API_KEY není nastavený.",
    };
  }

  const questions = parseQuestionnaireText(parsed.data.questionnaire);

  if (questions.length === 0) {
    return {
      ...initialQuestionnaireState,
      error: "Nepodařilo se najít otázky v dotazníku.",
    };
  }

  const organisation = await getOrganisationByClerkOrgId(session.orgId);
  const rateLimit = await enforceQuestionnaireRateLimit({
    clerkOrgId: session.orgId,
    plan: organisation?.plan,
  });

  if (!rateLimit.allowed) {
    return {
      ...initialQuestionnaireState,
      error: `Měsíční limit ${rateLimit.limit} dotazníků je vyčerpaný.`,
      rateLimit,
    };
  }

  try {
    const context = await getQuestionnaireComplianceContext(session.orgId);
    const generated = await answerQuestionnaireWithClaude({
      context,
      questions,
    });

    return {
      error: null,
      rateLimit,
      result: {
        answers: generated.answers,
        generatedAt: new Date().toISOString(),
        model: generated.model,
        organisationName:
          context.organisation?.name ?? organisation?.name ?? "Organizace",
        questionCount: questions.length,
        summary: generated.summary,
      },
    };
  } catch (error) {
    return {
      ...initialQuestionnaireState,
      error:
        error instanceof Error
          ? error.message
          : "Generování odpovědí se nepodařilo.",
      rateLimit,
    };
  }
}

async function getQuestionnaireInput(formData: FormData) {
  const pasted = formData.get("questionnaire");
  const file = formData.get("file");
  const chunks: string[] = [];

  if (typeof pasted === "string") {
    chunks.push(pasted);
  }

  if (file instanceof File && file.size > 0) {
    chunks.push(await file.text());
  }

  return truncateQuestionnaireText(chunks.join("\n\n"));
}
