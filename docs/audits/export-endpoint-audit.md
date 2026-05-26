# Export Endpoint Audit

Last updated: 2026-05-12

Purpose: record the honest current status of buyer-visible audit, vendor, risk, incident, and workspace export/report endpoints before first outreach conversations. This is an investigation note and production-smoke record, not a claim of unlimited export-suite readiness.

## Current Conclusion

The current buyer-visible export/report surfaces are production-smoked for the main first-outreach paths.

Production proof on 2026-05-12 used `SMOKE_LIVE_OPENAI_QUESTIONNAIRE=true npm run smoke:production-tenant-readiness` against `https://splnit.eu` with a real Clerk session and production database. The smoke now proves:

- `/api/audit-log/export` rejects unauthenticated requests, rejects over-limit requests, returns stable CSV headers, paginates with `X-Audit-Log-Truncated` and `X-Audit-Log-Next-Cursor`, and excludes seeded cross-org audit rows.
- `/api/vendors/supply-chain-report` rejects unauthenticated requests and downloads a non-empty PDF from active-org vendor data.
- `/api/risks/register-report` rejects unauthenticated requests and downloads a non-empty PDF from active-org risk data.
- `/api/exports/workspace/archive` rejects unauthenticated requests, downloads a ZIP, includes `workspace-export.json`, `evidence-metadata.csv`, and `export-manifest.json`, includes current-org risk data, and excludes seeded cross-org vendor/risk/organisation markers.

The authenticated app does not currently expose generic `/api/vendors/export`, `/api/risks/export`, or `/api/incidents/export` routes. The active buyer-facing report surfaces are:

- `/api/audit-log/export`
- `/api/vendors/supply-chain-report`
- `/api/risks/register-report`
- `/api/exports/workspace/archive`
- `/api/incidents/[incidentId]/cybersecurity-report`
- `/api/incidents/[incidentId]/data-protection-report`
- legacy aliases `/api/incidents/[incidentId]/nukib-report` and `/api/incidents/[incidentId]/uoou-report`

Incident notification outputs are still a separate partial area: jurisdiction-specific profiles exist for CZ, EU fallback, and IT, with separate cybersecurity and data-protection tracks. The Italian ACN/CSIRT and Garante outputs have a dedicated smoke that renders non-empty PDFs. These PDFs are draft notification templates/checklists, not live authority submissions and not legal-reviewed final filings.

## Status Matrix

| Area | Routes / code | Status | What works | Gaps to close |
|---|---|---:|---|---|
| Audit log CSV export | `/api/audit-log/export`, `lib/db/queries/audit-logs.ts` | production-smoked | Requires Clerk user+org; returns private no-store CSV; filters rows by `auditLogs.clerkOrgId = session.orgId`; supports `from`, `to`, `action`, `entityType`, `limit`, and `cursor`; rejects invalid limits; production smoke proved 2-row first page, 1-row second page, next cursor, stable CSV header, and cross-org exclusion. | Large-volume behavior beyond the controlled 3-row pagination smoke is not load-tested. Audit logs are append-only, so smoke-created audit records are intentionally not deleted. |
| Vendor report export | `/api/vendors/supply-chain-report` | production-smoked | Unauthenticated requests return private 401; authenticated route fetches `listVendorsForOrg(session.orgId)` and downloads a non-empty PDF. Production smoke verifies PDF signature/content type/filename and active-session access. | PDF text extraction is not currently used, so report-level cross-org exclusion is source/query-guarded rather than text-parsed from the PDF. There is no generic `/api/vendors/export` route. |
| Risk report export | `/api/risks/register-report` | production-smoked | Unauthenticated requests return private 401; authenticated route requires an organisation row, fetches `listRiskItemsForOrg(session.orgId)`, and downloads a non-empty PDF. Production smoke verifies PDF signature/content type/filename and active-session access. | PDF text extraction is not currently used, so report-level cross-org exclusion is source/query-guarded rather than text-parsed from the PDF. Risk list is capped at 200 rows with no report pagination/export continuation. There is no generic `/api/risks/export` route. |
| Workspace archive export | `/api/exports/workspace/archive`, `lib/db/queries/workspace-export.ts` | production-smoked | Unauthenticated requests return private 401; authenticated route downloads a ZIP containing `workspace-export.json`, `evidence-metadata.csv`, and `export-manifest.json`; archive JSON includes current-org risk data and excludes seeded cross-org organisation/vendor/risk markers; secret-bearing blob/token fields are redacted by source and checked for obvious provider/env-name leakage in smoke. | ZIP member schema is smoke-checked at the current top-level shape only. It is not a full DLP scan of every possible future field. |
| Incident report exports | `/api/incidents/[incidentId]/cybersecurity-report`, `/data-protection-report`, legacy `/nukib-report`, `/uoou-report` | partial | Unauthenticated access returns private 401 in local/test mode. Authenticated route fetches `getIncidentForOrg({ clerkOrgId: session.orgId, incidentId })`, so cross-org incident IDs return 404. | Not part of the current production export smoke. There is no generic `/api/incidents/export` route. |
| Incident jurisdiction outputs | `lib/incidents/reporting.ts`, `lib/pdf/incident-notification.tsx`, `scripts/smoke-incident-notifications.ts` | partial | Profiles exist for CZ, EU fallback, and IT; each has cybersecurity and data-protection tracks. IT ACN/CSIRT and Garante PDF rendering is smoked. | Outputs are draft templates/checklists, not live authority submission integrations. Czech/EU PDFs are source-covered but the smoke currently focuses on Italian outputs. Legal/template review is still needed before claiming regulatory filing readiness. |

