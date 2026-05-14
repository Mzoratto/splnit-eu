#!/usr/bin/env bash
set -euo pipefail

# Collect non-secret legal/subprocessor closeout facts for Splnit.eu.
# Safe output only: presence, regions, dashboard/API metadata, and public links.
# Never prints env values, connection strings, tokens, passwords, or database URLs.
#
# Usage:
#   bash scripts/collect-legal-closeout-facts.sh > /tmp/legal-closeout-facts.md
#
# Optional for Neon API branch/PITR fields:
#   export NEON_API_KEY='...'   # local only; do not commit
#   bash scripts/collect-legal-closeout-facts.sh > /tmp/legal-closeout-facts.md

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

TMP_ENV=".vercel/.legal-closeout-production.$$.$RANDOM.env"
TMP_ENV_LS="/tmp/splnit-vercel-env-ls.$$.$RANDOM.txt"
cleanup() {
  rm -f "$TMP_ENV" "$TMP_ENV_LS"
}
trap cleanup EXIT

now_utc="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

have() { command -v "$1" >/dev/null 2>&1; }

print_section() {
  printf '\n## %s\n\n' "$1"
}

redact_long() {
  sed -E 's#(postgres://|postgresql://)[^ ]+#\1[REDACTED_DB_URL]#g; s#[A-Za-z0-9_+=/.-]{48,}#[REDACTED_LONG]#g'
}

extract_env_value() {
  local key="$1"
  node - "$TMP_ENV" "$key" <<'NODE'
const fs = require('fs');
const [path, key] = process.argv.slice(2);
let text = '';
try { text = fs.readFileSync(path, 'utf8'); } catch { process.exit(0); }
for (const line of text.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx < 0) continue;
  const k = line.slice(0, idx);
  if (k !== key) continue;
  let v = line.slice(idx + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  process.stdout.write(v);
  process.exit(0);
}
NODE
}

presence() {
  local key="$1"
  # Vercel env-pull can produce empty values in this workflow. Treat `vercel env ls`
  # metadata as authoritative for production-name presence, and env-pull values as
  # a fallback only.
  if [[ -s "$TMP_ENV_LS" ]] && grep -Eq "^[[:space:]]*$key[[:space:]]+Encrypted[[:space:]]+.*Production" "$TMP_ENV_LS"; then
    printf -- '- `%s`: present\n' "$key"
    return
  fi
  local value
  value="$(extract_env_value "$key")"
  if [[ -n "${value// }" ]]; then
    printf -- '- `%s`: present\n' "$key"
  else
    printf -- '- `%s`: missing\n' "$key"
  fi
}

host_region_from_url_or_host() {
  node - "$1" <<'NODE'
const raw = process.argv[2] || '';
let host = raw;
try { host = new URL(raw).hostname; } catch {}
const region = (host.match(/\.(eu-[a-z]+-\d|us-[a-z]+-\d|ap-[a-z]+-\d)\./) || [])[1] || '';
const kind = host.includes('neon.tech') ? 'neon.tech' : (host ? 'other' : 'unknown');
const pooler = /pooler/.test(host) ? 'yes' : 'no';
console.log(JSON.stringify({kind, region: region || 'unknown', pooler}));
NODE
}

printf '# Production Legal Closeout Facts\n\n'
printf -- '- Generated: `%s`\n' "$now_utc"
printf -- '- Repo: `%s`\n' "$ROOT"
printf -- '- Safety: values are redacted/presence-only; do not paste secrets into this file.\n'

print_section "Tooling"
printf -- '- vercel: `%s`\n' "$(vercel --version 2>/dev/null | tail -1 || echo missing)"
printf -- '- jq: `%s`\n' "$(jq --version 2>/dev/null || echo missing)"
printf -- '- node: `%s`\n' "$(node --version 2>/dev/null || echo missing)"

