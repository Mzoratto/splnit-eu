# Final Czech-First Legal Review Checklist

Last updated: 2026-05-14

Status: internal counsel/business-owner closeout checklist before updating public legal pages. This is not legal advice, a signed DPA annex, or approval to publish final customer legal documents.

## Review Position

Ready for Czech-first legal review as engineering drafts and counsel handoff material: yes.

Ready to publish final public legal pages or use as signed customer terms: no.

Reason: the public legal copy still intentionally contains draft/operator-completion language, and the internal annexes still list owner/counsel decisions that must be closed before publication.

## Sources Checked For This Checklist

Public legal copy source, intentionally not edited in this pass:

- `lib/legal/legal-page-copy.ts`
  - `/soukromi` privacy copy
  - `/cookies` cookie copy
  - `/dpa` DPA copy
  - `/podminky` terms copy
  - locales: `cs-CZ`, `en-EU`, `it-IT`

Counsel handoff/supporting docs:

- `docs/legal-review.md`
- `docs/subprocessors.md`
- `docs/retention-policy.md`
- `docs/data-processing-map.md`
- `docs/offboarding-runbook.md`
- `docs/audit-log-export-sop.md`
- `docs/ops/questionnaire-ai.md`
- `docs/questionnaire-flow-audit.md`
- `docs/launch-checklist.md`

Automated copy checks run during the closeout work:

- locale JSON key counts match across `cs-CZ`, `en-EU`, and `it-IT`.
- locale JSON placeholder sets match across `cs-CZ`, `en-EU`, and `it-IT`.
- public message/legal copy does not contain `Splnit Technology`, `s.r.o.`, `TBD`, `FIXME`, `Lorem`, or `to be confirmed`.
- `lib/legal/legal-page-copy.ts` still contains intentional draft language requiring final operator identification before production launch.

## Czech-First Publication Gate

Do not update or publish final public legal pages until all P0 items below are closed.

Public page update order after approval:

1. Update Czech (`cs-CZ`) legal pages first as the source-of-truth market copy.
2. Update English-EU (`en-EU`) to match the approved Czech legal position without strengthening claims.
3. Update Italian (`it-IT`) only as a localized layer unless Italian counsel/advisor approves jurisdiction-specific changes.
4. Re-run copy hygiene and locale placeholder checks.
5. Browser-check `/soukromi`, `/cookies`, `/podminky`, and `/dpa` in Czech before publication/deploy.

## P0 - Must Close Before Public Legal Page Updates

| Area | Current evidence/status | Required owner/counsel decision | Public-page impact |
| --- | --- | --- | --- |
| Operator identity | Public legal copy describes the operator as a Czech sole trader/OSVČ but still says final name, IČO, ARES link, and address must be completed before production launch. | Confirm exact legal name, IČO, ARES URL, registered address, VAT status if applicable, privacy/support contact, and contracting identity. | Replace draft operator-completion wording in `/soukromi`, `/dpa`, and `/podminky`. |
| DPO / privacy contact | `docs/legal-review.md` still requires a DPO decision. | Decide whether a DPO is required, voluntarily appointed, or not appointed; confirm contact wording. | Add final DPO/contact wording to privacy and DPA pages. |
| Production subprocessors | `docs/subprocessors.md` has concrete evidence links and production facts, but enabled vendors remain `owner check`, `owner + counsel check`, or `counsel check`, not `approved`. | Approve or replace evidence for Vercel/Blob, Neon, Clerk, Stripe, Resend, Inngest, and OpenAI; confirm transfer mechanisms and subprocessor-change notice handling. | Publish a short customer-readable active subprocessor list; do not copy internal env names, branch IDs, or security details. |
| Neon backups/PITR | Neon production branch/region/history retention are confirmed, but interpretation of `history_retention_seconds=86400` and separate backup commitments remains open. | Confirm PITR/backup retention, backup/storage location, restore commitment, and deletion/backups effect. | Finalize retention and DPA backup wording. |
| Vercel logs/analytics/Speed Insights retention | Live consent-gated Web Analytics and Speed Insights collection endpoints returned HTTP 200, but account-level runtime log/analytics/speed retention/export settings still need confirmation. | Confirm Vercel runtime log retention, analytics retention/export windows, Speed Insights retention/export windows, and whether public cookie wording fully matches the enabled setup. | Update `/cookies`, `/soukromi`, and subprocessor wording for optional analytics. |
| OpenAI questionnaire AI | Production env/readiness confirms OpenAI enabled; internal docs now restrict broad use pending terms/notice approval. OpenAI policy URLs returned HTTP 403 from this environment and require browser/account verification. | Confirm OpenAI DPA/business terms, API data retention, training/use-of-inputs settings, support/log retention, subprocessors, transfer mechanism, and customer opt-in/human-review wording. | Add/adjust privacy, DPA, and product notice wording before customer use beyond controlled/approved accounts. |
| Inngest event retention/DPA | Security/privacy docs are linked; public DPA and event-retention docs were not found. | Confirm signed/account DPA, processing region, event retention, payload minimisation, and transfer mechanism. | Finalize active subprocessor and retention wording. |
| Clerk, Stripe, Resend account terms/retention | Public evidence links are attached, but account/product retention and role details remain open. | Confirm Clerk processing/log/session retention; Stripe role split, tax/invoice retention, refunds/cancellation terms; Resend sending region, log/suppression/bounce retention. | Finalize privacy, DPA, terms, and subprocessor list. |
| Terms commercial terms | `docs/legal-review.md` still flags liability cap, SLA, refund/cancellation, governing law, jurisdiction, and consumer/business scope. | Decide Czech-first B2B contracting position, governing law/jurisdiction, cancellation/refund handling, liability cap, SLA/support commitments, and consumer exclusion if intended. | Finalize `/podminky`; do not publish vague draft terms as final customer contract. |
| Special-category evidence policy | Legal review still asks whether customer-uploaded evidence may include special categories of personal data. | Decide whether to prohibit special-category data in uploads, require customer responsibility controls, or support it under additional terms. | Add acceptable-use/privacy/DPA restrictions and product notices if needed. |
| Incident/support timelines | Legal review still flags notification commitments and support timelines. | Confirm incident-notification promise, support route, severity handling, and whether any SLA exists. | Update privacy/DPA/terms and support wording. |

