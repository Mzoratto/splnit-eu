import { hasRedisConfig, getRedis } from "@/lib/redis/client";

export function getClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return requestHeaders.get("x-real-ip") ?? "unknown";
}

/**
 * Fixed-window rate limit keyed by client IP. Fails open when Redis is not
 * configured, matching the questionnaire AI limiter behaviour.
 */
export async function enforceIpRateLimit(input: {
  ip: string;
  limit: number;
  scope: string;
  windowSeconds: number;
}): Promise<{ allowed: boolean }> {
  if (!hasRedisConfig()) {
    return { allowed: true };
  }

  const windowBucket = Math.floor(Date.now() / (input.windowSeconds * 1000));
  const key = `rate:${input.scope}:${input.ip}:${windowBucket}`;
  const redis = getRedis();
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, input.windowSeconds);
  }

  return { allowed: count <= input.limit };
}