print_section "Vercel Production Env Presence"
if have vercel; then
  vercel env ls production --cwd . >"$TMP_ENV_LS" 2>/dev/null || true
  if vercel env pull "$TMP_ENV" --environment=production --cwd . >/dev/null 2>&1; then
    for k in \
      DATABASE_URL POSTGRES_HOST PGHOST NEON_PROJECT_ID \
      BLOB_READ_WRITE_TOKEN \
      OPENAI_API_KEY QUESTIONNAIRE_AI_ENABLED \
      NEXT_PUBLIC_POSTHOG_KEY \
      SENTRY_DSN NEXT_PUBLIC_SENTRY_DSN SENTRY_AUTH_TOKEN SENTRY_ORG SENTRY_PROJECT \
      LOOPS_API_KEY LOOPS_NEWSLETTER_LIST_ID \
      UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN \
      RESEND_API_KEY RESEND_FROM \
      INNGEST_EVENT_KEY INNGEST_SIGNING_KEY \
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY \
      STRIPE_SECRET_KEY NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY; do
      presence "$k"
    done

    db_url="$(extract_env_value DATABASE_URL)"
    pg_host="$(extract_env_value POSTGRES_HOST)"
    [[ -z "$pg_host" ]] && pg_host="$(extract_env_value PGHOST)"
    if [[ -n "$db_url$pg_host" ]]; then
      meta="$(host_region_from_url_or_host "${db_url:-$pg_host}")"
      printf '\nRedacted database host metadata:\n\n'
      printf -- '- Host kind: `%s`\n' "$(node -e "console.log(JSON.parse(process.argv[1]).kind)" "$meta")"
      printf -- '- Host region: `%s`\n' "$(node -e "console.log(JSON.parse(process.argv[1]).region)" "$meta")"
      printf -- '- Pooler host: `%s`\n' "$(node -e "console.log(JSON.parse(process.argv[1]).pooler)" "$meta")"
    fi
  else
    printf 'Could not pull Vercel Production env. Run `vercel login` / `vercel link` first.\n'
  fi
else
  printf 'Vercel CLI missing.\n'
fi

print_section "Live Readiness Endpoint"
node --input-type=module <<'NODE' || true
const names = new Set(['blob','redis','questionnaires','marketing','observability','sentrySourceMaps']);
try {
  const res = await fetch('https://splnit.eu/api/readiness');
  const data = await res.json();
  console.log(`- HTTP status: ${res.status}`);
  for (const c of data.checks ?? []) {
    if (names.has(c.name)) console.log(`- ${c.name}: ${c.status} (configured=${c.configured}, missingCount=${c.missingCount})`);
  }
  if (data.recommended) console.log(`- Recommended configured: ${data.recommended.configured}/${data.recommended.total}`);
} catch (err) {
  console.log(`- readiness fetch failed: ${err?.message ?? err}`);
}
NODE

print_section "Vercel Deployment / Function Region"
if have vercel; then
  vercel inspect https://splnit.eu --cwd . 2>&1 \
    | grep -E 'target|status|created| λ | ƒ |\[iad1\]|\[fra1\]|\[cdg1\]|\[arn1\]|\[dub1\]|url' \
    | head -80 \
    | redact_long || true
else
  printf 'Vercel CLI missing.\n'
fi

print_section "Vercel Blob Stores"
if have vercel; then
  vercel blob list-stores --cwd . 2>&1 | redact_long || true
  printf '\n'
  # If the known store exists, get full non-secret metadata.
  store_id="$(vercel blob list-stores --cwd . 2>/dev/null | awk '/splnit-eu/ {print $2; exit}')"
  if [[ -n "$store_id" ]]; then
    vercel blob get-store "$store_id" --cwd . 2>&1 | redact_long || true
  fi
else
  printf 'Vercel CLI missing.\n'
fi

