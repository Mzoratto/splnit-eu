"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { getQuestionnaireComplianceContext } from "@/lib/db/queries/questionnaires";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  answerQuestionnaireWithClaude,
  hasClaudeConfig,
} from "@/lib/questionnaires/claude";
import {
  buildUnsupportedQuestionnaireAnswers,
  hasQuestionnaireSupportContext,
} from "@/lib/questionnaires/fallback";
import {
  parseQuestionnaireText,
  truncateQuestionnaireText,
} from "@/lib/questionnaires/parser";
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

function getActionLocale(formData: FormData): Locale {
  const locale = formData.get("locale");
  return normalizeLocale(typeof locale === "string" ? locale : null) ?? "cs-CZ";
}

export async function answerQuestionnaireAction(
  _previousState: QuestionnaireActionState,
  formData: FormData,
): Promise<QuestionnaireActionState> {
  const locale = getActionLocale(formData);
  const pageCopy = getMessagesForLocale(locale).questionnairePage;
  const copy = pageCopy.actionErrors;
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return {
      ...initialQuestionnaireState,
      error: copy.authRequired,
    };
  }

  const questionnaire = await getQuestionnaireInput(formData);
  const parsed = questionnaireSchema.safeParse({ questionnaire });

  if (!parsed.success) {
    return {
      ...initialQuestionnaireState,
      error: copy.invalidInput,
    };
  }

  const questions = parseQuestionnaireText(parsed.data.questionnaire);

  if (questions.length === 0) {
    return {
      ...initialQuestionnaireState,
      error: copy.noQuestions,
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
      error: copy.rateLimit.replace("{limit}", String(rateLimit.limit)),
      rateLimit,
    };
  }

  try {
    const context = await getQuestionnaireComplianceContext(session.orgId);

    if (!hasQuestionnaireSupportContext(context)) {
      const fallback = buildUnsupportedQuestionnaireAnswers({
        copy: pageCopy.unsupported,
        questions,
      });

      return {
        error: null,
        rateLimit,
        result: {
          answers: fallback.answers,
          generatedAt: new Date().toISOString(),
          model: fallback.model,
          organisationName:
            context.organisation?.name ?? organisation?.name ?? copy.organisationFallback,
          questionCount: questions.length,
          summary: fallback.summary,
        },
      };
    }

    if (!hasClaudeConfig()) {
      return {
        ...initialQuestionnaireState,
        error: copy.missingConfig,
        rateLimit,
      };
    }

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
          context.organisation?.name ?? organisation?.name ?? copy.organisationFallback,
        questionCount: questions.length,
        summary: generated.summary,
      },
    };
  } catch (error) {
    console.error("Questionnaire answer generation failed", error);

    return {
      ...initialQuestionnaireState,
      error: copy.generationFailed,
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
