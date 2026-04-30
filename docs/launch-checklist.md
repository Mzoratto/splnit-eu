# Launch Checklist

Code-level readiness is tracked in the repository. The items below require dashboard access or vendor-side setup before production launch.

## Infrastructure

- Enable Neon point-in-time restore on the production branch.
- Configure daily Neon exports or snapshots to the production S3 backup bucket.
- Add BetterStack uptime checks for `https://splnit.eu/` and `https://splnit.eu/api/health`.
- Connect `status.splnit.eu` to the BetterStack status page.

## Security

- Enable Cloudflare WAF for `splnit.eu`.
- Rate limit `/api/scanner` to 30 requests/minute.
- Rate limit `/api/webhooks/*` to 50 requests/minute.
- Confirm Sentry source map uploads with `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in Vercel.

## Compliance

- Review `/soukromi`, `/cookies`, `/podminky`, and `/dpa` with counsel before launch.
- Confirm DPA coverage with Vercel, Neon, Clerk, Stripe, Resend, Loops, Upstash, Sentry, and Vercel Blob.
