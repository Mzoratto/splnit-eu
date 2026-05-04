# Jurisdiction Architecture Decisions

Last updated: 2026-05-03

This document records the product and schema decisions behind jurisdiction-aware compliance content. These decisions are intentionally conservative: they preserve the current Czech tenant behavior while making Italy and English-EU content possible.

## Decisions

### 1. Active Controls

A control is active for a tenant when it is linked through `framework_controls` to at least one framework that the tenant has enabled.

The canonical `controls` row describes the neutral control objective. The `framework_controls` row describes how that objective maps to a specific framework, jurisdiction, article reference, regulator guidance, localized title, localized description, and evidence requirements.

### 2. Duplicate Controls Across Frameworks

When the same canonical control appears in multiple active frameworks, the product displays it once in the main control work queue.

Framework-specific detail is shown as mappings under that one control. This avoids asking the customer to complete the same operational task multiple times.

### 3. Evidence Reuse

One evidence upload is sufficient for every active framework mapping that uses the same canonical control, unless a specific `framework_controls.evidenceRequirements` value states that additional evidence is required.

Example: one MFA configuration export can support NIS2, ISO 27001, and GDPR mappings for the same MFA control. If an Italian NIS2 mapping later requires a specific incident-notification procedure, that extra requirement belongs on the Italian framework mapping.

### 4. Template Fallbacks

Template resolution uses this order:

1. Exact match: tenant primary jurisdiction and tenant locale.
2. EU fallback: `jurisdiction = 'EU'` and `locale = 'en-EU'`.
3. Hard error with a clear `TemplateNotFoundError`.

The product must not fall back to Czech templates for non-Czech tenants. A Czech legal document shown to an Italian tenant is more dangerous than a blocked generation flow.

### 5. Default Jurisdiction for New Tenants

New tenants should be asked for country during onboarding or signup. If the country is missing, the temporary default remains `CZ` to preserve existing behavior and avoid a data migration surprise.

Stripe billing country may be used later as a suggestion, but it should not silently decide legal jurisdiction. Billing country and regulatory jurisdiction can differ.

### 6. Multiple Jurisdictions

The first implementation stores one primary jurisdiction on `organisations`.

Multiple jurisdictions are a real requirement, but they should be modeled later with a separate organisation-jurisdiction mapping table. The first-stage fields are:

- `country`: operational/billing country hint.
- `primaryJurisdiction`: default regulatory jurisdiction for content resolution.
- `locale`: UI and template locale preference.

This keeps the migration small while avoiding a schema shape that pretends one text field can safely represent a multi-country compliance program.

## Code Implications

- Existing tenants keep `country = 'CZ'`, `primaryJurisdiction = 'CZ'`, and `locale = 'cs-CZ'`.
- Main control lists should group by canonical control, not by framework mapping row.
- Framework detail pages may show multiple mappings and localized guidance.
- Document generation must use a resolver instead of fetching templates directly by type alone.
- Czech-only controls should stay linked only to Czech frameworks.
