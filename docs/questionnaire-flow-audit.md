# Questionnaire Flow Audit

Last updated: 2026-05-06

Purpose: record the honest current status of questionnaire-related flows before first outreach conversations. This is an investigation note, not a claim of full production readiness.

## Current Conclusion

Questionnaire capability is partial.

There are two separate flows:

1. `/questionnaires` answers inbound security questionnaires for the tenant using tenant compliance context and, when configured, Anthropic Claude.
2. `/vendors` plus `/vendor-assessment/[token]` sends a fixed vendor assessment questionnaire to an external contact and stores the submitted risk answers.

The inbound questionnaire answer flow is not a stub: it can use real org-scoped controls, evidence, policies, and reviewed legal citations. However, local/current-shell runtime is not configured for `QUESTIONNAIRE_AI_ENABLED`, `ANTHROPIC_API_KEY`, or `DATABASE_URL`, so provider-backed generation was not runtime-proven in this pass. Unsupported/no-context tenants get a conservative persisted fallback artifact instead of invented answers.

The evidence-save claim is not ready. Generated questionnaire answers persist as `generated_artifacts`, and vendor questionnaire answers persist as `vendor_assessments`. They do not create rows in `evidence`, do not attach to a specific `controlId`, and therefore do not appear under a control as control evidence.

Email deliverability is not proven here. Vendor questionnaire email uses Resend when `RESEND_API_KEY` and `RESEND_FROM` are configured; otherwise the send helper returns `{ emailsSent: 0, skipped: "Resend is not configured." }` after the questionnaire row has already been created. The current shell has no Resend env vars set, and no external email was sent in this pass.

Questionnaire PDF/XLSX export is authenticated, but it exports the client-submitted result payload from the current page, not a server-fetched artifact by ID. That means auth is present and no-store headers are used, but server-side org scoping of the payload itself is not meaningful yet. Treat exports as “download the just-generated answer set from your authenticated session,” not as an audited server-side archive export.

## Status Matrix

| Area | Routes / code | Status | What works | Gaps to close |
|---|---|---:|---|---|
| Inbound questionnaire generation | `/questionnaires`, `app/(app)/questionnaires/actions.ts`, `lib/questionnaires/provider.ts`, `lib/questionnaires/claude.ts` | partial | Requires Clerk user+org. Reads org-scoped compliance context via `getQuestionnaireComplianceContext(clerkOrgId)`. Uses Anthropic provider only when `QUESTIONNAIRE_AI_ENABLED=true` and provider config exists. Sanitizes evidence/legal/policy refs against available context before persistence. | Provider-backed generation needs a production/runtime smoke with real `DATABASE_URL`, `QUESTIONNAIRE_AI_ENABLED=true`, and Anthropic key. Page disables generation when provider config is absent. |
| No-context fallback | `lib/questionnaires/fallback.ts` | ready as conservative fallback | If a tenant has no controls/evidence/legal citations/policies, it produces low-confidence unsupported answers and persists them as an artifact using model `fallback:no-supported-context`. | Sales wording must not call this AI-generated proof; it is a safe fallback draft explaining missing support. |
| Generated answer persistence | `persistQuestionnaireResult`, `createGeneratedArtifact`, `generated_artifacts` | partial | Successful generated/fallback answers are stored as generated artifacts with kind `questionnaire_answers`, model, title, content JSON, createdBy, and audit log. History on `/questionnaires` lists generated artifact summaries. | There is no dedicated questionnaire table, artifact detail page, or server-side artifact export-by-ID in this flow. |
| Evidence-save to controls | `evidence` table, control detail surfaces | gap | N/A for questionnaire answers. | Questionnaire answers do not create `evidence` rows, do not set `controlId`, and do not appear under a control as evidence. If this is desired, add an explicit review/attach flow rather than auto-promoting questionnaire text into evidence. |
| Vendor questionnaire creation | `/vendors/[vendorId]`, `sendVendorQuestionnaireAction`, `createVendorQuestionnaire` | partial | For an authenticated org user and org-owned vendor, creates a `vendor_assessments` row with status `sent` and stores `vendorEmail` in answers. Updates vendor status to `questionnaire_sent`. | If email sending is skipped or fails after row creation, the product currently has a sent-status row without proven external delivery. Need delivery-state fields or transactional status handling. |
| Vendor questionnaire token page | `/vendor-assessment/[token]`, `lib/vendors/access.ts` | partial | Token is HMAC-signed from assessmentId, clerkOrgId, and vendorId. Valid tokens load the external questionnaire without Clerk auth. Submission updates the matching `vendor_assessments` row, score, status `submitted`, and vendor risk metadata. | Tokens do not include expiry. External submission does not create evidence/control artifacts. Need production browser smoke with a created token. |
| Email deliverability | `lib/vendors/notifications.ts`, `lib/email/client.ts` | blocked/unproven | Uses real Resend API when `RESEND_API_KEY` and `RESEND_FROM` are configured. Uses localized alert templates. | Current shell has no Resend env vars set. No deliverability test was run. Send helper silently skips when not configured, while caller does not surface that skip to the UI. Need production email smoke to a controlled mailbox. |
| PDF/XLSX export | `/api/questionnaires/export/pdf`, `/api/questionnaires/export/xlsx` | partial | Requires authenticated Clerk user+org. Returns private no-store PDF/XLSX response for a valid `QuestionnaireResult` payload. Unauthenticated access is now covered by E2E. | Export trusts the submitted payload; it does not fetch a generated artifact by ID or verify artifact ownership/content against `clerkOrgId`. Scoped enough for immediate post-generation download, not enough for server-side audit archive semantics. |

