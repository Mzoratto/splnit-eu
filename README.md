# Splnit.eu

Czech compliance automation platform for NIS2, EU AI Act, GDPR, and ISO 27001.

This scaffold implements the first reusable platform layer from the blueprint:

- Next.js 15 App Router with Clerk-ready protected routes
- next-intl configuration with Czech and English message catalogs
- Drizzle/Neon schema for organisations, frameworks, controls, tests, evidence, policies, vendors, risks, incidents, and Trust Center
- Global control library with cross-framework mappings
- AI Act references and Annex III categories from the supplied PDFs
- Czech policy templates for `ai_policy`, `training_log`, and `record_of_use`
- Microsoft 365 adapter for MFA, Conditional Access, privileged roles, guests, training, and sensitivity labels
- Inngest function skeletons for test runs, evidence expiry, and regulation updates

## Getting Started

Copy `.env.example` to `.env.local`, then fill in service keys as needed.

For UI-only development, the app runs without Clerk and Neon keys and shows demo data.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm run typecheck
npm run lint
npm run build
npm run db:generate
```

## Project Shape

Core modules:

- `lib/db/schema.ts` - Drizzle schema
- `lib/controls/library.ts` - global controls and cross-mappings
- `lib/frameworks/ai-act.ts` - AI Act article and Annex III reference data
- `lib/integrations/runner.ts` - org-scoped test runner
- `lib/integrations/microsoft365/tests.ts` - Microsoft Graph checks
- `lib/policies/templates.ts` - Czech template definitions

Main routes:

- `/` - marketing page
- `/dashboard` - protected app shell demo
- `/frameworks`, `/controls`, `/evidence`, `/integrations`, `/policies`
- `/trust/demo` - public Trust Center demo

## Notes

Database clients and service SDKs are initialized lazily so `next build` does not crash when production environment variables are absent.

## Vercel and DNS

Production should point `splnit.eu` at the Vercel project:

- Apex `A` record: `76.76.21.21`
- `www` CNAME: `cname.vercel-dns.com`
- Production app URL: `https://splnit.eu`
