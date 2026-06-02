# Entire Codebase Audit Ledger

Created: 2026-06-02

## T0 Inventory

Git status before audit:

```
 M docs/README.md
?? docs/product/implementation-gap-audit.md

```

Tracked top-level counts:

- `lib`: 294
- `app`: 156
- `scripts`: 129
- `docs`: 104
- `.agents`: 75
- `.pi`: 64
- `components`: 47
- `tests`: 31
- `public`: 23
- `memory`: 21
- `.github`: 7
- `inngest`: 7
- `.hermes`: 5
- `i18n`: 4
- `messages`: 3
- `.env.example`: 1
- `.gitignore`: 1
- `.lighthouserc.json`: 1
- `.nvmrc`: 1
- `.vercelignore`: 1
- `.vscode`: 1
- `.woodpecker`: 1
- `AGENTS.md`: 1
- `CLAUDE.md`: 1
- `GEMINI.md`: 1
- `PROJECT_PLAN.md`: 1
- `README.md`: 1
- `drizzle.config.ts`: 1
- `eslint.config.mjs`: 1
- `instrumentation-client.ts`: 1
- `instrumentation.ts`: 1
- `next.config.ts`: 1
- `package-lock.json`: 1
- `package.json`: 1
- `playwright.config.ts`: 1
- `postcss.config.mjs`: 1
- `proxy.ts`: 1
- `sentry.edge.config.ts`: 1
- `sentry.server.config.ts`: 1
- `skills-lock.json`: 1
- `styles`: 1
- `tsconfig.json`: 1
- `vercel.json`: 1

Key route/module counts:

- `app/(app)`: 73
- `app/(marketing)`: 25
- `app/api`: 39
- `lib`: 294
- `components`: 47
- `scripts`: 129
- `tests/e2e`: 26
- `inngest`: 7
- `messages`: 3
- `docs`: 104

Smoke scripts discovered: 88

## Lane Status

| Lane | Auditor | Verifier | Status | Findings | Human approval items | Next dependency |
| --- | --- | --- | --- | ---: | --- | --- |
| 01 | subagent | pending independent verifier | PARTIAL | 5 top risks | status semantics/backfill | Lane 02 before evidence/status implementation |
| 02 | subagent | pending independent verifier | PARTIAL / BLOCKER | 5 top risks | schema/status/backfill/recalc | Owner for evidence/status semantics |
| 03 | subagent | pending independent verifier | PARTIAL | 6 top risks | retention/deletion/Blob policy | Auth/deletion gate for exports/offboarding |
| 04 | subagent | pending independent verifier | PARTIAL | 8 top risks | scheduler/integration claim decisions | Depends on Lane 02/03 for evidence/auth |
| 05 | orchestrator direct | pending independent verifier | PARTIAL | 5 top risks | paid claims/Stripe/live actions | Depends on Lane 06/08/10 |
| 06 | subagent | pending independent verifier | PARTIAL PASS / caveats | 5 top risks | legal/public claim boundaries | Depends on Lane 03/05/10 |
| 07 | subagent | pending independent verifier | PARTIAL | 7 top risks | UX/design priority decisions | Depends on Lane 10 for localized copy |
| 08 | subagent | pending independent verifier | PARTIAL | 7 top risks | CI/deploy migration policy | Owns smoke taxonomy and verifier safety |
| 09 | subagent | pending independent verifier | PARTIAL | 6 top risks | observability/security policy | Depends on Lane 08 for gates |
| 10 | subagent | pending independent verifier | PARTIAL | 7 top risks | CZ/IT framework GTM decisions | Owns i18n/knowledge red smokes |

## Smoke Baseline