## Sales-Safe Wording

Use:

- “The questionnaire assistant can draft answers from the customer’s Splnit control, evidence, policy, and reviewed citation context when AI is enabled.”
- “If the workspace lacks supporting evidence, it responds conservatively instead of inventing proof.”
- “Generated answers are saved in the workspace artifact history.”
- “Vendor questionnaires can be created and token links can collect vendor responses; production email delivery needs a configured Resend sender and should be verified before relying on it operationally.”
- “Exports are available for generated answer sets, but server-side archived export-by-artifact is still a hardening item.”

Do not claim yet:

- “Questionnaire answers automatically become control evidence.”
- “Vendor questionnaire emails are production-deliverable” unless Resend is configured and a mailbox smoke has passed.
- “Questionnaire export is a fully server-scoped archive export.”
- “Provider-backed AI generation has been proven in production” until a real tenant/runtime smoke passes.

## Trackable Gaps

1. **Provider runtime smoke.** Create a seeded/controlled tenant with at least one passing control, evidence row, reviewed citation, and policy; run `/questionnaires` with `QUESTIONNAIRE_AI_ENABLED=true`; verify generated answers are grounded and persisted as a `questionnaire_answers` artifact.
2. **Evidence attachment decision.** Decide whether questionnaire answers should be attachable to controls. If yes, add a human-reviewed “save as evidence” step that creates `evidence` rows with explicit `controlId`, source, snapshotData, and reviewer identity.
3. **Email delivery state.** Store vendor questionnaire delivery status separately from assessment status. Surface skipped/failed sends in the UI instead of treating row creation as delivery.
4. **Production email smoke.** Configure Resend sender, send a vendor questionnaire to a controlled external mailbox, verify receipt, link validity, submission, and final vendor assessment status.
5. **Token expiry.** Add expiry or revocation for vendor assessment tokens before presenting the external questionnaire flow as hardened.
6. **Server-side export by artifact.** Add authenticated export endpoints that take an artifact ID, verify `generated_artifacts.clerkOrgId === session.orgId`, and render the stored content instead of trusting a posted payload.