## P1 - Should Close Before First Paid Czech Customer

| Area | Current evidence/status | Closeout needed |
| --- | --- | --- |
| Offboarding/deletion runbook | `docs/offboarding-runbook.md` exists and maps export/deletion/residual vendor tasks; AI residual vendor wording is aligned to the current OpenAI provider. | Have counsel/support owner approve the process, including residual vendor-retention steps. |
| Audit log export SOP | `docs/audit-log-export-sop.md` exists and covers pagination and support access constraints. | Confirm support-access policy, retention of exported CSVs, and evidence handling for customer requests. |
| Public disabled-vendor wording | Loops, Upstash, Sentry, PostHog, Anthropic, Cloudflare, BetterStack, and external backup storage are not active production subprocessors unless enabled later. | Ensure public legal pages do not describe disabled vendors as active production processing. Use conditional wording only if counsel approves. |
| Italy-specific policy templates | Italian policy template readiness remains blocked until human/legal review promotes draft templates. | Keep Italy as localized/secondary legal layer until advisor decisions are recorded. |
| Czech legal route smoke | Copy hygiene checks pass, but final public legal routes should be browser-checked after approved edits. | After edits, verify the actual Czech pages render approved text and no draft wording remains. |

## Sales-Safe Status For Counsel/Owner

Use this wording internally or in owner-facing notes:

- The Czech-first legal packet is ready for review as engineering/counsel draft material.
- It is not ready to publish as final customer legal terms.
- The main blocker is not missing document structure; it is final business/legal decisions and account-level vendor confirmations.
- Public pages should stay unchanged until the P0 decisions are closed.

Do not claim:

- legal approval;
- final DPA annex status;
- guaranteed EU-only processing;
- certifications, audit status, or customer proof;
- final AI data-retention or vendor transfer terms;
- final operator identity until the real OSVČ details are inserted and approved.

## Counsel Review Packet

Recommended handoff bundle:

1. `lib/legal/legal-page-copy.ts` - current public legal draft copy for Czech/English/Italian.
2. `docs/legal-review.md` - original counsel handoff checklist.
3. `docs/final-czech-legal-review-checklist.md` - final Czech-first publication gate and P0/P1 blockers.
4. `docs/subprocessors.md` - production vendor facts, evidence links, and remaining DPA/retention gaps.
5. `docs/data-processing-map.md` - working processing map / Article 30 input.
6. `docs/retention-policy.md` - proposed retention schedule and open retention decisions.
7. `docs/offboarding-runbook.md` - export/deletion and residual vendor-retention runbook.
8. `docs/audit-log-export-sop.md` - audit export support procedure.
9. `docs/ops/questionnaire-ai.md` and `docs/questionnaire-flow-audit.md` - OpenAI questionnaire proof boundary and AI review policy.

## Final Pre-Publication Checklist

Before editing public legal pages:

- [ ] Confirm operator identity and insert exact Czech OSVČ details.
- [ ] Confirm DPO/privacy contact decision.
- [ ] Move required production vendor rows in `docs/subprocessors.md` to approved, or document why a row remains conditional/not production.
- [ ] Confirm OpenAI DPA/data-retention/training settings and customer opt-in/human-review wording.
- [ ] Confirm Vercel, Neon, Inngest, Clerk, Stripe, and Resend retention/account settings.
- [ ] Confirm special-category uploaded evidence policy.
- [ ] Confirm Terms commercial positions: liability, refunds, cancellation, SLA/support, governing law, jurisdiction, B2B/consumer scope.
- [ ] Confirm incident notification/support commitments.
- [ ] Update Czech public legal copy first.
- [ ] Mirror approved meaning into English-EU and Italian without adding stronger claims.
- [ ] Run `npm run smoke:copy-hygiene`, `npm run lint`, and `npm run typecheck`.
- [ ] Browser-check Czech `/soukromi`, `/cookies`, `/podminky`, and `/dpa`.
