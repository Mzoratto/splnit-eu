import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import {
  answerQuestionnaireWithProvider,
  getQuestionnaireAiProviderStatus,
  hasQuestionnaireAiConfig,
} from "@/lib/questionnaires/provider";

loadEnvConfig(process.cwd());

const originalApiKey = process.env.OPENAI_API_KEY;
const originalEnabled = process.env.QUESTIONNAIRE_AI_ENABLED;
const originalProvider = process.env.QUESTIONNAIRE_AI_PROVIDER;

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  try {
    delete process.env.OPENAI_API_KEY;
    delete process.env.QUESTIONNAIRE_AI_ENABLED;
    delete process.env.QUESTIONNAIRE_AI_PROVIDER;

    assert.deepEqual(getQuestionnaireAiProviderStatus(), {
      configured: false,
      enabled: false,
      label: "OpenAI",
      providerConfigured: false,
      providerId: "openai",
      supported: true,
    });
    assert.equal(hasQuestionnaireAiConfig(), false);

    process.env.OPENAI_API_KEY = "test-key";
    assert.equal(hasQuestionnaireAiConfig(), false);
    assert.deepEqual(getQuestionnaireAiProviderStatus(), {
      configured: false,
      enabled: false,
      label: "OpenAI",
      providerConfigured: true,
      providerId: "openai",
      supported: true,
    });

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
      /Questionnaire AI is not enabled/,
    );

    process.env.QUESTIONNAIRE_AI_ENABLED = "true";
    assert.equal(hasQuestionnaireAiConfig(), true);
    assert.equal(getQuestionnaireAiProviderStatus().configured, true);

    process.env.QUESTIONNAIRE_AI_PROVIDER = "unsupported";
    assert.deepEqual(getQuestionnaireAiProviderStatus(), {
      configured: false,
      enabled: true,
      label: null,
      providerConfigured: false,
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

    console.log("Questionnaire provider config smoke passed.");
  } finally {
    restoreEnv("OPENAI_API_KEY", originalApiKey);
    restoreEnv("QUESTIONNAIRE_AI_ENABLED", originalEnabled);
    restoreEnv("QUESTIONNAIRE_AI_PROVIDER", originalProvider);
  }

  if (hasQuestionnaireAiConfig()) {
    const result = await answerQuestionnaireWithProvider({
      context: {
        controls: [
          {
            category: "Access control",
            controlId: "00000000-0000-0000-0000-000000000001",
            description: "Multi-factor authentication is required for privileged access.",
            key: "access.mfa",
            notes: "Workspace smoke fixture for OpenAI questionnaire generation.",
            status: "partial",
            title: "Multi-factor authentication",
            updatedAt: new Date().toISOString(),
          },
        ],
        evidence: [
          {
            controlId: "00000000-0000-0000-0000-000000000001",
            description: "Identity provider settings show MFA required for administrators.",
            evidenceId: "ev-openai-smoke-mfa",
            expiresAt: null,
            integrationRunId: null,
            status: "reviewed",
            title: "Admin MFA configuration summary",
            type: "configuration-summary",
            uploadedAt: new Date().toISOString(),
          },
        ],
        legalCitations: [],
        organisation: {
          name: "Splnit.eu smoke test workspace",
          plan: "internal-smoke",
        },
        policies: [
          {
            controls: ["access.mfa"],
            policyId: "policy-openai-smoke-access",
            status: "approved",
            title: "Access control policy",
            type: "access-control",
            updatedAt: new Date().toISOString(),
          },
        ],
      } as unknown as Parameters<typeof answerQuestionnaireWithProvider>[0]["context"],
      questions: ["Do you enforce MFA for administrator access?"],
    });

    assert.equal(result.answers.length, 1);
    assert.equal(result.answers[0]?.question, "Do you enforce MFA for administrator access?");
    assert.equal(result.answers[0]?.reviewStatus, "draft");
    assert.match(result.model, /./);
    console.log(`Questionnaire provider runtime smoke passed with model ${result.model}.`);
  } else {
    console.log("Questionnaire provider runtime smoke skipped: AI config is not enabled/configured.");
  }
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
