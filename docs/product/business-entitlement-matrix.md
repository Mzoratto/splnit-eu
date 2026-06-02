# Business Entitlement Matrix — ARCHIVED / SUPERSEDED

Last updated: 2026-06-02

This document is archived. It is retained only as historical Business-era context and must not be used as the current plan, pricing, entitlement, sales, or implementation source.

Current source: `docs/product/plan-entitlement-matrix.md`
Runtime source: `lib/stripe/plans.ts`

Current public plan model:

- Free
- SME
- Agency

Business, Starter, and Consultant are legacy aliases only. The runtime compatibility mapping is maintained in `lib/stripe/plans.ts`; these names are not current public plan names.

Do not rely on the old limits or claims that previously appeared in this file (for example Business-era 5-framework / 10-integration / vendor-count assumptions). Use the current matrix and runtime `PLANS` constant instead.
