# Launch Checklist

Code-level readiness is tracked in the repository. The items below require dashboard access or vendor-side setup before production launch.

## Infrastructure

- Enable Neon point-in-time restore on the production branch.
- Configure daily Neon exports or snapshots to the production S3 backup bucket.
- Add BetterStack uptime checks for `https://splnit.eu/` and `https://splnit.eu/api/health`.
- Check `https://splnit.eu/api/readiness` before launch; it should return HTTP 200 once required production environment groups are configured.
- Connect `status.splnit.eu` to the BetterStack status page.

## Security

- Enable Cloudflare WAF for `splnit.eu`.
- Rate limit `/api/webhooks/*` to 50 requests/minute.
- Add a 30 requests/minute limit for `/api/scanner` when a scanner endpoint exists.
- Set `CRON_SECRET` in Vercel production; cron endpoints fail closed without it.
- Confirm Sentry source map uploads with `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in Vercel.

## Compliance

- Review `/soukromi`, `/cookies`, `/podminky`, and `/dpa` with counsel before launch.
- Use `docs/legal-review.md` as the counsel handoff checklist and close every item there before production launch.
- Confirm DPA coverage with Vercel, Neon, Clerk, Stripe, Resend, Loops, Upstash, Sentry, Vercel Blob, Inngest, PostHog, and the configured Questionnaire AI provider (Anthropic only today) where enabled.
- Enable `QUESTIONNAIRE_AI_ENABLED=true` only after AI provider terms, opt-in wording, and subprocessor notice are approved.
- Review `docs/offboarding-runbook.md` with counsel and the support owner before accepting production customers.
- Close the launch blockers in `docs/subprocessors.md`, `docs/retention-policy.md`, and `docs/data-processing-map.md`.
