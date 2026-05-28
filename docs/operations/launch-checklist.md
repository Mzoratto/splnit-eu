# Launch Checklist

Code-level readiness is tracked in the repository. The items below require dashboard access or vendor-side setup before production launch.

## Launch stages

Broad self-serve remains gated until every P0 legal, security, billing, backup, monitoring, and production-smoke item below is closed with evidence. Enrollment advances in this order:

1. **Internal smoke org** — repository and production-write smokes may create and clean up controlled Splnit-owned test data only.
2. **Friendly design partner** — one owner-approved Czech B2B organisation, manually onboarded, with explicit early-access expectations.
3. **Small paid Czech B2B group** — limited self-serve billing after counsel-approved legal pages, Stripe checkout/portal proof, support escalation, and offboarding are complete.
4. **Broad self-serve** — no manual approval requirement; allowed only after the final launch scorecard records every required gate green or an explicitly accepted P1 limitation.

## Claim boundary matrix

| Area | Public claim status | Evidence required before strengthening the claim |
| --- | --- | --- |
| Core NIS2/GDPR/ISO workflow | Supported for controlled Czech B2B onboarding where templates/sources exist. | Passing deterministic E2E, product-safety smokes, and production tenant smoke cleanup evidence. |
| Czech legal/commercial terms | Working baseline only; not counsel-approved until closeout is complete. | Counsel approval for `/soukromi`, `/cookies`, `/podminky`, and `/dpa`, including VAT/DIČ, DPO/privacy contact, B2B eligibility, cancellation/refund, liability, support, incident notice, and special-category data positions. |
| Stripe billing | Runtime entitlement/webhook smokes exist; real browser Checkout and customer portal are not yet launch proof. | Browser-backed Stripe test-mode checkout, webhook entitlement update, plan-gate verification, portal return, and failed/cancel/downgrade coverage. |
| Uptime/status/SLA | Public status is informational early-access status, not an SLA or historical uptime report. | BetterStack or equivalent monitors for `/`, `/api/health`, `/api/readiness`, connected status page, alert routing, and legal/support wording approval. |
| AI questionnaire assistance | Controlled/approved customers only. Do not claim broad AI availability or retention posture. | OpenAI DPA/subprocessor/transfer review, retention/training settings, customer opt-in notice, and human-review wording approval. |
| Microsoft 365, AWS, GitHub, Hetzner, OVHcloud connectors | Claim only as available/manual/early-access unless provider-configured runtime smoke evidence exists. | Passing provider-specific smoke with approved credentials, permission-failure UX, encrypted token storage, and disconnect/revoke proof. |
| Czech ERP workspaces | Czech ERP workspace configuration is a moat; do not imply live automated ERP ingestion unless smoked. | Workspace config smoke for Pohoda, Money S3, Helios, ABRA Flexi and any connector-specific live proof before automation claims. |
| Security controls | Claim only observed controls: headers, auth, encryption, signature verification, and documented in-progress work. | Dependency audit policy, distributed rate limits, WAF/project firewall, Sentry source maps, and incident/rollback/support runbooks. |
| Backups/restore | Do not claim restore capability until proven. | Neon PITR/export confirmation and restore drill to a temporary branch with cleanup evidence. |
| Customer proof/certification | No customer logos/testimonials, uptime percentages, certifications, or advisor approvals unless real evidence exists. | Written permission/evidence and repository documentation linking the public claim to approved proof. |

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
- Use `docs/legal/legal-review.md` as the counsel handoff checklist and close every item there before production launch.
- Confirm DPA coverage with Vercel, Neon, Clerk, Stripe, Resend, Loops, Upstash, Sentry, Vercel Blob, Inngest, PostHog, and OpenAI where enabled.
- Keep `QUESTIONNAIRE_AI_ENABLED=true` restricted to controlled/approved customer use until OpenAI DPA/data-retention controls, customer opt-in notice, human-review wording, and subprocessor notice are approved.
- Review `docs/operations/offboarding-runbook.md` with counsel and the support owner before accepting production customers.
- Close the launch blockers in `docs/legal/subprocessors.md`, `docs/legal/retention-policy.md`, and `docs/legal/data-processing-map.md`.
