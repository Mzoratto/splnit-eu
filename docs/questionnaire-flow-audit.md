# Questionnaire Flow Audit

Last updated: 2026-05-09

Purpose: record the honest current status of questionnaire-related flows before first outreach conversations. This is an investigation note, not a claim of full production readiness.

## Current Conclusion

Questionnaire capability is partial but materially more coherent than before.

There are two separate flows:

1. `/questionnaires` answers inbound security questionnaires for the tenant using tenant compliance context and, when configured, OpenAI.
2. `/vendors` plus `/vendor-assessment/[token]` sends a fixed vendor assessment questionnaire to an external contact and stores the submitted risk answers.

The inbound questionnaire answer flow can use org-scoped controls, evidence, policies, and reviewed legal citations. Generated answers now carry `controlIds`, `controlKeys`, confidence, and `reviewStatus: "draft"`. The fallback model remains conservative for empty workspaces and uses `fallback:no-supported-context`.

Generated questionnaire answers are persisted as `generated_artifacts`. For mapped controls, draft `evidence` rows are also created with `kind/type` equivalent to `questionnaire_answer`, `sourceArtifactId` pointing to the generated artifact, and `status: "draft"`. These rows are AI-generated drafts requiring human review before auditor-facing or vendor-facing use; they must not be described as reviewed evidence.

PDF/XLSX export now posts an artifact ID and the server fetches the stored artifact with `generated_artifacts.clerkOrgId === session.orgId` and `kind === questionnaire_answers` before rendering. This closes the previous page-payload ownership gap for generated questionnaire exports.

Provider-backed OpenAI generation has now been runtime-smoked with real environment variables and the configured model path. On 2026-05-07, `QUESTIONNAIRE_AI_ENABLED=true npx tsx scripts/smoke-questionnaire-provider.ts` completed a live OpenAI-backed questionnaire generation call and returned model `gpt-4.1-mini-2025-04-14`. This verifies the provider-backed path in local runtime; it is still not a production tenant/customer proof claim.

## Status Matrix

| Area | Routes / code | Status | What works | Gaps to close |
|---|---|---:|---|---|
| Inbound questionnaire generation | `/questionnaires`, `app/(app)/questionnaires/actions.ts`, `lib/questionnaires/provider.ts`, `lib/questionnaires/openai.ts` | partial | Requires Clerk user+org. Reads org-scoped compliance context via `getQuestionnaireComplianceContext(clerkOrgId)`. Uses OpenAI only when `QUESTIONNAIRE_AI_ENABLED=true` and `OPENAI_API_KEY` exists. Sanitizes evidence/legal/policy refs against available context before persistence. Provider-backed local runtime smoke passed with real OpenAI credentials on 2026-05-07. | Needs a representative authenticated tenant smoke with real `DATABASE_URL`, reviewed workspace context, artifact persistence, and UI review of the generated result. |
| No-context fallback | `lib/questionnaires/fallback.ts` | ready as conservative fallback | If a tenant has no controls/evidence/legal citations/policies, it produces `no-context` unsupported draft answers and persists them as an artifact using model `fallback:no-supported-context`. | Sales wording must not call this AI-generated proof; it is a safe fallback draft explaining missing support. |
| Question-to-control mapping | `lib/questionnaires/control-mapping.ts` | partial | Deterministically maps questions to likely controls and carries `controlIds`/`controlKeys` into answers. Covered by smoke script. | Template-declared explicit mappings and a reviewed classifier can improve precision later. |
| Generated answer persistence | `persistQuestionnaireResult`, `createGeneratedArtifact`, `generated_artifacts` | partial | Successful generated/fallback answers are stored as generated artifacts with kind `questionnaire_answers`, model, title, content JSON, createdBy, and audit log. History on `/questionnaires` lists generated artifact summaries. The workbench now exposes per-answer review controls for approved, flagged, and draft edits. | Needs authenticated production tenant smoke to prove review updates persist and re-render inside a real workspace. |
| Evidence-save to controls | `createQuestionnaireAnswerEvidence`, `evidence` table, evidence page | partial | Mapped answers create draft evidence rows linked to the generated artifact and control. Evidence page labels AI draft rows as requiring human review. Reviewer workflow can update generated answer status/content in the artifact. | Draft answer evidence must not be described as reviewed evidence until a human approves the corresponding generated answer. Evidence-row status promotion remains conservative. |
| Vendor questionnaire creation | `/vendors/[vendorId]`, `sendVendorQuestionnaireAction`, `createVendorQuestionnaire` | partial | For an authenticated org user and org-owned vendor, creates a `vendor_assessments` row and token link flow. Delivery outcomes are now persisted as `sent`, `email_skipped`, or `email_failed` with delivery metadata for the latest questionnaire attempt. `npm run smoke:production-tenant-readiness` now includes a seeded vendor questionnaire, authenticated vendor detail render, and vendor assessment token route render, with cleanup. | Needs that smoke to run successfully against non-empty production Clerk secrets before claiming production tenant proof. |
| Vendor questionnaire token page | `/vendor-assessment/[token]`, `lib/vendors/access.ts` | partial | Token is HMAC-signed from assessmentId, clerkOrgId, and vendorId. Valid tokens load the external questionnaire without Clerk auth. Submission updates the matching `vendor_assessments` row, score, status, and vendor risk metadata. | Tokens do not include expiry/revocation. External submission does not create reviewed evidence/control artifacts. |
| Email deliverability | `lib/vendors/notifications.ts`, `lib/email/client.ts`, `lib/vendors/delivery-status.ts` | blocked/unproven | Uses real Resend API when `RESEND_API_KEY` and `RESEND_FROM` are configured. Uses localized alert templates. Skipped and failed send attempts are surfaced in the vendor detail UI instead of disappearing after row creation. A 2026-05-09 production env metadata check did not show `RESEND_API_KEY` or `RESEND_FROM`; Microsoft 365 mailbox setup is intentionally pending. | Current production is not configured for mailbox smoke. Do not claim production email deliverability until the sender is configured and a controlled Microsoft 365 mailbox test confirms arrival and token submission. |
| PDF/XLSX export | `/api/questionnaires/export/pdf`, `/api/questionnaires/export/xlsx` | hardened for artifact ownership | Requires authenticated Clerk user+org and server-fetches the generated artifact by ID scoped to `session.orgId`. | Formal export should eventually include the reviewer gate so only approved answers can be exported externally. |

