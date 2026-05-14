# Legal Review Notes

This is an engineering legal-readiness checklist, not legal advice. Counsel must review the public legal pages and final customer contracts before production launch.

## Sources Checked

- EDPB transparency guidance: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/what-information-should-i_en
- EDPB data subject rights guidance: https://www.edpb.europa.eu/sme-data-protection-guide/respect-individuals-rights_en
- EDPB controller/processor guidance: https://www.edpb.europa.eu/sme-data-protection-guide/data-controller-data-processor_en
- EDPB controller-processor contract FAQ: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/what-should-be-included-controller_en
- EDPB record of processing FAQ: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/do-i-need-record-processing_en
- UOOU data subject rights guidance: https://uoou.gov.cz/poradna/poradna-gdpr/prava-subjektu-udaju
- UOOU cookie consent FAQ: https://uoou.gov.cz/casto-kladene-otazky-ohledne-souhlasu-s-cookies-udeleneho-prostrednictvim-tzv-cookie-listy/ds-6912/archiv%3D1%26p1%3D2619

## Changes Made

- Expanded `/soukromi` to cover controller/processor roles, data categories, purposes, legal bases, recipients, international transfers, retention, data subject rights, UOOU complaint rights, and automated decision-making.
- Expanded `/cookies` to distinguish necessary cookies from optional analytics, clarify consent, and add a button to reopen cookie settings.
- Expanded `/dpa` to better mirror GDPR Article 28 processor terms and subprocessors.
- Expanded `/podminky` with stronger service disclaimers, account responsibility, acceptable use, billing, confidentiality, data protection, and termination notes.
- Added `docs/subprocessors.md`, `docs/retention-policy.md`, and `docs/data-processing-map.md` as counsel handoff annexes.
- Added `docs/offboarding-runbook.md` for customer export, deletion sequencing, and residual vendor-retention checks.
- Added `docs/final-czech-legal-review-checklist.md` as the Czech-first publication gate before public legal page updates.
- Gated optional PostHog feature-flag analytics behind accepted cookie consent and removed the unsupported fixed-region claim from pricing FAQ copy.

## Counsel Handoff Annexes

- `docs/subprocessors.md` - vendor/subprocessor register with approval criteria and unresolved production-location/transfer items.
- `docs/retention-policy.md` - proposed data retention schedule, current code enforcement, and deletion/export gaps.
- `docs/data-processing-map.md` - working processing map for purposes, roles, data categories, recipients, retention criteria, and open decisions.
- `docs/offboarding-runbook.md` - manual customer export and offboarding sequence.
- `docs/final-czech-legal-review-checklist.md` - Czech-first publication gate and final P0/P1 blockers before public legal page updates.

## Counsel Must Confirm Before Launch

- Final legal entity name, registered seat, company ID, VAT ID, and contact channels.
- Whether a DPO is legally required or voluntarily appointed.
- Exact production subprocessors, processing locations, transfer mechanisms, and links to each vendor DPA using `docs/subprocessors.md`.
- Final retention schedule for account data, logs, evidence, policies, uploaded files, billing data, and backups using `docs/retention-policy.md`.
- Final export, return, deletion, legal-hold, and residual vendor-retention workflow using `docs/offboarding-runbook.md`.
- Final role matrix and record-of-processing inputs using `docs/data-processing-map.md`.
- Whether product analytics such as PostHog are enabled in production and whether the cookie banner/cookie page fully reflect that setup.
- Final Terms of Service liability cap, SLA language, refund/cancellation rules, governing law, jurisdiction, and consumer/business scope.
- Whether customer-uploaded compliance evidence could include special categories of personal data and what contractual controls are needed.
- Incident notification commitments and support timelines.