print_section "Neon API Branch / Retention Facts"
# Convenience for local-only use: if NEON_API_KEY / NEON_PROJECT_ID are not
# exported in the shell, load only those keys from .env.local without printing
# them or sourcing the whole file.
read_local_env_key() {
  local key="$1"
  node - "$key" <<'NODE'
const fs = require('fs');
const key = process.argv[2];
let text = '';
try { text = fs.readFileSync('.env.local', 'utf8'); } catch { process.exit(0); }
for (const line of text.split(/\r?\n/)) {
  if (!line || /^\s*#/.test(line)) continue;
  const idx = line.indexOf('=');
  if (idx < 0) continue;
  const k = line.slice(0, idx).trim();
  if (k !== key) continue;
  let value = line.slice(idx + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
  process.stdout.write(value);
  process.exit(0);
}
NODE
}
if [[ -f ".env.local" ]]; then
  if [[ -z "${NEON_API_KEY:-}" ]]; then
    local_neon_api_key="$(read_local_env_key NEON_API_KEY)"
    if [[ -n "$local_neon_api_key" ]]; then
      export NEON_API_KEY="$local_neon_api_key"
    fi
  fi
  if [[ -z "${NEON_PROJECT_ID:-}" ]]; then
    local_neon_project_id="$(read_local_env_key NEON_PROJECT_ID)"
    if [[ -n "$local_neon_project_id" ]]; then
      export NEON_PROJECT_ID="$local_neon_project_id"
    fi
  fi
fi
neon_project_id="${NEON_PROJECT_ID:-$(extract_env_value NEON_PROJECT_ID)}"
if [[ -z "${NEON_API_KEY:-}" ]]; then
  printf -- '- `NEON_API_KEY`: missing in shell; skipping Neon API. Export it locally and re-run.\n'
  printf -- '- `NEON_PROJECT_ID`: %s\n' "$([[ -n "$neon_project_id" ]] && echo present || echo missing)"
else
  if [[ -z "$neon_project_id" ]]; then
    printf -- '- `NEON_PROJECT_ID`: missing; set it or ensure it exists in Vercel Production env.\n'
  else
    printf -- '- `NEON_PROJECT_ID`: present\n'
    if [[ "${NEON_API_KEY}" == "paste-your-real-neon-api-key-here" || "${NEON_API_KEY}" == "paste-your-neon-api-key-locally-do-not-commit" ]]; then
      printf -- '- `NEON_API_KEY`: placeholder value detected; replace it with a real Neon API key and re-run.\n'
    else
      neon_org_id=""
      orgs_json="$(curl -fsS \
        -H "Authorization: Bearer ${NEON_API_KEY}" \
        "https://console.neon.tech/api/v2/users/me/organizations" 2>/dev/null || true)"
      if [[ -n "$orgs_json" ]]; then
        neon_org_id="$(printf '%s' "$orgs_json" | jq -r '.organizations[0].id // empty' 2>/dev/null || true)"
        org_count="$(printf '%s' "$orgs_json" | jq -r '(.organizations // []) | length' 2>/dev/null || echo unknown)"
        printf -- '- Neon API key accepted; organization count visible: `%s`\n' "$org_count"
      fi
      org_query=""
      if [[ -n "$neon_org_id" ]]; then
        org_query="?org_id=${neon_org_id}"
        projects_json="$(curl -fsS \
          -H "Authorization: Bearer ${NEON_API_KEY}" \
          "https://console.neon.tech/api/v2/projects${org_query}" 2>/dev/null || true)"
        if [[ -n "$projects_json" ]]; then
          project_count="$(printf '%s' "$projects_json" | jq -r '(.projects // []) | length' 2>/dev/null || echo unknown)"
          target_match="$(printf '%s' "$projects_json" | jq -r --arg id "$neon_project_id" 'any(.projects[]?; .id == $id)' 2>/dev/null || echo unknown)"
          printf -- '- Neon accessible projects in first organization: `%s`\n' "$project_count"
          printf -- '- Vercel Production `NEON_PROJECT_ID` accessible with this key: `%s`\n' "$target_match"
        fi
      fi

      printf '\nBranches from Neon API (non-secret metadata):\n\n'
      branches_json="$(curl -fsS \
        -H "Authorization: Bearer ${NEON_API_KEY}" \
        "https://console.neon.tech/api/v2/projects/${neon_project_id}/branches${org_query}" 2>/dev/null || true)"
      if [[ -z "$branches_json" ]]; then
        printf 'Neon API branches request failed. Most likely: API key lacks access to the Vercel Production `NEON_PROJECT_ID`, or the Vercel value points to a different Neon account/team/project.\n'
      else
        printf '%s' "$branches_json" | jq '.branches[] | {
            id,
            name,
            primary,
            default,
            current_state,
            created_at,
            updated_at,
            parent_id,
            protected,
            cpu_used_sec,
            logical_size,
            active_time_seconds,
            written_data_bytes,
            data_transfer_bytes,
            possibly_retention_or_pitr_fields: (with_entries(select(.key | test("retention|pitr|restore|backup|history"; "i"))))
          }' || printf 'Neon API branches response could not be parsed.\n'
      fi

      printf '\nProject metadata fields that may mention retention/PITR/backups:\n\n'
      project_json="$(curl -fsS \
        -H "Authorization: Bearer ${NEON_API_KEY}" \
        "https://console.neon.tech/api/v2/projects/${neon_project_id}${org_query}" 2>/dev/null || true)"
      if [[ -z "$project_json" ]]; then
        printf 'Neon API project request failed. Most likely: API key lacks access to the Vercel Production `NEON_PROJECT_ID`, or the Vercel value points to a different Neon account/team/project.\n'
      else
        printf '%s' "$project_json" | jq '.project | with_entries(select(.key | test("retention|pitr|restore|backup|history|region|platform"; "i")))' || printf 'Neon API project response could not be parsed.\n'
      fi
    fi
  fi
fi

print_section "Vercel Analytics / Speed Insights"
printf 'CLI/API status is not reliably exposed by Vercel CLI. Confirm in dashboard:\n\n'
printf -- '- Vercel > splnit-eu > Analytics: Web Analytics enabled? receiving data? retention shown?\n'
printf -- '- Vercel > splnit-eu > Speed Insights: enabled? receiving data? retention shown?\n'
printf -- '- Current automated browser observation: analytics/speed network requests were not observed after cookie accept in the prior check, so treat dashboard status as authoritative.\n'

print_section "Public Legal Evidence Links To Review"
cat <<'EOF'
| Vendor | DPA / data terms | Security docs | Subprocessors / retention docs to find |
| --- | --- | --- | --- |
| Vercel / Blob | https://vercel.com/legal/dpa | https://vercel.com/security | Vercel subprocessors, privacy, logs/analytics/blob retention docs from dashboard/docs |
| Neon | Find from Neon legal/trust center or signed account terms | https://neon.com/security | Neon subprocessors + PITR/backup/restore docs |
| OpenAI | https://openai.com/policies/business-terms/ | https://openai.com/security/ | API data retention / data controls / subprocessors |
| Clerk | https://clerk.com/legal/dpa | https://clerk.com/security | Clerk subprocessors + retention/deletion/session docs |
| Stripe | https://stripe.com/legal/dpa | https://stripe.com/docs/security/stripe | Stripe Services Agreement, subprocessors, tax/invoice retention |
| Resend | https://resend.com/legal/dpa | https://resend.com/security | Resend subprocessors, retention, suppression/bounce handling |
| Inngest | Find from Inngest legal/trust center or signed account terms | https://www.inngest.com/security | Inngest subprocessors + event retention docs |
EOF

print_section "Suggested Register Updates"
cat <<'EOF'
- Mark Loops, Upstash Redis, Sentry, PostHog as `not production` if the presence/readiness output still shows missing.
- Keep OpenAI as `owner + counsel check` if enabled; attach data terms and retention controls before broad customer use.
- Keep Neon as `owner check` until branch name, PITR/restore retention, backup location/retention are filled from Neon API/dashboard.
- Keep Vercel Analytics/Speed Insights as `not proven active` until dashboard confirms enabled + receiving data.
- Move Vercel Blob to `counsel check` only after DPA/deletion/replication docs are attached; region/private status alone is not legal approval.
EOF
