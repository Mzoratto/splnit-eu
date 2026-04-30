import { hasRedisConfig, getRedis } from "@/lib/redis/client";
import { normalizePlanKey } from "@/lib/stripe/plans";

const STARTER_MONTHLY_LIMIT = 5;

export type QuestionnaireRateLimit = {
  allowed: boolean;
  limit: number | null;
  remaining: number | null;
  resetAt: string | null;
};

export async function enforceQuestionnaireRateLimit(input: {
  clerkOrgId: string;
  plan: string | null | undefined;
}): Promise<QuestionnaireRateLimit> {
  const plan = normalizePlanKey(input.plan);

  if (plan === "business" || plan === "consultant") {
    return {
      allowed: true,
      limit: null,
      remaining: null,
      resetAt: null,
    };
  }

  const resetAt = getNextMonthStart();

  if (!hasRedisConfig()) {
    return {
      allowed: true,
      limit: STARTER_MONTHLY_LIMIT,
      remaining: null,
      resetAt: resetAt.toISOString(),
    };
  }

  const redis = getRedis();
  const key = `questionnaire-ai:${input.clerkOrgId}:${getMonthKey(new Date())}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, Math.ceil((resetAt.getTime() - Date.now()) / 1000));
  }

  return {
    allowed: count <= STARTER_MONTHLY_LIMIT,
    limit: STARTER_MONTHLY_LIMIT,
    remaining: Math.max(0, STARTER_MONTHLY_LIMIT - count),
    resetAt: resetAt.toISOString(),
  };
}

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getNextMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}
