import assert from "node:assert/strict";
import {
  answerQuestionnaireWithProvider,
  getQuestionnaireAiProviderStatus,
  hasQuestionnaireAiConfig,
} from "@/lib/questionnaires/provider";

const originalApiKey = process.env.ANTHROPIC_API_KEY;
const originalProvider = process.env.QUESTIONNAIRE_AI_PROVIDER;

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  try {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.QUESTIONNAIRE_AI_PROVIDER;

    assert.deepEqual(getQuestionnaireAiProviderStatus(), {
      configured: false,
      label: "Anthropic Claude",
      providerId: "anthropic",
      supported: true,
    });
    assert.equal(hasQuestionnaireAiConfig(), false);

    process.env.ANTHROPIC_API_KEY = "test-key";
    assert.equal(hasQuestionnaireAiConfig(), true);
    assert.equal(getQuestionnaireAiProviderStatus().configured, true);

    process.env.QUESTIONNAIRE_AI_PROVIDER = "unsupported";
    assert.deepEqual(getQuestionnaireAiProviderStatus(), {
      configured: false,
      label: null,
      providerId: "unsupported",
      supported: false,
    });
    assert.equal(hasQuestionnaireAiConfig(), false);

    await assert.rejects(
      () =>
        answerQuestionnaireWithProvider({
          context: {
            controls: [],
            evidence: [],
            legalCitations: [],
            organisation: null,
            policies: [],
          } as unknown as Parameters<
            typeof answerQuestionnaireWithProvider
          >[0]["context"],
          questions: ["Do you enforce MFA?"],
        }),
      /Unsupported questionnaire AI provider/,
    );

    console.log("Questionnaire provider smoke passed.");
  } finally {
    restoreEnv("ANTHROPIC_API_KEY", originalApiKey);
    restoreEnv("QUESTIONNAIRE_AI_PROVIDER", originalProvider);
  }
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