| Command | Status | Duration | Summary | Script |
| --- | --- | ---: | --- | --- |
| `npm run smoke:i18n-shell` | fail | 0.4s | operator: 'strictEqual',; diff: 'simple'; }; Node.js v22.22.3 | `tsx scripts/smoke-i18n-shell.ts` |
| `npm run smoke:intake-scope` | fail | 0.3s | operator: 'strictEqual',; diff: 'simple'; }; Node.js v22.22.3 | `tsx scripts/smoke-intake-scope.ts` |
| `npm run smoke:onboarding-status-seeding` | pass | 3.8s | > splnit.eu@0.1.0 smoke:onboarding-status-seeding; > tsx scripts/smoke-onboarding-status-seeding.ts; Onboarding status seeding smoke passed. | `tsx scripts/smoke-onboarding-status-seeding.ts` |
| `npm run smoke:primary-flow` | pass | 6.3s | > splnit.eu@0.1.0 smoke:primary-flow; > tsx scripts/smoke-primary-flow.ts; Primary flow smoke test passed. | `tsx scripts/smoke-primary-flow.ts` |
| `npm run smoke:gap-analysis-artifacts` | pass | 0.3s | > splnit.eu@0.1.0 smoke:gap-analysis-artifacts; > tsx scripts/smoke-gap-analysis-artifacts.ts; Gap analysis artifact smoke passed. | `tsx scripts/smoke-gap-analysis-artifacts.ts` |
| `npm run smoke:generated-artifact-audit` | pass | 0.4s | > splnit.eu@0.1.0 smoke:generated-artifact-audit; > tsx scripts/smoke-generated-artifact-audit.ts; Generated artifact audit smoke passed. | `tsx scripts/smoke-generated-artifact-audit.ts` |
| `npm run smoke:automated-evidence-citations` | pass | 0.8s | - If you want the current behavior, explicitly use 'sslmode=verify-full'; - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'; See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode defini | `tsx scripts/smoke-automated-evidence-citations.ts` |
| `npm run smoke:integration-evidence-policy` | pass | 0.4s | > splnit.eu@0.1.0 smoke:integration-evidence-policy; > tsx scripts/smoke-integration-evidence-policy.ts; Integration evidence policy smoke test passed. | `tsx scripts/smoke-integration-evidence-policy.ts` |
| `npm run smoke:microsoft-callback-dimensional-evidence-source` | pass | 0.3s | > splnit.eu@0.1.0 smoke:microsoft-callback-dimensional-evidence-source; > tsx scripts/smoke-microsoft-callback-dimensional-evidence-source.ts; Microsoft callback dimensional evidence source smoke passed | `tsx scripts/smoke-microsoft-callback-dimensional-evidence-source.ts` |
| `npm run smoke:manual-evidence-dimensions-source` | pass | 0.3s | > splnit.eu@0.1.0 smoke:manual-evidence-dimensions-source; > tsx scripts/smoke-manual-evidence-dimensions-source.ts; manual evidence dimensional source smoke passed | `tsx scripts/smoke-manual-evidence-dimensions-source.ts` |
| `npm run smoke:integration-first-run-enqueue` | pass | 0.5s | ✓ callback enqueue sends the first-run integration test event; ✓ double-fire dedupes the second callback before enqueueing; ✓ per-org/provider lock blocks same org/provider but not other scopes; Integration first-run enqueue behavior smoke  | `tsx scripts/smoke-integration-first-run-enqueue.ts` |
| `npm run smoke:activation-status` | fail | 0.4s | at startWork (/Users/marcozoratto/splnit.eu/node_modules/react-dom/cjs/react-dom-server-legacy.node.development.js:8270:7); at renderToStringImpl (/Users/marcozoratto/splnit.eu/node_modules/react-dom/cjs/react-dom-server-legacy.node.develop | `tsx scripts/smoke-activation-status.tsx` |
| `npm run smoke:api-key-base` | pass | 0.4s | > splnit.eu@0.1.0 smoke:api-key-base; > tsx scripts/smoke-api-key-base.ts; api-key connector base smoke passed | `tsx scripts/smoke-api-key-base.ts` |
| `npm run smoke:abra-flexi-checks` | pass | 0.4s | > splnit.eu@0.1.0 smoke:abra-flexi-checks; > tsx scripts/smoke-abra-flexi-checks.ts; ABRA Flexi checks smoke passed | `tsx scripts/smoke-abra-flexi-checks.ts` |
| `npm run smoke:controls-focus-activation-status-source` | pass | 0.3s | > splnit.eu@0.1.0 smoke:controls-focus-activation-status-source; > tsx scripts/smoke-controls-focus-activation-status-source.ts | `tsx scripts/smoke-controls-focus-activation-status-source.ts` |
| `npm run smoke:microsoft-first-run-enqueue-source` | pass | 0.3s | > splnit.eu@0.1.0 smoke:microsoft-first-run-enqueue-source; > tsx scripts/smoke-microsoft-first-run-enqueue-source.ts; Microsoft first-run enqueue source smoke passed | `tsx scripts/smoke-microsoft-first-run-enqueue-source.ts` |
| `npm run smoke:activation-events-source` | pass | 0.2s | > splnit.eu@0.1.0 smoke:activation-events-source; > tsx scripts/smoke-activation-events-source.ts; Activation event source smoke passed | `tsx scripts/smoke-activation-events-source.ts` |
| `npm run smoke:activation-event-sanitizer` | pass | 0.3s | PASS  Rejects unknown extra key not in per-event allow-list; PASS  Rejects unknown event name at runtime; PASS  Error is ActivationEventSanitizationError instance; 21 assertions: 21 passed, 0 failed. | `tsx scripts/smoke-activation-event-sanitizer.ts` |
| `npm run smoke:sanitizer-rejection` | pass | 0.3s | PASS  provider key is allowed on ConnectorOAuthStarted; PASS  assessmentResult / collectionStatus / testName pass on EvidenceCollected; PASS  blockedReason pass on EvidenceBlocked; 66 assertions: 66 passed, 0 failed. | `tsx scripts/smoke-sanitizer-rejection.ts` |
| `npm run smoke:microsoft365-permission-failures` | pass | 0.3s | > splnit.eu@0.1.0 smoke:microsoft365-permission-failures; > tsx scripts/smoke-microsoft365-permission-failures.ts; Microsoft 365 permission failure smoke test passed. | `tsx scripts/smoke-microsoft365-permission-failures.ts` |
| `npm run smoke:hetzner-checks` | pass | 0.4s | > splnit.eu@0.1.0 smoke:hetzner-checks; > tsx scripts/smoke-hetzner-checks.ts; hetzner checks smoke passed | `tsx scripts/smoke-hetzner-checks.ts` |
| `npm run smoke:aws-checks` | pass | 0.6s | > splnit.eu@0.1.0 smoke:aws-checks; > tsx scripts/smoke-aws-checks.ts; aws connector checks smoke passed | `tsx scripts/smoke-aws-checks.ts` |
| `npm run smoke:ovhcloud-checks` | pass | 0.4s | > splnit.eu@0.1.0 smoke:ovhcloud-checks; > tsx scripts/smoke-ovhcloud-checks.ts; ovhcloud checks smoke passed | `tsx scripts/smoke-ovhcloud-checks.ts` |
| `npm run smoke:policy-drafts` | pass | 0.4s | > splnit.eu@0.1.0 smoke:policy-drafts; > tsx scripts/smoke-policy-drafts.ts; Policy draft smoke test passed. | `tsx scripts/smoke-policy-drafts.ts` |
| `npm run smoke:incident-notifications` | pass | 0.5s | > splnit.eu@0.1.0 smoke:incident-notifications; > tsx scripts/smoke-incident-notifications.ts; Incident notification smoke test passed. | `tsx scripts/smoke-incident-notifications.ts` |
| `npm run smoke:questionnaire-artifacts` | pass | 0.3s | > splnit.eu@0.1.0 smoke:questionnaire-artifacts; > tsx scripts/smoke-questionnaire-artifacts.ts; Questionnaire artifact smoke passed. | `tsx scripts/smoke-questionnaire-artifacts.ts` |
| `npm run smoke:questionnaire-citations` | pass | 0.3s | > splnit.eu@0.1.0 smoke:questionnaire-citations; > tsx scripts/smoke-questionnaire-citations.ts; Questionnaire citation guard smoke passed. | `tsx scripts/smoke-questionnaire-citations.ts` |
| `npm run smoke:questionnaire-provider` | pass | 0.3s | > splnit.eu@0.1.0 smoke:questionnaire-provider; > tsx scripts/smoke-questionnaire-provider.ts; Questionnaire provider config smoke passed.; Questionnaire provider runtime smoke skipped: AI config is not enabled/configured. | `tsx scripts/smoke-questionnaire-provider.ts` |
| `npm run smoke:questionnaire-review-gate` | pass | 0.3s | > splnit.eu@0.1.0 smoke:questionnaire-review-gate; > tsx scripts/smoke-questionnaire-review-gate.ts; Questionnaire review gate smoke passed. | `tsx scripts/smoke-questionnaire-review-gate.ts` |
| `npm run smoke:questionnaire-review-patching` | pass | 0.3s | > splnit.eu@0.1.0 smoke:questionnaire-review-patching; > tsx scripts/smoke-questionnaire-review-patching.ts; Questionnaire review patching smoke passed. | `tsx scripts/smoke-questionnaire-review-patching.ts` |
| `npm run smoke:stripe-billing` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/smoke-stripe-billing-runtime.ts` |
| `npm run smoke:stripe-upgrade-flow` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/smoke-stripe-upgrade-flow.ts` |
| `npm run smoke:stripe-invoice-email` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/smoke-stripe-invoice-email.ts` |
| `npm run smoke:plan-gate-bypass` | pass | 0.4s | > splnit.eu@0.1.0 smoke:plan-gate-bypass; > tsx scripts/smoke-plan-gate-bypass.ts; plan gate bypass smoke passed | `tsx scripts/smoke-plan-gate-bypass.ts` |
| `npm run smoke:plan-gate-enforcement` | pass | 0.4s | > splnit.eu@0.1.0 smoke:plan-gate-enforcement; > tsx scripts/smoke-plan-gate-enforcement.ts; plan gate enforcement smoke passed | `tsx scripts/smoke-plan-gate-enforcement.ts` |
| `npm run smoke:vendor-questionnaire-delivery-status` | pass | 0.3s | > splnit.eu@0.1.0 smoke:vendor-questionnaire-delivery-status; > tsx scripts/smoke-vendor-questionnaire-delivery-status.ts; Vendor questionnaire delivery status smoke passed. | `tsx scripts/smoke-vendor-questionnaire-delivery-status.ts` |
| `npm run smoke:seo` | pass | 0.3s | > splnit.eu@0.1.0 smoke:seo; > tsx scripts/smoke-seo.ts; SEO smoke passed with 103 sitemap entries. | `tsx scripts/smoke-seo.ts` |
| `npm run smoke:copy-hygiene` | pass | 0.4s | > splnit.eu@0.1.0 smoke:copy-hygiene; > tsx scripts/smoke-copy-hygiene.ts; Copy hygiene smoke test passed. | `tsx scripts/smoke-copy-hygiene.ts` |
| `npm run smoke:demo-routes` | fail | 0.3s | port: 3000; }; }; Node.js v22.22.3 | `tsx scripts/smoke-demo-routes.ts` |
| `npm run smoke:training-module` | pass | 1.2s | > splnit.eu@0.1.0 smoke:training-module; > tsx scripts/smoke-training-module.ts; training module smoke passed | `tsx scripts/smoke-training-module.ts` |
| `npm run smoke:pohoda-workspace-config` | pass | 0.3s | > splnit.eu@0.1.0 smoke:pohoda-workspace-config; > tsx scripts/smoke-pohoda-workspace-config.ts; Pohoda workspace config smoke passed | `tsx scripts/smoke-pohoda-workspace-config.ts` |
| `npm run smoke:abra-flexi-workspace-config` | pass | 0.3s | > splnit.eu@0.1.0 smoke:abra-flexi-workspace-config; > tsx scripts/smoke-abra-flexi-workspace-config.ts; ABRA Flexi workspace config smoke passed | `tsx scripts/smoke-abra-flexi-workspace-config.ts` |
| `npm run smoke:money-s3-workspace-config` | pass | 0.3s | Controls: 16; nis2ArticleRef: present on all 16 controls; ZoKB metadata: present on all 16 controls; Pohoda-specific terms: none found; Layer 4 e-commerce/REST refs: all 4 controls pass | `tsx scripts/smoke-money-s3-workspace-config.ts` |
| `npm run smoke:hetzner-workspace-config` | pass | 0.3s | > splnit.eu@0.1.0 smoke:hetzner-workspace-config; > tsx scripts/smoke-hetzner-workspace-config.ts; hetzner workspace config smoke passed | `tsx scripts/smoke-hetzner-workspace-config.ts` |
| `npm run smoke:hetzner-live-key` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/smoke-hetzner-live-key.ts` |
| `npm run smoke:aws-live-key` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/smoke-aws-live-key.ts` |
| `npm run smoke:aws-workspace-config` | pass | 0.3s | > splnit.eu@0.1.0 smoke:aws-workspace-config; > tsx scripts/smoke-aws-workspace-config.ts; aws workspace config smoke passed | `tsx scripts/smoke-aws-workspace-config.ts` |
| `npm run smoke:ovhcloud-workspace-config` | pass | 0.3s | > splnit.eu@0.1.0 smoke:ovhcloud-workspace-config; > tsx scripts/smoke-ovhcloud-workspace-config.ts; ovhcloud workspace config smoke passed | `tsx scripts/smoke-ovhcloud-workspace-config.ts` |
| `npm run smoke:compliance-report` | pass | 2.3s | > splnit.eu@0.1.0 smoke:compliance-report; > tsx scripts/smoke-compliance-report.ts; Compliance report smoke passed | `tsx scripts/smoke-compliance-report.ts` |
| `npm run smoke:helios-workspace-config` | pass | 0.3s | nis2ArticleRef: present on all 19 controls; ZoKB metadata: present on all 19 controls; Layer 2 (iam) manufacturing role hierarchy: all 5 controls reference correct roles; Layer 4 (api_connectivity) MES/SCADA/EDI refs: all three integration  | `tsx scripts/smoke-helios-workspace-config.ts` |
| `npm run smoke:remediation-tasks` | pass | 1.2s | > splnit.eu@0.1.0 smoke:remediation-tasks; > tsx scripts/smoke-remediation-tasks.ts; Remediation task smoke passed. | `tsx scripts/smoke-remediation-tasks.ts` |
| `npm run smoke:helios-evidence-lifecycle` | pass | 2.6s | > splnit.eu@0.1.0 smoke:helios-evidence-lifecycle; > tsx scripts/smoke-helios-evidence-lifecycle.ts; Helios evidence lifecycle smoke passed. | `tsx scripts/smoke-helios-evidence-lifecycle.ts` |
| `npm run smoke:helios-gap-remediation` | pass | 1.3s | > splnit.eu@0.1.0 smoke:helios-gap-remediation; > tsx scripts/smoke-helios-gap-remediation.ts; Helios gap remediation smoke passed. | `tsx scripts/smoke-helios-gap-remediation.ts` |
| `npm run smoke:helios-evidence-provenance` | pass | 3.5s | manual evidence type: attestation_answers; csv evidence type: helios_csv_import; csv provenance: customer_reported_csv_template; workspace completed controls: 2; cleanup org_smoke_helios_provenance_ce6e7753-c837-4ff1-8dbd-e9a6b9385646: orga | `tsx scripts/smoke-helios-evidence-provenance.ts` |
| `npm run smoke:helios-live-attestation` | pass | 3.6s | assessment result: manual_review; workspace completed controls before: 0; workspace completed controls after: 1; IAM control has evidence: true; cleanup org_smoke_helios_attestation_cd4f9852-d9da-43ef-8343-448367733a36: organisations=0, evi | `tsx scripts/smoke-helios-live-attestation.ts` |
| `npm run smoke:helios-agency-progress` | pass | 4.0s | client org: helios_agency_progress_3025f6d6-7d6b-48ee-ad2f-47e03bb0a259_client; platform: helios; completed controls: 1; overall completion: 0.05263157894736842%; cleanup helios_agency_progress_3025f6d6-7d6b-48ee-ad2f-47e03bb0a259_client: o | `tsx scripts/smoke-helios-agency-progress.ts` |
| `npm run smoke:helios-csv-parser` | pass | 0.3s | > splnit.eu@0.1.0 smoke:helios-csv-parser; > tsx scripts/smoke-helios-csv-parser.ts; smoke:helios-csv-parser ok | `tsx scripts/smoke-helios-csv-parser.ts` |
| `npm run smoke:helios-csv-import` | pass | 5.3s | > splnit.eu@0.1.0 smoke:helios-csv-import; > tsx scripts/smoke-helios-csv-import.ts; smoke:helios-csv-import ok org=org_helios_csv_smoke_1780387629904 parsed=11 created=11 gaps=9 manual_review=2; cleanup org_helios_csv_smoke_1780387629904:  | `tsx scripts/smoke-helios-csv-import.ts` |
| `npm run smoke:helios-control-seeding` | pass | 4.6s | canonical keys: 19; controls present: 19; NIS2 mappings present: 19; idempotency: verified across two targeted seed runs; immutable key guard: verified missing-key failure | `tsx scripts/smoke-helios-control-seeding.ts` |
| `npm run smoke:policy-evidence-loop` | pass | 0.4s | > splnit.eu@0.1.0 smoke:policy-evidence-loop; > tsx scripts/smoke-policy-evidence-loop.ts; Policy-to-evidence loop smoke test passed. | `tsx scripts/smoke-policy-evidence-loop.ts` |
| `npm run smoke:evidence-state-transitions` | pass | 0.3s | > splnit.eu@0.1.0 smoke:evidence-state-transitions; > tsx scripts/smoke-evidence-state-transitions.ts; Evidence state transition smoke test passed. | `tsx scripts/smoke-evidence-state-transitions.ts` |
| `npm run smoke:authenticated-primary-flow` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/smoke-authenticated-primary-flow.ts` |
| `npm run smoke:production-tenant-readiness` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/smoke-production-tenant-readiness.ts` |
| `npm run smoke:production-tenant-readiness-prereqs` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/smoke-production-tenant-readiness-prereqs.ts` |
| `npm run smoke:production-tenant-readiness-source` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/smoke-production-tenant-readiness-source.ts` |
| `npm run smoke:production-intake-profile` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/smoke-production-intake-profile.ts` |
| `npm run smoke:production-migration-guard` | blocked | 0 | env/prod-sensitive smoke not run in audit T0 | `tsx scripts/run-production-migrations-safe.ts --self-test` |
| `npm run smoke:trust-center-settings` | pass | 0.3s | > splnit.eu@0.1.0 smoke:trust-center-settings; > tsx scripts/smoke-trust-center-settings.ts; Trust Center settings smoke passed. | `tsx scripts/smoke-trust-center-settings.ts` |
| `npm run smoke:trust-center-public-disclosure` | pass | 0.2s | > splnit.eu@0.1.0 smoke:trust-center-public-disclosure; > tsx scripts/smoke-trust-center-public-disclosure.ts; Trust Center public disclosure smoke passed. | `tsx scripts/smoke-trust-center-public-disclosure.ts` |
| `npm run smoke:weekly-digest-edge-cases` | pass | 0.4s | > splnit.eu@0.1.0 smoke:weekly-digest-edge-cases; > tsx scripts/smoke-weekly-digest-edge-cases.ts; Weekly digest edge-case smoke passed. | `tsx scripts/smoke-weekly-digest-edge-cases.ts` |
| `npm run smoke:public-module-seams` | pass | 0.4s | > splnit.eu@0.1.0 smoke:public-module-seams; > tsx scripts/smoke-public-module-seams.ts; Public module seam smoke passed. | `tsx scripts/smoke-public-module-seams.ts` |
| `npm run smoke:export-endpoints-source` | pass | 0.3s | > splnit.eu@0.1.0 smoke:export-endpoints-source; > tsx scripts/smoke-export-endpoints-source.ts; Export endpoint source smoke passed. | `tsx scripts/smoke-export-endpoints-source.ts` |
| `npm run smoke:org-boundaries` | pass | 5.4s | > splnit.eu@0.1.0 smoke:org-boundaries; > tsx scripts/smoke-org-boundaries.ts; Org-boundary smoke passed. | `tsx scripts/smoke-org-boundaries.ts` |
| `npm run smoke:agency-model` | pass | 4.0s | > splnit.eu@0.1.0 smoke:agency-model; > tsx scripts/smoke-agency-model.ts; Agency model smoke passed. | `tsx scripts/smoke-agency-model.ts` |
| `npm run smoke:agency-invite-client-cache` | pass | 0.3s | > splnit.eu@0.1.0 smoke:agency-invite-client-cache; > tsx scripts/smoke-agency-invite-and-client-cache.ts; agency invite selection and client cache smoke passed | `tsx scripts/smoke-agency-invite-and-client-cache.ts` |
| `npm run smoke:draft-extraction-sources` | pass | 0.7s | - If you want the current behavior, explicitly use 'sslmode=verify-full'; - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'; See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode defini | `tsx scripts/smoke-draft-extraction-sources.ts` |
| `npm run smoke:nukib-baseline` | pass | 0.4s | > splnit.eu@0.1.0 smoke:nukib-baseline; > tsx scripts/smoke-nukib-baseline.ts; NÚKIB baseline smoke passed | `tsx scripts/smoke-nukib-baseline.ts` |
| `npm run smoke:italian-tenant` | fail | 0.8s | actual: 'Feed NÚKIB',; expected: 'NÚKIB feed',; operator: 'strictEqual',; diff: 'simple'; } | `tsx scripts/smoke-tenant-locales.ts` |
| `npm run smoke:italian-gdpr-layer` | fail | 0.7s | actual: undefined,; expected: true,; operator: '==',; diff: 'simple'; } | `tsx scripts/smoke-italian-gdpr-layer.ts` |
| `npm run smoke:tenant-locales` | fail | 0.8s | actual: 'Feed NÚKIB',; expected: 'NÚKIB feed',; operator: 'strictEqual',; diff: 'simple'; } | `tsx scripts/smoke-tenant-locales.ts` |
| `npm run smoke:jurisdictions` | pass | 0.3s | > splnit.eu@0.1.0 smoke:jurisdictions; > tsx scripts/smoke-jurisdiction-context.ts; Jurisdiction context smoke test passed. | `tsx scripts/smoke-jurisdiction-context.ts` |
| `npm run smoke:italian-nis2-layer` | fail | 0.7s | actual: 0,; expected: 44,; operator: 'strictEqual',; diff: 'simple'; } | `tsx scripts/smoke-italian-nis2-layer.ts` |
| `npm run smoke:knowledge-layer` | pass | 1.0s | - If you want the current behavior, explicitly use 'sslmode=verify-full'; - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'; See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode defini | `tsx scripts/report-knowledge-counts.ts --smoke` |
| `npm run smoke:mapping-review-schema` | pass | 0.9s | - If you want the current behavior, explicitly use 'sslmode=verify-full'; - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'; See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode defini | `tsx scripts/smoke-mapping-review-schema.ts` |
| `npm run smoke:nis2-evidence-templates` | fail | 0.7s | actual: [Array],; expected: [],; operator: 'deepStrictEqual',; diff: 'simple'; } | `tsx scripts/smoke-nis2-evidence-templates.ts` |
| `npm run smoke:reviewed-article-links` | pass / WEAK GREEN before T4; corrected gate now fails on zero reviewed rows | 0.7s | T0 pass was misleading because no reviewed article rows existed. T4-B changed the smoke to fail on empty reviewed-row baselines and require local/disposable DB. | `tsx scripts/smoke-reviewed-article-links.ts` |
| `npm run smoke:source-documents` | pass | 0.8s | - If you want the current behavior, explicitly use 'sslmode=verify-full'; - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'; See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode defini | `tsx scripts/smoke-source-documents.ts` |
| `npm run smoke:templates` | pass | 0.3s | > splnit.eu@0.1.0 smoke:templates; > tsx scripts/smoke-template-resolution.ts; Policy template resolution smoke test passed. | `tsx scripts/smoke-template-resolution.ts` |