## Production Smoke Evidence

Latest passing command:

```bash
SMOKE_LIVE_OPENAI_QUESTIONNAIRE=true npm run smoke:production-tenant-readiness
```

Relevant redacted proof fields from the passing run:

- `auditExportAuthRejected: true`
- `auditExportCrossTenantIsolated: true`
- `auditExportNextCursorPresent: true`
- `auditExportOverLimitRejected: true`
- `auditExportPageOneRows: 2`
- `auditExportPageTwoRows: 1`
- `auditExportShapeStable: true`
- `auditExportTruncated: true`
- `vendorReportAuthRejected: true`
- `vendorReportDownloaded: true`
- `vendorReportShapeStable: true`
- `riskReportAuthRejected: true`
- `riskReportDownloaded: true`
- `riskReportShapeStable: true`
- `workspaceArchiveAuthRejected: true`
- `workspaceArchiveDownloaded: true`
- `workspaceArchiveNoCrossTenantLeakage: true`
- `browserConsoleErrors: 0`
- `pageErrors: 0`

## Sales-Safe Wording

Use:

- “Audit log export is authenticated, org-scoped, cursor-paginated, and production-smoked with explicit truncation/cursor headers.”
- “Vendor and risk reports are authenticated PDF downloads from active workspace data.”
- “Workspace archive export is authenticated and production-smoked as a ZIP containing workspace JSON, evidence metadata CSV, and an export manifest.”
- “Incident notification templates exist for cybersecurity and data-protection tracks, with jurisdiction-specific profiles for Italy, Czech Republic, and EU fallback.”

Do not claim:

- “Large audit exports have been production load-tested with real high-volume tenant data.”
- “There are generic `/api/vendors/export`, `/api/risks/export`, or `/api/incidents/export` endpoints.”
- “Risk export pagination is implemented.”
- “PDF report body text has been parsed in production smoke to prove every rendered row.”
- “Incident notification PDFs are legal-reviewed final filings or are submitted automatically to authorities.”

## Trackable Gaps

1. **Large audit export load smoke.** Optional later: seed a high-volume non-customer tenant and prove audit export behavior above the default 1000-row page. Current smoke proves cursor behavior with a controlled 3-row dataset.
2. **PDF text extraction.** Optional later: add a reliable PDF text parser in smoke tooling so vendor/risk report body content can be asserted directly, not only by authenticated route scoping plus non-empty PDF signature/headers.
3. **Risk export volume decision.** Decide whether the current 200-row cap is acceptable for buyer-facing risk-register report semantics. If not, add pagination or explicit truncation messaging.
4. **Route naming decision.** Either add generic `/api/vendors/export`, `/api/risks/export`, and `/api/incidents/export` aliases, or keep the current report-specific URLs and avoid documenting generic export routes.
5. **Incident notification review.** Expand PDF smokes beyond Italian outputs and run legal/template review before presenting these as filing-ready authority notices.
