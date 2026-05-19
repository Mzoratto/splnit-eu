import { getRedis, hasRedisConfig } from "@/lib/redis/client";

const LOCK_TTL_SECONDS = 55 * 60;
const FIRST_RUN_ENQUEUE_LOCK_TTL_SECONDS = 24 * 60 * 60;

async function acquireRedisLock(input: {
  key: string;
  ttlSeconds: number;
}) {
  if (!hasRedisConfig()) {
    return {
      acquired: true,
      enabled: false,
      release: async () => {},
    };
  }

  const redis = getRedis();
  const acquired = await redis.set(input.key, new Date().toISOString(), {
    ex: input.ttlSeconds,
    nx: true,
  });

  return {
    acquired: acquired === "OK",
    enabled: true,
    release: async () => {
      await redis.del(input.key);
    },
  };
}

export async function acquireIntegrationRunLock(input: {
  clerkOrgId: string;
  provider: string;
}) {
  return acquireRedisLock({
    key: `integration-run:${input.clerkOrgId}:${input.provider}`,
    ttlSeconds: LOCK_TTL_SECONDS,
  });
}

export async function acquireIntegrationFirstRunEnqueueLock(input: {
  clerkOrgId: string;
  provider: string;
}) {
  return acquireRedisLock({
    key: `integration-first-run-enqueue:${input.clerkOrgId}:${input.provider}`,
    ttlSeconds: FIRST_RUN_ENQUEUE_LOCK_TTL_SECONDS,
  });
}
