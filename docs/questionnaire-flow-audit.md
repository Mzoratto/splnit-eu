# Questionnaire Flow Audit

Last updated: 2026-05-12

Purpose: record the honest current status of questionnaire-related flows before first outreach conversations. This is an investigation note with production smoke evidence and remaining proof boundaries.

## Current Conclusion

Questionnaire capability is ready for the current outreach decision for the covered vendor-assessment smoke path, with remaining gaps limited to optional submission/status proof and broader questionnaire workbench/provider runtime proof.

There are two separate flows:

1. `/questionnaires` answers inbound security questionnaires for the tenant using tenant compliance context and, when configured, OpenAI.
2. `/vendors` plus `/vendor-assessment/[token]` sends a fixed vendor assessment questionnaire to an external contact and stores the submitted risk answers.

The inbound questionnaire answer flow can use org-scoped controls, evidence, policies, and reviewed legal citations. Generated answers now carry `controlIds`, `controlKeys`, confidence, and `reviewStatus: "draft"`. The fallback model remains conservative for empty workspaces and uses `fallback:no-supported-context`.

Generated questionnaire answers are persisted as `generated_artifacts`. For mapped controls, draft `evidence` rows are also created with `kind/type` equivalent to `questionnaire_answer`, `sourceArtifactId` pointing to the generated artifact, and `status: "draft"`. These rows are AI-generated drafts requiring human review before auditor-facing or vendor-facing use; they must not be described as reviewed evidence.

PDF/XLSX export now posts an artifact ID and the server fetches the stored artifact with `generated_artifacts.clerkOrgId === session.orgId` and `kind === questionnaire_answers` before rendering. This closes the previous page-payload ownership gap for generated questionnaire exports.

Provider-backed OpenAI generation has now been runtime-smoked with real environment variables and the configured model path. On 2026-05-07, `QUESTIONNAIRE_AI_ENABLED=true npx tsx scripts/smoke-questionnaire-provider.ts` completed a live OpenAI-backed questionnaire generation call and returned model `gpt-4.1-mini-2025-04-14`. This verifies the provider-backed path in local runtime; it is still not a production tenant/customer proof claim.

On 2026-05-11, the production tenant readiness smoke was completed for the vendor-assessment delivery path after applying production migrations through 0015, fixing Clerk active-organization activation in the smoke script, and aligning the smoke database with Vercel Production. The user confirmed all authenticated smoke routes rendered, the public Trust Center access URL rendered, and the vendor assessment token URL rendered. Controlled mailbox proof was also completed: `smoke@splnit.eu` received an email from `Splnit <noreply@splnit.eu>` today at 1:36 PM, and the assessment link rendered correctly.

On 2026-05-12, `npm run smoke:production-tenant-readiness` was extended to seed a generated questionnaire artifact for the smoke tenant, open `/questionnaires?artifactId=...` under the authenticated production session, approve/edit the generated answer through the reviewer form, re-read the artifact from the production database, and re-render the reviewed answer. The paired source guard now asserts this coverage so the production smoke cannot silently lose questionnaire review/persistence tracing. The live production run then passed with redacted output showing `questionnaireArtifactLoaded: true`, `questionnaireReviewPersisted: true`, `questionnaireReviewStatus: "approved"`, zero browser console errors, and zero page errors.

## Status Matrix

