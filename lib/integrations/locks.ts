import { getRedis, hasRedisConfig } from "@/lib/redis/client";

const LOCK_TTL_SECONDS = 55 * 60;

export async function acquireIntegrationRunLock(input: {
  clerkOrgId: string;
  provider: string;
}) {
  if (!hasRedisConfig()) {
    return {
      acquired: true,
      enabled: false,
      release: async () => {},
    };
  }

  const redis = getRedis();
  const key = `integration-run:${input.clerkOrgId}:${input.provider}`;
  const acquired = await redis.set(key, new Date().toISOString(), {
    ex: LOCK_TTL_SECONDS,
    nx: true,
  });

  return {
    acquired: acquired === "OK",
    enabled: true,
    release: async () => {
      await redis.del(key);
    },
  };
}
