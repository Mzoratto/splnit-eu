"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import {
  createGeneratedArtifact,
  createQuestionnaireAnswerEvidence,
  getGeneratedArtifactForOrg,
  updateGeneratedArtifactContentForOrg,
} from "@/lib/db/queries/generated-artifacts";
import { getQuestionnaireComplianceContext } from "@/lib/db/queries/questionnaires";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  buildQuestionnaireArtifactContent,
  buildQuestionnaireArtifactTitle,
  QUESTIONNAIRE_ARTIFACT_KIND,
} from "@/lib/questionnaires/artifacts";
import {
  buildUnsupportedQuestionnaireAnswers,
  hasQuestionnaireSupportContext,
} from "@/lib/questionnaires/fallback";
import {
  parseQuestionnaireText,
  truncateQuestionnaireText,
} from "@/lib/questionnaires/parser";
import {
  answerQuestionnaireWithProvider,
  hasQuestionnaireAiConfig,
} from "@/lib/questionnaires/provider";
import {
  buildQuestionnaireControlMapping,
  getQuestionnaireAnswerConfidence,
  type QuestionnaireControlMapping,
} from "@/lib/questionnaires/control-mapping";
import { sanitizeQuestionnaireAnswers } from "@/lib/questionnaires/citation-guard";
import { applyQuestionnaireAnswerReview } from "@/lib/questionnaires/review";
import { enforceQuestionnaireRateLimit } from "@/lib/questionnaires/rate-limit";
import { QuestionnaireResultSchema, type QuestionnaireResult } from "@/lib/questionnaires/types";

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

