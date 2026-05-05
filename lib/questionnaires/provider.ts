import { anthropicQuestionnaireProvider } from "@/lib/questionnaires/claude";
import type {
  QuestionnaireAiInput,
  QuestionnaireAiOutput,
  QuestionnaireAiProvider,
} from "@/lib/questionnaires/provider-types";

const QUESTIONNAIRE_AI_PROVIDERS = [anthropicQuestionnaireProvider] as const;
const DEFAULT_QUESTIONNAIRE_AI_PROVIDER = "anthropic";

export function getQuestionnaireAiProviderId() {
  return (
    process.env.QUESTIONNAIRE_AI_PROVIDER?.trim() ||
    DEFAULT_QUESTIONNAIRE_AI_PROVIDER
  );
}

export function getQuestionnaireAiProvider(): QuestionnaireAiProvider | null {
  const providerId = getQuestionnaireAiProviderId();

  return (
    QUESTIONNAIRE_AI_PROVIDERS.find((provider) => provider.id === providerId) ??
    null
  );
}

export function hasQuestionnaireAiConfig() {
  return Boolean(getQuestionnaireAiProvider()?.isConfigured());
}

export function getQuestionnaireAiProviderStatus() {
  const providerId = getQuestionnaireAiProviderId();
  const provider = getQuestionnaireAiProvider();

  return {
    configured: Boolean(provider?.isConfigured()),
    label: provider?.label ?? null,
    providerId,
    supported: Boolean(provider),
  };
}

export async function answerQuestionnaireWithProvider(
  input: QuestionnaireAiInput,
): Promise<QuestionnaireAiOutput> {
  const provider = getQuestionnaireAiProvider();

  if (!provider) {
    throw new Error(
      `Unsupported questionnaire AI provider: ${getQuestionnaireAiProviderId()}`,
    );
  }

  if (!provider.isConfigured()) {
    throw new Error(
      `Questionnaire AI provider is not configured: ${provider.label}`,
    );
  }

  return provider.answer(input);
}
