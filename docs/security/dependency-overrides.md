# Dependency override rationale

Date added/reviewed: 2026-06-02
Owner: Lane 09 performance/security/observability, with Lane 08 owning smoke-gate taxonomy.
Runtime package source: `package.json` `overrides` and `package-lock.json`.
Validation command: `npm audit --audit-level=high` plus `npm run smoke:t4i-performance-security-observability`.

These overrides are intentionally documented because they can alter transitive dependency resolution outside the package that originally pulled the dependency. Do not remove them as cleanup unless the removal criteria below are met and the validation commands still pass.

| Package override | Current override | Rationale | Removal criteria |
| --- | ---: | --- | --- |
| `brace-expansion` | `5.0.6` | Keeps all transitive consumers on a current patched line for brace/glob expansion parsing. This is security-governance coverage for historical ReDoS-class advisories in older `brace-expansion` lines. | Remove only when `npm ls brace-expansion --all` shows every direct/transitive consumer already resolves to a non-vulnerable version without a root override and `npm audit --audit-level=high` remains green. |
| `esbuild` | `0.28.0` | Keeps build/tooling consumers away from older vulnerable esbuild versions. This is broad because esbuild is a build-time dependency used through multiple tools and can affect local dev servers/analyzers. | Remove only after `npm ls esbuild --all` shows no vulnerable older version would be installed, `npm run build`, `npm run lint`, and `npm run analyze` still work, and the override is no longer needed for audit posture. |
| `postcss` | `8.5.10` | Keeps CSS processing on a current patched PostCSS 8 line for all Tailwind/Next/tooling consumers. | Remove only when all transitive consumers resolve to patched PostCSS without the override and `npm audit --audit-level=high`, `npm run lint`, and `npm run build` remain green. |
| `tmp` | `0.2.7` | Keeps temporary-file utility consumers on the patched 0.2 line and avoids known older temporary-file cleanup/symlink risk classes. | Remove only when `npm ls tmp --all` resolves all consumers to a patched version without the override and audit remains green. |
| `uuid` | `11.1.1` | Keeps UUID generation on the current major used by tooling/transitive consumers and avoids stale random/crypto implementation drift from older lines. | Remove only when all consumers resolve to an accepted modern UUID version without the override and typecheck/build/audit remain green. |

Review cadence:

1. During dependency updates, run `npm outdated`/package metadata checks, `npm ls <override> --all`, and `npm audit --audit-level=high`.
2. If an override can be removed, remove it together with the lockfile change in a dependency-maintenance tranche, not in unrelated product work.
3. Re-run `npm run typecheck`, `npm run lint`, `npm run build`, and any package-specific analyzer/performance command that uses the overridden dependency.
4. Update this document with the removal date or new rationale.

Current accepted risk:

- The repo intentionally does not change package versions in T4-I. Package metadata checks on 2026-06-02 showed Next-compatible 16.x tooling packages are available, but changing dependencies/lockfile was out of this tranche's safe source-smoke scope.
- The overrides remain broad until a dedicated dependency-maintenance pass proves they can be narrowed or removed without losing the green high-severity audit posture.