## Sales-Safe Wording

Use:

- “The questionnaire assistant can draft answers from the customer’s Splnit control, evidence, policy, and reviewed citation context when AI is enabled.”
- “If the workspace lacks supporting evidence, it responds conservatively instead of inventing proof.”
- “Generated answers are saved in the workspace artifact history and can be human-reviewed per answer as approved, flagged, or edited draft.”
- “Mapped generated answers create draft evidence rows so the workspace has an internal review trail.”
- “Questionnaire answer evidence is AI-generated draft evidence until a human reviews it.”
- “Exports are scoped server-side by generated artifact ownership.”
- “Vendor questionnaires can be created and token links can collect vendor responses; skipped or failed email delivery is now visible in the vendor detail workflow, but production email delivery still needs a configured Resend sender and should be verified before relying on it operationally.”
- “OpenAI-backed questionnaire generation has passed a local runtime smoke with real configured credentials and model resolution.”

Do not claim yet:

- “Questionnaire answers are reviewed auditor evidence” unless a human has explicitly approved the specific answer.
- “Vendor questionnaire emails are production-deliverable” unless Resend is configured and a mailbox smoke has passed.
- “Questionnaire review has been proven in production.” Source and local smokes exist; authenticated production tenant smoke is still needed.
- “Provider-backed AI generation has been proven in production.” Local runtime smoke is not production proof.

## Trackable Gaps Deferred From This Pass

1. **Authenticated questionnaire review smoke.** Reviewer controls and export gating are implemented in source and covered by focused smokes, but they still need a representative authenticated production tenant smoke with real workspace context.
2. **Production authenticated vendor delivery smoke.** Delivery statuses are modeled and shown in the vendor detail UI. `npm run smoke:production-tenant-readiness` now seeds a production smoke vendor questionnaire and checks the authenticated vendor detail plus token URL, but it has not yet been run because the current Vercel-pulled Clerk env names have empty values.
3. **Richer policy excerpt and legal citation grounding.** The generation prompt receives control status, evidence context, policy context, and reviewed citation context, but reviewed policy excerpts and detailed citation attribution are not fully wired as a reviewer-facing source panel. Defer richer source attribution.
4. **Production mailbox smoke.** Production env metadata currently does not show `RESEND_API_KEY` or `RESEND_FROM`, and Microsoft 365 setup is pending, so no mailbox smoke can be run safely yet. Configure the sender and controlled Microsoft 365 recipient, send a questionnaire, verify email arrival, open `/vendor-assessment/[token]`, submit the assessment, and confirm vendor risk/status plus delivery-status accuracy.
5. **Vendor assessment token expiry/revocation.** Vendor assessment tokens do not yet include expiry or revocation. Defer token hardening.
