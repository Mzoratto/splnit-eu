import * as Sentry from "@sentry/nextjs";
import {
  scrubSentryEvent,
  scrubSentryTransaction,
  sentryPiiPolicy,
} from "@/lib/observability/sentry-scrubber";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: sentryPiiPolicy.sendDefaultPii,
  beforeSend: scrubSentryEvent,
  beforeSendTransaction: scrubSentryTransaction,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.02,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  enabled: Boolean(dsn),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