## Shared-File Conflict Registry

| File/symbol | Lanes claiming it | Proposed changes | Owner lane | Dependent lanes | Conflict status | Resolution |
| --- | --- | --- | --- | --- | --- | --- |

## T0 Standard Baseline

| Command | Status | Duration |
| --- | --- | ---: |
| `npm run typecheck` | pass | 5s |
| `npm run lint` | pass | 5s |
| `npm run build` | pass | 31s |


## T3 Synthesis Summary

Synthesis report: `docs/audits/entire-codebase-audit-synthesis.md`.

Executive verdict: codebase is meaningfully implemented but not uniformly production-ready. Highest-risk blockers are evidence/status semantics, retention/offboarding/Blob cleanup, DB-smoke safety, entitlement/public proof alignment, and localization/knowledge red-smoke repair.

## Shared-File Conflict Registry

| File / symbol / table | Claimed by lanes | Owner lane | Conflict status |
| --- | --- | --- | --- |
| `lib/db/queries/evidence.ts` | 01, 02, 04, 06 | 02 | RESOLVED for T4-A manual evidence propagation; future import/integration semantics still Lane 02-owned |
| `orgControlStatuses` | 01, 02, 04, 06 | 02 | RESOLVED for T4-A manual evidence propagation; future backfill/import semantics still Lane 02-owned |
| `lib/db/schema.ts` | 02, 03, 05, 08 | split by migration purpose | SPLIT / human approval |
| export/report routes | 03, 05, 06, 08 | route-specific | OPEN |
| `lib/stripe/plans.ts` | 05, 06, 08, 10 | 05 | OPEN |
| `docs/product/business-entitlement-matrix.md` | 05, 06, 10 | 05 | OPEN |
| `components/marketing/pricing-widgets.tsx` | 05, 06, 07, 10 | 06 public claims / 05 runtime alignment | OPEN |
| `messages/*` | 05, 06, 07, 10 | 10 | OPEN |
| `scripts/smoke-*` | all lanes | 08 | OPEN: includes weak-gate labeling and pg SSL-mode normalization |
| `scripts/smoke-reviewed-article-links.ts` | 08, 10 | 10 knowledge assertion / 08 harness | CORRECTED in T4-B: old T0 pass was weak green; updated smoke fails on zero reviewed rows and refuses non-local DBs |
| `.woodpecker/vercel.yml` | 08, 09 | 08 | P0 OPEN: no production tranche deploy through Woodpecker until guarded wrapper or ops sign-off |
| `vercel.json` cron routes | 04, 08, 09 | 04 | OPEN |
| Trust Center public API/UI | 03, 06, 07, 10 | 06 disclosure / 03 access | OPEN |

