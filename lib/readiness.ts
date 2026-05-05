import { getQuestionnaireAiProviderStatus } from "@/lib/questionnaires/provider";

type ReadinessLevel = "required" | "recommended";
type ReadinessStatus = "configured" | "missing";

type EnvCheck = {
  level: ReadinessLevel;
  name: string;
  getMissing?: () => string[];
  variables: string[];
};

export type ReadinessCheckResult = {
  configured: boolean;
  level: ReadinessLevel;
  missing: string[];
  name: string;
  status: ReadinessStatus;
};

const requiredChecks: EnvCheck[] = [
  {
    level: "required",
    name: "app",
    variables: ["NEXT_PUBLIC_APP_URL"],
  },
  {
    level: "required",
    name: "database",
    variables: ["DATABASE_URL"],
  },
  {
    level: "required",
    name: "auth",
    variables: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"],
    getMissing: () =>
      process.env.CLERK_WEBHOOK_SECRET || process.env.CLERK_WEBHOOK_SIGNING_SECRET
        ? []
        : ["CLERK_WEBHOOK_SECRET or CLERK_WEBHOOK_SIGNING_SECRET"],
  },
  {
    level: "required",
    name: "billing",
    variables: [
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "STRIPE_BUSINESS_ANNUAL_LOOKUP_KEY",
      "STRIPE_BUSINESS_MONTHLY_LOOKUP_KEY",
      "STRIPE_CONSULTANT_ANNUAL_LOOKUP_KEY",
      "STRIPE_CONSULTANT_MONTHLY_LOOKUP_KEY",
      "STRIPE_SECRET_KEY",
      "STRIPE_STARTER_ANNUAL_LOOKUP_KEY",
      "STRIPE_STARTER_MONTHLY_LOOKUP_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ],
  },
  {
    level: "required",
    name: "encryption",
    variables: ["ENCRYPTION_KEY"],
    getMissing: () => {
      const key = process.env.ENCRYPTION_KEY;
      const valid = Boolean(
        key &&
          /^[0-9a-f]{64}$/i.test(key) &&
          key !== "0000000000000000000000000000000000000000000000000000000000000000",
      );

      return valid ? [] : ["ENCRYPTION_KEY valid 64-character non-default hex"];
    },
  },
  {
    level: "required",
    name: "cron",
    variables: ["CRON_SECRET"],
  },
  {
    level: "required",
    name: "inngest",
    variables: ["INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY"],
  },
];

const recommendedChecks: EnvCheck[] = [
  {
    level: "recommended",
    name: "blob",
    variables: ["BLOB_READ_WRITE_TOKEN"],
  },
  {
    level: "recommended",
    name: "email",
    variables: ["RESEND_API_KEY", "RESEND_FROM"],
  },
  {
    level: "recommended",
    name: "redis",
    variables: ["UPSTASH_REDIS_REST_TOKEN", "UPSTASH_REDIS_REST_URL"],
  },
  {
    level: "recommended",
    name: "microsoft365",
    variables: ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"],
  },
  {
    level: "recommended",
    name: "github",
    variables: ["GITHUB_APP_ID", "GITHUB_APP_PRIVATE_KEY", "GITHUB_APP_SLUG"],
  },
  {
    level: "recommended",
    name: "aws",
    variables: ["AWS_ACCESS_KEY_ID", "AWS_DEFAULT_REGION", "AWS_SECRET_ACCESS_KEY"],
  },
  {
    level: "recommended",
    name: "questionnaires",
    variables: [],
    getMissing: () => {
      const status = getQuestionnaireAiProviderStatus();

      if (!status.supported) {
        return [
          `QUESTIONNAIRE_AI_PROVIDER supported value (currently ${status.providerId})`,
        ];
      }

      return status.configured ? [] : [`${status.label} credentials`];
    },
  },
  {
    level: "recommended",
    name: "marketing",
    variables: ["LOOPS_API_KEY", "LOOPS_NEWSLETTER_LIST_ID"],
  },
  {
    level: "recommended",
    name: "observability",
    variables: ["NEXT_PUBLIC_SENTRY_DSN", "SENTRY_DSN"],
  },
  {
    level: "recommended",
    name: "sentrySourceMaps",
    variables: ["SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"],
  },
];

function hasValue(name: string) {
  return Boolean(process.env[name]?.trim());
}

function evaluateCheck(check: EnvCheck): ReadinessCheckResult {
  const missing = [
    ...check.variables.filter((name) => !hasValue(name)),
    ...(check.getMissing?.() ?? []),
  ];
  const uniqueMissing = Array.from(new Set(missing));
  const configured = uniqueMissing.length === 0;

  return {
    configured,
    level: check.level,
    missing: configured ? [] : uniqueMissing,
    name: check.name,
    status: configured ? "configured" : "missing",
  };
}

export function getReadinessReport() {
  const checks = [...requiredChecks, ...recommendedChecks].map(evaluateCheck);
  const required = checks.filter((check) => check.level === "required");
  const recommended = checks.filter((check) => check.level === "recommended");
  const ready = required.every((check) => check.configured);

  return {
    checks,
    ready,
    requiredConfigured: required.filter((check) => check.configured).length,
    requiredTotal: required.length,
    recommendedConfigured: recommended.filter((check) => check.configured).length,
    recommendedTotal: recommended.length,
  };
}
