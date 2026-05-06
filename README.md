# Splnit.eu

EU compliance automation for NIS2, GDPR, EU AI Act, ISO 27001, and related evidence workflows.

Current strategy: Italy first, English-EU second, Czech tertiary. See [PROJECT_PLAN.md](PROJECT_PLAN.md) for the canonical current state, blockers, and next work order.

The app currently includes:

- Next.js 15 App Router with Clerk auth boundaries.
- next-intl marketing/app localization for Czech, English, and Italian.
- Drizzle/Neon schema for organisations, frameworks, controls, tests, evidence, policies, vendors, risks, incidents, generated artifacts, questionnaires, and Trust Center.
- Public marketing, legal, security/status, Trust Center, and NIS2 scoping routes.
- Authenticated app routes for dashboard, controls, frameworks, evidence, integrations, policies, vendors, risks, incidents, questionnaires, team, clients, and settings.
- Microsoft 365, GitHub, and AWS integration surfaces and test-run infrastructure.
- Static knowledge/source-document scripts and mapping-review agent scripts.

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

For database-backed work, set `DATABASE_URL` in `.env.local` before running migrations, seeds, or knowledge-import scripts.

## Project Shape

Core modules:

- `lib/db/schema.ts` - Drizzle schema
- `lib/controls/` - control library and categorization
- `lib/frameworks/` - framework metadata and mappings
- `lib/integrations/runner.ts` - org-scoped test runner
- `lib/integrations/microsoft365/tests.ts` - Microsoft Graph checks
- `lib/policies/` - policy/template resolution
- `lib/agents/mapping-review/` - offline mapping-review agent pipeline

Main routes:

- `/` - localized marketing page
- `/platform`, `/predpisy`, `/blog`, `/pricing`, `/early-access`, `/about`
- `/it/strumenti/nis2-scope` - public Italian NIS2 scoping tool
- `/dashboard` - protected app shell
- `/frameworks`, `/controls`, `/evidence`, `/integrations`, `/policies`, `/vendors`, `/risks`, `/incidents`, `/questionnaires`
- `/trust/[orgSlug]` - public Trust Center

## Notes

Database clients and service SDKs are initialized lazily so `next build` does not crash when production environment variables are absent.

Historical plans and premature playbooks are archived under `docs/archive/`. Do not treat archived files as current priorities unless `PROJECT_PLAN.md` explicitly revives them.

## Vercel and DNS

Production should point `splnit.eu` at the Vercel project:

- Apex `A` record: `76.76.21.21`
- `www` CNAME: `cname.vercel-dns.com`
- Production app URL: `https://splnit.eu`
