# Export Endpoint Audit

Last updated: 2026-05-07

Purpose: record the honest current status of audit, vendor, risk, and incident export/report endpoints before first outreach conversations. This is an investigation note, not a claim of full export-suite production readiness.

## Current Conclusion

Export/report capability is partial.

The authenticated app does not currently expose generic `/api/vendors/export`, `/api/risks/export`, or `/api/incidents/export` routes. The active buyer-facing report surfaces are PDF endpoints:

- `/api/vendors/supply-chain-report`
- `/api/risks/register-report`
- `/api/incidents/[incidentId]/cybersecurity-report`
- `/api/incidents/[incidentId]/data-protection-report`
- legacy aliases `/api/incidents/[incidentId]/nukib-report` and `/api/incidents/[incidentId]/uoou-report`

The audit log has a CSV export endpoint at `/api/audit-log/export`.

Unauthenticated auth-smoke coverage now exists for audit log, vendor report, risk report, and incident report endpoints. During this pass, vendor, risk, and incident report endpoints had the same local/test Clerk failure pattern found in the questionnaire pass: when Clerk was not configured/detectable, `auth()` threw and the endpoint returned 500 instead of a private 401. That is fixed for the active report endpoints.

Source trace shows org scoping is present: audit, vendor, risk, and incident report queries use `session.orgId` / `clerkOrgId` filters. Existing DB-level org-boundary smoke now covers audit-log filtering, vendor ownership, risk item isolation, and incident ownership.

Audit export handles large result sets by explicit page limits and cursor headers, not by silently truncating. It defaults to 1000 rows, rejects `limit` values outside `1..5000`, queries `limit + 1`, returns at most `limit` rows, and sets `X-Audit-Log-Truncated: true` plus `X-Audit-Log-Next-Cursor` when more rows are available. What remains unproven here is a real authenticated HTTP export smoke against a seeded tenant with more than one page of audit rows.

Incident notification outputs are not pure stubs: jurisdiction-specific profiles exist for CZ, EU fallback, and IT, with separate cybersecurity and data-protection tracks. The Italian ACN/CSIRT and Garante outputs have a dedicated smoke that renders non-empty PDFs. However, these PDFs are draft notification templates/checklists, not live authority submissions and not legal-reviewed final filings.

## Status Matrix

