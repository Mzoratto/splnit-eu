# Czech Design-Partner NÚKIB Demo Notes

Date: 2026-05-29
Status: partner-safe wording for feedback beta demos, not public marketing copy

## Safe positioning

Use this framing consistently:

> We are showing a NÚKIB registration preparation artifact in feedback beta. It helps collect and review information that may be needed before an official filing. The official filing remains on the NÚKIB portal. We are looking for design-partner feedback before treating this as production-ready.

Short version:

> This is preparation support for NÚKIB registration, not submission automation.

## Explicit boundaries to say out loud

- This is a preparation artifact for customer review.
- This is a feedback beta for Czech design partners.
- Official filing remains on the NÚKIB portal.
- Customer legal/security owners should review the artifact before relying on it.
- Splnit is not providing legal advice through this workflow.
- Splnit is not guaranteeing NÚKIB acceptance or regulatory approval.
- Splnit is not yet claiming an EU-only data path for this workflow.

## Data categories collected or generated

The demo may involve sensitive infrastructure and contact data. Do not ask a prospect to enter real production network topology unless they have approved beta handling.

Documented categories:

- IČO
- organisation/service description
- statutory contacts
- technical contacts
- security contacts
- contact email, phone, role, and position
- domains
- IP ranges/CIDR blocks
- cross-border dependencies
- generated PDF metadata, including artifact ID/title, preparation timestamp, creator user ID, filename, and download/request metadata where logged

## Processor and system wording

Current implementation wording:

- Neon stores the generated registration preparation artifact content in `generated_artifacts`.
- Vercel runtime handles the form/API route and generates the PDF on demand.
- Vercel logs may process request/error metadata depending on platform logging.
- Blob storage is not used by the current route because the PDF is generated on demand and returned directly.

Open and do-not-overclaim wording:

> We are confirming the production Neon region and Vercel runtime/log handling before making a final data-residency statement. Until that is confirmed, we should not describe the workflow as EU-only.

## Demo script guardrails

Say:

- "preparation artifact"
- "feedback beta"
- "design-partner demo"
- "official filing remains on the NÚKIB portal"
- "human review required"
- "data-residency statement is still being confirmed"

Avoid:

- "production-ready filing"
- "we file this for you"
- "legal advice"
- "guaranteed accepted by NÚKIB"
- "EU-only" or "EU-resident" unless the production Neon region, Vercel runtime/data handling, logging, transfer mechanisms, and subprocessors have been verified

## Suggested Q&A

Q: Can this submit to NÚKIB directly?

A: No. This produces a preparation artifact for review. The official filing remains on the NÚKIB portal.

Q: Is this legal advice?

A: No. It is workflow and documentation support. Your legal/security owners should review the content before official use.

Q: Where is this data stored?

A: The application stores the generated preparation artifact in Neon and generates PDFs on demand in Vercel runtime. We are still confirming the exact production Neon region and Vercel runtime/log handling before making a final residency statement.

Q: Is the data path EU-only?

A: We should not claim EU-only until production region, runtime, logging, transfer mechanisms, and subprocessor handling are verified.

Q: Should we enter real IP ranges in the demo?

A: Prefer synthetic or non-sensitive sample data unless the design partner has explicitly approved beta handling for real infrastructure data.
