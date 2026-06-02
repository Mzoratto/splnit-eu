import assert from "node:assert/strict";
import type { Event } from "@sentry/nextjs";
import { scrubSentryEvent, sentryPiiPolicy } from "../lib/observability/sentry-scrubber";

const event = {
  message:
    "Provider failed with Authorization=Bearer live_token_123 and callback https://example.test/callback?token=secret-token&ok=true",
  request: {
    url: "https://splnit.test/api?access_token=secret-access&safe=1",
    cookies: {
      session: "secret-cookie",
    },
    headers: {
      Authorization: "Bearer secret-bearer-token",
      "X-Request-ID": "req_123",
    },
  },
  contexts: {
    connector: {
      apiKey: "provider-api-key",
      accessToken: "camel-access-token",
      refreshToken: "camel-refresh-token",
      idToken: "camel-id-token",
      sessionToken: "camel-session-token",
      authToken: "camel-auth-token",
      secretKey: "camel-secret-key",
      nested: {
        refresh_token: "refresh-token",
        publicLabel: "Hetzner workspace",
      },
    },
  },
  breadcrumbs: [
    {
      message: "POST /callback password=super-secret",
      data: {
        database_url: "postgres://user:password@db.example/splnit",
        safe: "kept",
      },
    },
  ],
};

const scrubbed = scrubSentryEvent(event as Event);
assert.ok(scrubbed, "scrubber must return an event");

const serialized = JSON.stringify(scrubbed);
for (const secret of [
  "live_token_123",
  "secret-token",
  "secret-access",
  "secret-cookie",
  "secret-bearer-token",
  "provider-api-key",
  "camel-access-token",
  "camel-refresh-token",
  "camel-id-token",
  "camel-session-token",
  "camel-auth-token",
  "camel-secret-key",
  "refresh-token",
  "super-secret",
  "postgres://user:password@db.example/splnit",
]) {
  assert.ok(!serialized.includes(secret), `scrubbed event must not contain ${secret}`);
}

assert.ok(serialized.includes(sentryPiiPolicy.redactedValue), "scrubbed event should contain the redaction marker");
assert.ok(serialized.includes("Hetzner workspace"), "non-sensitive context should be preserved");
assert.ok(serialized.includes("req_123"), "non-sensitive request metadata should be preserved");
assert.equal(sentryPiiPolicy.sendDefaultPii, false, "Sentry default PII must stay disabled");

console.log("Sentry scrubbing smoke passed.");