| Area | Routes / code | Status | What works | Gaps to close |
|---|---|---:|---|---|
| Audit log CSV export | `/api/audit-log/export`, `lib/db/queries/audit-logs.ts` | partial | Requires Clerk user+org; returns private no-store CSV; filters rows by `auditLogs.clerkOrgId = session.orgId`; supports `from`, `to`, `action`, `entityType`, `limit`, and `cursor`; rejects invalid dates/ranges/limits/cursors. | Needs authenticated real-tenant HTTP smoke with seeded >1000 rows to prove end-to-end cursor pagination under production-like data volume. |
| Audit pagination / limits | `listAuditLogPage`, export route headers | mostly ready by source | Default limit is 1000; max is 5000; route rejects `limit > 5000` instead of silently clamping; query fetches `limit + 1`; response exposes `X-Audit-Log-Truncated` and `X-Audit-Log-Next-Cursor`. | Large-result behavior is source-verified and query-shaped, but not runtime-proven here with a large real tenant dataset. |
| Vendor report export | `/api/vendors/supply-chain-report` | partial | Unauthenticated access now returns private 401 in local/test mode. Authenticated route fetches `listVendorsForOrg(session.orgId)` and renders a PDF with org-scoped vendor rows. | There is no `/api/vendors/export` route. No authenticated browser/API smoke with a real Clerk session was run in this pass. PDF has no pagination/cursor semantics; it renders all rows returned by `listVendorsForOrg`. |
| Vendor report data scope | `listVendorsForOrg`, `scripts/smoke-org-boundaries.ts` | mostly ready by source/smoke | Vendor list query filters by `vendors.clerkOrgId`. Existing org-boundary smoke covers vendor detail, questionnaire, and assessment ownership failures across orgs. | Add a report-level authenticated smoke that creates vendors in two orgs and asserts only the active org appears in the generated report. |
| Risk report export | `/api/risks/register-report` | partial | Unauthenticated access now returns private 401 in local/test mode. Authenticated route requires an organisation row, fetches `listRiskItemsForOrg(session.orgId)`, and renders a PDF. | There is no `/api/risks/export` route. No authenticated HTTP smoke with a real Clerk session was run in this pass. Risk list is capped at 200 rows with no report pagination/export continuation. |
| Risk report data scope | `listRiskItemsForOrg`, `scripts/smoke-org-boundaries.ts` | mostly ready by source/smoke | Source query filters by `riskItems.clerkOrgId`; org-boundary smoke creates risk items in two orgs and asserts `listRiskItemsForOrg` isolation. | Add report-level authenticated smoke for generated output. Decide whether the 200-row cap is acceptable for export/report semantics. |
| Incident report exports | `/api/incidents/[incidentId]/cybersecurity-report`, `/data-protection-report`, legacy `/nukib-report`, `/uoou-report` | partial | Unauthenticated access now returns private 401 in local/test mode. Authenticated route fetches `getIncidentForOrg({ clerkOrgId: session.orgId, incidentId })`, so cross-org incident IDs return 404. | There is no generic `/api/incidents/export` route. No authenticated HTTP smoke with a real Clerk session was run in this pass. |
| Incident jurisdiction outputs | `lib/incidents/reporting.ts`, `lib/pdf/incident-notification.tsx`, `scripts/smoke-incident-notifications.ts` | partial | Profiles exist for CZ, EU fallback, and IT; each has cybersecurity and data-protection tracks. IT ACN/CSIRT and Garante PDF rendering is smoked. | Outputs are draft templates/checklists, not live authority submission integrations. Czech/EU PDFs are source-covered but the smoke currently focuses on Italian outputs. Legal/template review is still needed before claiming regulatory filing readiness. |

## Sales-Safe Wording

Use:

- “Audit log export is authenticated, org-scoped, and cursor-paginated with an explicit truncation header.”
- “Vendor, risk, and incident reports are authenticated PDF downloads from the active workspace data.”
- “Incident notification templates exist for cybersecurity and data-protection tracks, with jurisdiction-specific profiles for Italy, Czech Republic, and EU fallback.”
- “These exports are suitable for review/conversation artifacts, not yet a fully load-tested export suite.”

Do not claim yet:

- “Large audit exports have been production load-tested with real tenant data.”
- “There are generic `/api/vendors/export`, `/api/risks/export`, or `/api/incidents/export` endpoints.”
- “Risk export pagination is implemented.”
- “Incident notification PDFs are legal-reviewed final filings or are submitted automatically to authorities.”
- “Authenticated end-to-end export scoping has been browser-tested with a real Clerk session for every report endpoint.”

## Trackable Gaps

1. **Authenticated export harness.** Add a controlled Clerk-authenticated API/browser smoke that can create a tenant/session and call audit/vendor/risk/incident export endpoints with real session cookies.
2. **Audit large-page runtime smoke.** Seed a tenant with more than 1000 audit rows, call `/api/audit-log/export`, verify row count, `X-Audit-Log-Truncated: true`, cursor format, next-page rows, and absence of cross-org rows.
3. **Vendor report output scope smoke.** Seed two orgs with vendors and verify the generated supply-chain report for org A excludes org B vendor names.
4. **Risk report output scope smoke.** Add a report-level smoke that creates risk items in two orgs and asserts only the active org appears in the generated report.
5. **Risk export volume decision.** Decide whether the current 200-row cap is acceptable for buyer-facing risk-register export. If not, add pagination or explicit truncation messaging.
6. **Route naming decision.** Either add generic `/api/vendors/export`, `/api/risks/export`, and `/api/incidents/export` aliases, or keep the current report-specific URLs and avoid documenting generic export routes.
7. **Incident notification review.** Expand PDF smokes beyond Italian outputs and run legal/template review before presenting these as filing-ready authority notices.