Escalation rule: if T3 cannot assign a clear owner lane for a shared file, escalate to human approval before any implementation plan for it is written.

## Cross-Lane Gates

- Lane 02 and Lane 03 must be GREEN or PARTIAL-with-accepted-risk before finalizing implementation plans touching evidence/status/schema/export routes.
- Lane 05 and Lane 06 must approve paid/public pricing, plan names, buyer-proof entitlements, and paid-readiness claims.
- Lane 08 owns smoke taxonomy, local DB safety, weak-green gate labeling, pg SSL-mode normalization/documentation, and CI/deploy gate reliability before implementation tranches rely on smokes.
- Lane 10 owns localized public/regulatory wording before customer-facing copy changes are accepted.
- Production DB migrations, production seeds/backfills, production Blob operations, live Stripe actions, deploys, and legal/public-claim decisions require human approval.


## T4 Dispatch Gates Added After Review

- `smoke:reviewed-article-links` is a known weak green: it passes vacuously when no reviewed article rows exist. Do not treat it as proof of reviewed article coverage until strengthened.
- `.woodpecker/vercel.yml` bare `npm run db:migrate` is a named P0 production-deploy gate. No production implementation tranche should deploy through Woodpecker until the guarded wrapper is used or ops/human sign-off accepts the risk.
- DB-backed smokes repeatedly emit pg SSL-mode warnings around `sslmode=require` / `uselibpqcompat`; T4-B must normalize to `sslmode=verify-full` where appropriate or document the accepted configuration.




## T4-C Pre-Start Approval Gate

Before dispatching any T4-C implementation work for retention/offboarding/right-to-erasure or Blob cleanup:

- Resolve or explicitly defer with accepted risk the stale existing `unknown` status decision: targeted repair/backfill vs leave until re-attestation/new evidence. If deferred, record whether T4-C must coordinate with a later status repair job.
- Resolve or explicitly defer with accepted legal/ops risk the retention/audit-log deletion policy and legal wording. This is core T4-C scope; do not implement final deletion/Blob cleanup behavior before the policy is accepted or the risk is recorded.

## T4-A/T4-B Decision Log

- Human-approved T4-A canonical mapping: manual evidence `gap` maps to existing control status `fail`; this tranche does not add a first-class `gap` control status.
- Manual evidence propagation rollback flag documented in `docs/operations/evidence-status-propagation-runbook.md`: `SPLNIT_MANUAL_EVIDENCE_STATUS_PROPAGATION=disabled` (`disabled`, `false`, `0` accepted) preserves legacy `unknown` status behavior and skips score recalculation.
- T4-B reviewed-article gate correction: T0 `smoke:reviewed-article-links` pass is classified as WEAK GREEN/false green; the updated smoke fails when no reviewed article rows exist and refuses non-local DBs.
