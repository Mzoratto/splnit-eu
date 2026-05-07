# Questionnaire Flow Audit

Last updated: 2026-05-07

Purpose: record the honest current status of questionnaire-related flows before first outreach conversations. This is an investigation note, not a claim of full production readiness.

## Current Conclusion

Questionnaire capability is partial but materially more coherent than before.

There are two separate flows:

1. `/questionnaires` answers inbound security questionnaires for the tenant using tenant compliance context and, when configured, OpenAI.
2. `/vendors` plus `/vendor-assessment/[token]` sends a fixed vendor assessment questionnaire to an external contact and stores the submitted risk answers.

The inbound questionnaire answer flow can use org-scoped controls, evidence, policies, and reviewed legal citations. Generated answers now carry `controlIds`, `controlKeys`, confidence, and `reviewStatus: "draft"`. The fallback model remains conservative for empty workspaces and uses `fallback:no-supported-context`.

Generated questionnaire answers are persisted as `generated_artifacts`. For mapped controls, draft `evidence` rows are also created with `kind/type` equivalent to `questionnaire_answer`, `sourceArtifactId` pointing to the generated artifact, and `status: "draft"`. These rows are AI-generated drafts requiring human review before auditor-facing or vendor-facing use; they must not be described as reviewed evidence.

PDF/XLSX export now posts an artifact ID and the server fetches the stored artifact with `generated_artifacts.clerkOrgId === session.orgId` and `kind === questionnaire_answers` before rendering. This closes the previous page-payload ownership gap for generated questionnaire exports.

Provider-backed OpenAI generation still needs a runtime smoke with real environment variables and representative tenant data. This pass verified code-level checks and deterministic smoke scripts, not a live OpenAI call.

## Status Matrix

| Area | Routes / code | Status | What works | Gaps to close |
|---|---|---:|---|---|
| Inbound questionnaire generation | `/questionnaires`, `app/(app)/questionnaires/actions.ts`, `lib/questionnaires/provider.ts`, `lib/questionnaires/openai.ts` | partial | Requires Clerk user+org. Reads org-scoped compliance context via `getQuestionnaireComplianceContext(clerkOrgId)`. Uses OpenAI only when `QUESTIONNAIRE_AI_ENABLED=true` and `OPENAI_API_KEY` exists. Sanitizes evidence/legal/policy refs against available context before persistence. | Provider-backed generation needs a runtime smoke with real `DATABASE_URL`, `QUESTIONNAIRE_AI_ENABLED=true`, `OPENAI_API_KEY`, and reviewed tenant context. |
| No-context fallback | `lib/questionnaires/fallback.ts` | ready as conservative fallback | If a tenant has no controls/evidence/legal citations/policies, it produces `no-context` unsupported draft answers and persists them as an artifact using model `fallback:no-supported-context`. | Sales wording must not call this AI-generated proof; it is a safe fallback draft explaining missing support. |
| Question-to-control mapping | `lib/questionnaires/control-mapping.ts` | partial | Deterministically maps questions to likely controls and carries `controlIds`/`controlKeys` into answers. Covered by smoke script. | Template-declared explicit mappings and a reviewed classifier can improve precision later. |
| Generated answer persistence | `persistQuestionnaireResult`, `createGeneratedArtifact`, `generated_artifacts` | partial | Successful generated/fallback answers are stored as generated artifacts with kind `questionnaire_answers`, model, title, content JSON, createdBy, and audit log. History on `/questionnaires` lists generated artifact summaries. | There is no dedicated questionnaire detail/review workflow yet. |
| Evidence-save to controls | `createQuestionnaireAnswerEvidence`, `evidence` table, evidence page | partial | Mapped answers create draft evidence rows linked to the generated artifact and control. Evidence page labels AI draft rows as requiring human review. | Reviewer workflow is not implemented. Draft answer evidence must not be used as reviewed evidence until approved by a human. |
| Vendor questionnaire creation | `/vendors/[vendorId]`, `sendVendorQuestionnaireAction`, `createVendorQuestionnaire` | partial | For an authenticated org user and org-owned vendor, creates a `vendor_assessments` row and token link flow. | If email sending is skipped or fails after row creation, the product still needs clearer delivery-state surfacing. |
| Vendor questionnaire token page | `/vendor-assessment/[token]`, `lib/vendors/access.ts` | partial | Token is HMAC-signed from assessmentId, clerkOrgId, and vendorId. Valid tokens load the external questionnaire without Clerk auth. Submission updates the matching `vendor_assessments` row, score, status, and vendor risk metadata. | Tokens do not include expiry/revocation. External submission does not create reviewed evidence/control artifacts. |
| Email deliverability | `lib/vendors/notifications.ts`, `lib/email/client.ts` | blocked/unproven | Uses real Resend API when `RESEND_API_KEY` and `RESEND_FROM` are configured. Uses localized alert templates. | Current environment has not completed a production mailbox smoke. Send helper can skip when not configured; skipped/failed state needs clearer UI treatment. |
| PDF/XLSX export | `/api/questionnaires/export/pdf`, `/api/questionnaires/export/xlsx` | hardened for artifact ownership | Requires authenticated Clerk user+org and server-fetches the generated artifact by ID scoped to `session.orgId`. | Formal export should eventually include the reviewer gate so only approved answers can be exported externally. |

## Sales-Safe Wording

Use:

- “The questionnaire assistant can draft answers from the customer’s Splnit control, evidence, policy, and reviewed citation context when AI is enabled.”
- “If the workspace lacks supporting evidence, it responds conservatively instead of inventing proof.”
- “Generated answers are saved in the workspace artifact history.”
- “Mapped generated answers create draft evidence rows so the workspace has an internal review trail.”
- “Questionnaire answer evidence is AI-generated draft evidence until a human reviews it.”
- “Exports are scoped server-side by generated artifact ownership.”
- “Vendor questionnaires can be created and token links can collect vendor responses; production email delivery needs a configured Resend sender and should be verified before relying on it operationally.”

Do not claim yet:

- “Questionnaire answers are reviewed auditor evidence.”
- “Vendor questionnaire emails are production-deliverable” unless Resend is configured and a mailbox smoke has passed.
- “Only approved questionnaire answers can be externally delivered” until the reviewer workflow is implemented.
- “Provider-backed AI generation has been proven in production” until a real tenant/runtime smoke passes.

## Trackable Gaps Deferred From This Pass

1. **Reviewer workflow.** Approve/edit/flag UI for draft questionnaire answers is not implemented. The `reviewStatus: "draft"` foundation exists, but reviewer actions and approval enforcement are follow-up work.
2. **Vendor questionnaire delivery status.** UI does not clearly surface skipped or failed Resend delivery after vendor assessment creation. Defer delivery-state modeling and UI surfacing.
3. **Richer policy excerpt and legal citation grounding.** The generation prompt receives control status, evidence context, policy context, and reviewed citation context, but reviewed policy excerpts and detailed citation attribution are not fully wired as a reviewer-facing source panel. Defer richer source attribution.
4. **Production Resend mailbox smoke.** No external email has been sent from this environment. Defer until Resend sender configuration and a controlled mailbox are available.
5. **Vendor assessment token expiry/revocation.** Vendor assessment tokens do not yet include expiry or revocation. Defer token hardening.
