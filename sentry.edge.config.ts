import * as Sentry from "@sentry/nextjs";

const sentryDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,
  beforeSend(event) {
    const headers = event.request?.headers;

    if (headers) {
      delete headers.authorization;
      delete headers.cookie;
      delete headers["x-clerk-auth-token"];
      delete headers["x-clerk-session-token"];
    }

    return event;
  },
});
