# Tranche 9 Audit: Live Demo Mode

## Middleware and Clerk

- `middleware.ts` uses `clerkMiddleware` plus `createRouteMatcher` with an explicit `protectedRoutes` list.
- Auth is enforced only when Clerk is configured and `isProtectedRoute(request)` matches. Protected app paths include `/dashboard`, `/controls`, `/evidence`, `/integrations`, `/policies`, `/vendors`, `/questionnaires`, `/trust-center`, `/incidents`, `/risks`, `/team`, `/settings`, and agency/onboarding/framework routes, including `/en`, `/it`, and `/cs` localized variants.
- API routes are matched separately by `isApiRoute` and bypass locale handling with `NextResponse.next()`.
- Existing local fallback demo data is controlled by `lib/demo-mode.ts` through `ENABLE_LOCAL_DEMO_DATA=true` outside production. It is not a public route bypass.
- `/demo` is not currently in `protectedRoutes`, so it is public today. Tranche 9 should still make that public intent explicit so future route matcher changes do not accidentally protect it.

## Dashboard Rendering

- The real dashboard route is `app/(app)/dashboard/page.tsx`.
- It imports Clerk server helpers: `auth` and `currentUser`.
- `loadDashboardData()` calls `auth()` and then `getDashboardData(session.orgId)` when Clerk and `DATABASE_URL` are available.
- `loadUserName()` calls `currentUser()` when Clerk is configured.
- Compliance score is computed in the page with `calculateComplianceScore({ frameworkScores, statusRows })`.
- Local non-production fallback data is shown only when `!data && isLocalDemoDataEnabled()`.
- Demo `/demo` must not reuse these data loaders because they can call Clerk and database queries.

## Controls Rendering

- The real controls route is `app/(app)/controls/page.tsx`.
- It imports Clerk `auth()` and the DB query functions `listOrgControlsForIndex`, `getOrgWorkspaceRecommendations`, `getOrganisationByClerkOrgId`, and `getWorkspaceProgress`.
- `loadControlsIndexData()` calls those DB functions when Clerk and `DATABASE_URL` are available; otherwise it builds local fallback controls from `CONTROL_LIBRARY`.
- Workspace recommendation cards are derived from `getOrgWorkspaceRecommendations()` and workspace progress is derived from `getWorkspaceProgress()`.
- Demo `/demo/controls` must use `lib/demo/data.ts` directly instead of this loader.

## Pohoda Workspace Rendering

- The real Pohoda workspace route is `app/(app)/workspaces/pohoda/page.tsx`.
- It imports Clerk `auth()` and calls `getWorkspaceProgress(session.orgId, pohodaWorkspace)` plus `listControlCommentsForOrg(session.orgId)`.
- It has an internal `buildDemoProgress()` fallback, but the route can still call Clerk and database queries when configured.
- Demo `/demo/workspaces/pohoda` should build a static `WorkspaceProgress` adapter from `lib/demo/data.ts` and pass it to the shared renderer.

## WorkspaceRenderer Contract

- `components/workspaces/workspace-renderer.tsx` is a client component.
- Props:
  - `workspace: PlatformWorkspace`
  - `progress: WorkspaceProgress`
  - `mode?: "editable" | "consultant_readonly"`
  - `commentsByControlKey?: Record<string, ControlComment[]>`
  - `clientOrgId?: string`
- `mode="consultant_readonly"` suppresses attestation/file upload submission UI and shows a read-only notice.
- The renderer may still show the comments panel in read-only mode. Demo pages should pass `commentsByControlKey={{}}` and no `clientOrgId`, and hide any visible comments form from the demo wrapper if needed without changing renderer internals.

## Query Functions Demo Must Not Call

- Dashboard: `getDashboardData`, `auth`, `currentUser`.
- Controls: `listOrgControlsForIndex`, `getOrgWorkspaceRecommendations`, `getOrganisationByClerkOrgId`, `getWorkspaceProgress`, `auth`.
- Workspace: `getWorkspaceProgress`, `listControlCommentsForOrg`, `groupCommentsByControlKey`, `auth`.
- Generic DB access to avoid in demo routes: `getDb` and imports from `@/lib/db/queries/*`.
