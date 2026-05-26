# AGENTS.md

Canonical operating instructions for AI coding agents in this repository. Read this before every task.

**Working code only. Finish the job. Plausibility is not correctness.**

`AGENTS.md` is the source of truth. `CLAUDE.md` should stay as a shim that points to this file (`@AGENTS.md`), and `GEMINI.md` should stay linked to this file.

---

## 0. Project Reality

Splnit.eu is a solo-developer EU compliance automation product for NIS2, GDPR, ISO 27001, and related workflows. The current strategy is Czech first (cs-CZ default), English-EU second, Italian tertiary.

Hard truth rules:

- Never fabricate customers, testimonials, logos, advisor names, metrics, uptime, certifications, or review status.
- Never reference `Splnit Technology s.r.o.`. It does not exist. Use the real OSVC/operator identity supplied by the owner.
- Never claim coverage for a regulation unless the controls/templates/sources actually exist in the knowledge base.
- Never ship public legal text, privacy text, T&Cs, DPA wording, or entity identifiers with placeholders or wrong party names.
- Trust Center pages must never expose individual control IDs, evidence filenames, test timing details, or attacker-useful implementation details publicly.
- If proof is missing, say it is missing and build the honest smaller version.
- Czech market context: NIS2 transposed via Act 264/2025 Coll. (in force Nov 2025). Czech-specific document output is mapped to Vyhláška č. 410/2025 Sb. Native integrations with Pohoda, Money S3, Helios, ABRA Flexi are the primary competitive moat. NÚKIB is the Czech cybersecurity authority; ÚOOÚ is the Czech data protection authority.

---

## 1. Non-Negotiables

1. No flattery, no filler. Start with the action or answer.
2. Disagree when the premise is wrong. Do not politely reinforce false assumptions.
3. Never fabricate file paths, commands, test results, commit hashes, APIs, or deployment state.
4. Stop and ask only when there are two materially different interpretations that cannot be resolved by reading the repo.
5. Touch only what the request requires. No drive-by refactors or formatting churn.
6. Do not revert or overwrite user changes unless explicitly asked.
7. Never edit `.next/`, `node_modules/`, generated `next-env.d.ts`, or generated migration metadata unless intentionally changing schema.

---

## 2. Skill Usage

Project skills live in `.agents/skills/<skill-name>/SKILL.md`. They are workflows, not background reading.

Use skills selectively:

- New feature or significant change: `spec-driven-development`, then `planning-and-task-breakdown` if scope is not obvious.
- Multi-file implementation: `incremental-implementation`.
- Logic changes, bug fixes, or behavior changes: `test-driven-development` when practical.
- UI work: `frontend-ui-engineering` plus browser verification.
- API, schema, or public interface changes: `api-and-interface-design`.
- Debugging failures: `debugging-and-error-recovery`.
- Security/auth/data exposure work: `security-and-hardening`.
- Performance work: `performance-optimization`.
- Pre-merge review: `code-review-and-quality`.
- Deployment/release work: `shipping-and-launch` and `ci-cd-and-automation` where relevant.

Do not load all skills at once. Read only the `SKILL.md` that applies and only the referenced files needed for the task. If a skill says to do something that conflicts with this file or the user's request, follow this file and explain the conflict briefly.

The local `agent-skills/` clone is ignored and is only an upstream source copy. Do not edit or commit it directly; copy intentional updates into `.agents/skills/`.

---

## 3. Standard Workflow

Before editing:

- Inspect `git status --short`.
- Read the files you will touch and the nearby callers/importers.
- State a short plan for non-trivial work.
- Define how you will verify the change.

While editing:

- Prefer existing patterns, helpers, and design tokens over new abstractions.
- Use `apply_patch` for manual edits.
- Keep changes surgical and reviewable.
- Add comments only when they explain non-obvious intent.

After editing:

- Run the narrowest meaningful checks first.
- For runtime app changes, normally run `npm run typecheck`, `npm run lint`, and `npm run build` before committing.
- For UI changes, verify in a browser and check at least desktop and mobile widths.
- For DB schema changes, run `npm run db:generate` and `npm run db:migrate` when a local `DATABASE_URL` is available. If it is not available, state that clearly.
- Commit only intentional changes with a descriptive message.
- Push/deploy only when the user asks or the current task explicitly includes it.

---

## 4. Stack And Commands

Stack:

- TypeScript 5, React 19.2.4, Next.js 15.5 App Router, Tailwind CSS 4
- Clerk, Drizzle ORM, Neon/Postgres, next-intl, Inngest, Vercel
- Package manager: npm

Commands:

- Install: `npm install`
- Dev server: `npm run dev`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`
- E2E all: `npm run test:e2e`
- E2E single: `npx playwright test tests/e2e/<file>.spec.ts`
- Generate DB migrations: `npm run db:generate`
- Apply DB migrations: `npm run db:migrate`
- Seed DB: `npm run db:seed`
- Production deploy: `npm run deploy` (runs the production migration drift gate before `vercel deploy --prod --yes`)

Prefer targeted checks during iteration. Run full checks before a commit or deploy when the blast radius is non-trivial.

---

## 5. Repository Layout

- `app/` - Next.js App Router routes and route handlers
- `app/(marketing)` - public marketing pages
- `app/(app)` - authenticated app pages
- `components/` - shared React components
- `lib/` - domain logic, DB queries, integrations, framework data
- `messages/` - next-intl locale messages
- `inngest/` - background jobs
- `styles/` - design tokens and global styles
- `tests/e2e/` - Playwright tests
- `docs/` - architecture notes, plans, reviews
- `.agents/skills/` - local agent workflow skills

Conventions:

- Use `@/*` imports.
- Keep DB/service clients lazily initialized. Do not initialize Neon, Drizzle, Redis, Resend, Stripe, or similar SDKs at module scope if it can break `next build` without runtime env vars.
- Route handlers return `NextResponse.json(...)` for JSON APIs.
- App Router pages are Server Components by default. Push client components as far down the tree as possible.

---

## 6. Frontend And Product Rules

- Use existing design tokens from `styles/design-tokens.css` and established components before adding new UI primitives.
- Cards use max `--r-lg` unless an existing component requires otherwise.
- Use lucide icons when an icon exists.
- Do not create marketing-only landing pages when the request is for an app/tool/workflow; build the usable surface.
- Text must not overflow or overlap on mobile or desktop.
- Public Trust Center pages show category-level aggregates only, never individual controls.
- Public copy must be honest, jurisdiction-aware, and free of fake proof.
- Default locale is cs-CZ (no URL prefix). Never set it-IT or en-EU as the default locale. Language switcher must be present in nav on all public pages.
- Never hardcode Stripe plan names or prices in UI components — read them from lib/stripe/plans.ts PLANS constant.

---

## 7. Git, Deploy, And Safety

- Work on the current branch unless asked otherwise.
- Never use destructive Git commands (`git reset --hard`, `git checkout --`, force pushes) unless explicitly requested.
- Ignore unrelated dirty files. If touched files contain user changes, read carefully and preserve them.
- Commit messages should be specific, imperative, and under 72 characters in the subject.
- After deploying, verify the production URL that was actually aliased by Vercel.

---

## 8. Communication

- Be direct and concise.
- Share brief progress updates during longer work.
- Report what changed, what was verified, commit hash, and deployment URL/ID when relevant.
- If something could not be verified, say exactly why.
- Do not end with vague offers; suggest concrete next steps only when useful.

---

## 9. Project Learnings

Add one-line corrections here when the user catches a repeatable process mistake. Keep entries concrete and prune obsolete ones.

- Trust/demo and Trust Center detail pages must include a route back to the Splnit.eu homepage.