| Area | Routes / code | Status | What works | Gaps to close |
|---|---|---:|---|---|
| Inbound questionnaire generation | `/questionnaires`, `app/(app)/questionnaires/actions.ts`, `lib/questionnaires/provider.ts`, `lib/questionnaires/openai.ts` | partial | Requires Clerk user+org. Reads org-scoped compliance context via `getQuestionnaireComplianceContext(clerkOrgId)`. Uses OpenAI only when `QUESTIONNAIRE_AI_ENABLED=true` and `OPENAI_API_KEY` exists. Sanitizes evidence/legal/policy refs against available context before persistence. Provider-backed local runtime smoke passed with real OpenAI credentials on 2026-05-07. | Needs a representative authenticated tenant smoke with real `DATABASE_URL`, reviewed workspace context, artifact persistence, and UI review of the generated result. |
| No-context fallback | `lib/questionnaires/fallback.ts` | ready as conservative fallback | If a tenant has no controls/evidence/legal citations/policies, it produces `no-context` unsupported draft answers and persists them as an artifact using model `fallback:no-supported-context`. | Sales wording must not call this AI-generated proof; it is a safe fallback draft explaining missing support. |
| Question-to-control mapping | `lib/questionnaires/control-mapping.ts` | partial | Deterministically maps questions to likely controls and carries `controlIds`/`controlKeys` into answers. Covered by smoke script. | Template-declared explicit mappings and a reviewed classifier can improve precision later. |
| Generated answer persistence | `persistQuestionnaireResult`, `createGeneratedArtifact`, `generated_artifacts` | proven for seeded production review smoke | Successful generated/fallback answers are stored as generated artifacts with kind `questionnaire_answers`, model, title, content JSON, createdBy, and audit log. History on `/questionnaires` lists generated artifact summaries. The workbench exposes per-answer review controls for approved, flagged, and draft edits. The production tenant readiness smoke opens a seeded artifact in the authenticated workbench, approves/edits an answer, verifies saved artifact content, and re-renders the approved answer. | Provider-backed generation is still local-runtime-proven, not production-generated proof. |
| Evidence-save to controls | `createQuestionnaireAnswerEvidence`, `evidence` table, evidence page | partial | Mapped answers create draft evidence rows linked to the generated artifact and control. Evidence page labels AI draft rows as requiring human review. Reviewer workflow can update generated answer status/content in the artifact. | Draft answer evidence must not be described as reviewed evidence until a human approves the corresponding generated answer. Evidence-row status promotion remains conservative. |
| Vendor questionnaire creation | `/vendors/[vendorId]`, `sendVendorQuestionnaireAction`, `createVendorQuestionnaire` | proven for smoke path | For an authenticated org user and org-owned vendor, creates a `vendor_assessments` row and token link flow. Delivery outcomes are persisted as `sent`, `email_skipped`, or `email_failed` with delivery metadata for the latest questionnaire attempt. `npm run smoke:production-tenant-readiness` includes a seeded vendor questionnaire, authenticated vendor detail render, and vendor assessment token route render, with cleanup. Production schema migration parity through 0015 was verified on 2026-05-11 after running `npm run db:migrate`; the later successful smoke required aligning the local smoke `DATABASE_URL` with Vercel Production. | External submit-and-status propagation remains optional follow-up proof if Splnit wants to claim completed vendor assessment submission, not just creation/delivery/rendering. |
| Vendor questionnaire token page | `/vendor-assessment/[token]`, `lib/vendors/access.ts` | proven for render | Token is HMAC-signed from assessmentId, clerkOrgId, and vendorId. Valid tokens load the external questionnaire without Clerk auth. The 2026-05-11 production smoke/user mailbox proof confirmed the delivered token link rendered correctly. Submission updates the matching `vendor_assessments` row, score, status, and vendor risk metadata. | Tokens do not include expiry/revocation. External submission/status propagation is not captured in this audit entry. External submission does not create reviewed evidence/control artifacts. |
| Email deliverability | `lib/vendors/notifications.ts`, `lib/email/client.ts`, `lib/vendors/delivery-status.ts` | proven for send/arrival/link render | Uses real Resend API when `RESEND_API_KEY` and `RESEND_FROM` are configured. Uses localized alert templates. Skipped and failed send attempts are surfaced in the vendor detail UI instead of disappearing after row creation. On 2026-05-11, controlled mailbox proof confirmed an email from `Splnit <noreply@splnit.eu>` to `smoke@splnit.eu`, received today at 1:36 PM, with a vendor assessment link that rendered correctly. | Resend send, mailbox arrival, and link rendering are proven. Token submission and vendor status/delivery-status propagation remain optional follow-up proof. |
| PDF/XLSX export | `/api/questionnaires/export/pdf`, `/api/questionnaires/export/xlsx` | hardened for artifact ownership | Requires authenticated Clerk user+org and server-fetches the generated artifact by ID scoped to `session.orgId`. | Formal export should eventually include the reviewer gate so only approved answers can be exported externally. |