const reviewAnswerSchema = z.object({
  answer: z.string().trim().min(1).max(20_000).optional(),
  answerIndex: z.coerce.number().int().min(0),
  artifactId: z.string().uuid(),
  notes: z.string().max(4_000).optional(),
  reviewStatus: z.enum(["draft", "approved", "flagged"]),
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
      const result = await persistQuestionnaireResult({
        clerkOrgId: session.orgId,
        createdBy: session.userId,
        result: {
          answers: fallback.answers,
          artifactId: null,
          generatedAt: new Date().toISOString(),
          model: fallback.model,
          organisationName:
            context.organisation?.name ?? organisation?.name ?? copy.organisationFallback,
          questionCount: questions.length,
          summary: fallback.summary,
        },
      });

      return {
        error: null,
        rateLimit,
        result,
      };
    }

    if (!hasQuestionnaireAiConfig()) {
      return {
        ...initialQuestionnaireState,
        error: copy.missingConfig,
        rateLimit,
      };
    }

    const controlMapping = buildQuestionnaireControlMapping({
      controls: context.controls,
      questions,
    });
    const mappingByQuestion = new Map(
      controlMapping.map((mapping) => [mapping.question, mapping]),
    );

    const generated = await answerQuestionnaireWithProvider({
      context,
      questions,
    });
    const sanitizedAnswers = sanitizeQuestionnaireAnswers({
      answers: generated.answers,
      context,
    });
    const controlKeysById = new Map(
      context.controls.map((control) => [control.controlId, control.controlKey]),
    );
    const allowedControlIds = new Set(controlKeysById.keys());
    const groundedAnswers = sanitizedAnswers.map((answer) => {
      const mapping = mappingByQuestion.get(answer.question);
      const providerControlIds = answer.controlIds.filter((controlId) =>
        allowedControlIds.has(controlId),
      );
      const controlIds =
        providerControlIds.length > 0
          ? providerControlIds
          : (mapping?.controlIds ?? []);
      const controlKeys = controlIds
        .map((controlId) => controlKeysById.get(controlId))
        .filter((controlKey): controlKey is string => Boolean(controlKey));
      const evidenceCount = answer.evidenceRefs.length;
      const policyCount = answer.policyRefs.length;

      return {
        ...answer,
        confidence: getQuestionnaireAnswerConfidence({
          evidenceCount,
          mappedControlCount: controlIds.length,
          policyCount,
        }),
        controlIds,
        controlKeys,
        notes: buildQuestionnaireAnswerReviewNote({
          evidenceCount,
          mapping,
          note: answer.notes,
          policyCount,
        }),
      };
    });

    const result = await persistQuestionnaireResult({
      clerkOrgId: session.orgId,
      createdBy: session.userId,
      result: {
        answers: groundedAnswers,
        artifactId: null,
        generatedAt: new Date().toISOString(),
        model: generated.model,
        organisationName:
          context.organisation?.name ?? organisation?.name ?? copy.organisationFallback,
        questionCount: questions.length,
        summary: generated.summary,
      },
    });

    return {
      error: null,
      rateLimit,
      result,
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

export async function reviewQuestionnaireAnswerAction(formData: FormData) {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    throw new Error("Authentication and an active organisation are required.");
  }

  const parsed = reviewAnswerSchema.safeParse({
    answer: formData.get("answer"),
    answerIndex: formData.get("answerIndex"),
    artifactId: formData.get("artifactId"),
    notes: formData.get("notes"),
    reviewStatus: formData.get("reviewStatus"),
  });

  if (!parsed.success) {
    throw new Error("Invalid questionnaire review input.");
  }

  const artifact = await getGeneratedArtifactForOrg({
    artifactId: parsed.data.artifactId,
    clerkOrgId: session.orgId,
    kind: QUESTIONNAIRE_ARTIFACT_KIND,
  });

  if (!artifact) {
    throw new Error("Questionnaire artifact was not found for this organisation.");
  }

  const content = artifact.content as { result?: unknown };
  const result = QuestionnaireResultSchema.parse(content.result);
  const updatedResult = applyQuestionnaireAnswerReview(result, {
    answer: parsed.data.answer,
    answerIndex: parsed.data.answerIndex,
    notes: parsed.data.notes,
    reviewStatus: parsed.data.reviewStatus,
  });

  const updated = await updateGeneratedArtifactContentForOrg({
    artifactId: parsed.data.artifactId,
    clerkOrgId: session.orgId,
    content: buildQuestionnaireArtifactContent(updatedResult),
    kind: QUESTIONNAIRE_ARTIFACT_KIND,
  });

  if (!updated) {
    throw new Error("Questionnaire artifact review update failed.");
  }

  revalidatePath("/questionnaires");
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

async function persistQuestionnaireResult(input: {
  clerkOrgId: string;
  createdBy: string;
  result: QuestionnaireResult;
}) {
  const artifact = await createGeneratedArtifact({
    clerkOrgId: input.clerkOrgId,
    content: buildQuestionnaireArtifactContent(input.result),
    createdBy: input.createdBy,
    kind: QUESTIONNAIRE_ARTIFACT_KIND,
    model: input.result.model,
    title: buildQuestionnaireArtifactTitle(input.result),
  });

  const result = {
    ...input.result,
    artifactId: artifact.id,
  };

  await createQuestionnaireAnswerEvidence({
    answers: result.answers,
    artifactId: artifact.id,
    clerkOrgId: input.clerkOrgId,
    createdBy: input.createdBy,
  });

  return result;
}

function buildQuestionnaireAnswerReviewNote(input: {
  evidenceCount: number;
  mapping?: QuestionnaireControlMapping;
  note: string;
  policyCount: number;
}) {
  const additions: string[] = [
    "AI-generated draft requiring human review before auditor-facing or vendor-facing use.",
  ];

  if (!input.mapping || input.mapping.controlIds.length === 0) {
    additions.push(
      "No mapped control was available, so this answer has no evidence-home in the control structure.",
    );
  } else if (input.evidenceCount === 0 && input.policyCount === 0) {
    additions.push(
      "Mapped controls had no supporting evidence or policy reference in the reviewed workspace context.",
    );
  }

  return [input.note, ...additions].filter(Boolean).join(" ");
}