## Sales-Safe Wording

Use:

- “The questionnaire assistant can draft answers from the customer’s Splnit control, evidence, policy, and reviewed citation context when AI is enabled.”
- “If the workspace lacks supporting evidence, it responds conservatively instead of inventing proof.”
- “Seeded generated questionnaire review/persistence has passed an authenticated production smoke: the review URL loaded, a generated answer was approved/edited, the artifact persisted, and the reviewed answer re-rendered.”
- “Mapped generated answers create draft evidence rows so the workspace has an internal review trail.”
- “Questionnaire answer evidence is AI-generated draft evidence until a human reviews it.”
- “Exports are scoped server-side by generated artifact ownership.”
- “Vendor questionnaires can be created from an authenticated production tenant, production Resend can deliver vendor assessment emails to the controlled `smoke@splnit.eu` mailbox from `Splnit <noreply@splnit.eu>`, and the delivered assessment links render correctly.”
- “OpenAI-backed questionnaire generation has passed a local runtime smoke with real configured credentials and model resolution.”

Do not claim yet:

- “Questionnaire answers are reviewed auditor evidence” unless a human has explicitly approved the specific answer.
- “Vendor questionnaire token submission/status propagation has passed full production smoke” until a controlled submit-and-status run is captured.
- “Production-generated OpenAI questionnaire answers are reviewed auditor evidence.” The production smoke uses a seeded artifact to prove review/persistence, while OpenAI generation remains local-runtime-proven.
- “Provider-backed AI generation has been proven in production.” Local runtime smoke is not production proof.

## Trackable Gaps Deferred From This Pass

1. **Authenticated questionnaire review smoke.** Completed for the seeded-artifact path on 2026-05-12. `npm run smoke:production-tenant-readiness` loaded `/questionnaires?artifactId=...`, approved/edited an answer, verified persisted artifact content, and re-rendered the reviewed answer with real production auth/env. Remaining proof boundary: this does not prove production OpenAI generation, only review/persistence of a generated questionnaire artifact.
2. **Production authenticated vendor delivery smoke.** Delivery statuses are modeled and shown in the vendor detail UI. `npm run smoke:production-tenant-readiness` seeds a production smoke vendor questionnaire and checks the authenticated vendor detail plus token URL. The production DB migration blocker was fixed on 2026-05-11 by applying pending Drizzle migrations through 0015. The smoke now uses the dedicated `SMOKE_USER_EMAIL`/`SMOKE_USER_PASSWORD` Clerk identity instead of creating a throwaway user, uses a verified active Clerk organization, and must run against the same Neon branch as Vercel Production. Production Resend delivery to the controlled `smoke@splnit.eu` inbox is proven by user-observed receipt of a Splnit vendor assessment email from `Splnit <noreply@splnit.eu>` with a link that rendered correctly. Cleanup was verified in prior failed runs; retain cleanup verification for each future smoke.
3. **Richer policy excerpt and legal citation grounding.** The generation prompt receives control status, evidence context, policy context, and reviewed citation context, but reviewed policy excerpts and detailed citation attribution are not fully wired as a reviewer-facing source panel. Defer richer source attribution.
4. **Vendor assessment token completion.** Email arrival and link rendering are proven for the controlled `smoke@splnit.eu` mailbox. If Splnit wants to claim completed external vendor submission, add a controlled submit-and-status smoke: open `/vendor-assessment/[token]`, submit the assessment, and confirm vendor risk/status plus delivery-status accuracy.
5. **Vendor assessment token expiry/revocation.** Vendor assessment tokens do not yet include expiry or revocation. Defer token hardening.
