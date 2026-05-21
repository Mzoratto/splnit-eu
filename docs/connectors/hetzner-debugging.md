# Hetzner Cloud Connector Debugging

Use the official `hcloud` CLI only as a local debugging tool for Hetzner API
tokens and expected API shapes. Production code must continue using direct REST
calls in `lib/connectors/hetzner/checks.ts`; the CLI is not a runtime
dependency.

References:

- Official CLI: https://github.com/hetznercloud/cli
- CLI setup: https://github.com/hetznercloud/cli/blob/main/docs/tutorials/setup-hcloud-cli.md
- CLI manual: https://github.com/hetznercloud/cli/blob/main/docs/reference/manual/hcloud.md
- Hetzner API usage: https://docs.hetzner.com/cloud/api/getting-started/using-api/

## Safety Rules

- Use a dedicated Hetzner Cloud project API token for testing.
- Prefer read-only scope for Splnit.eu validation.
- Never paste a live token into tickets, logs, screenshots, Git, or AI prompts.
- Do not commit `~/.config/hcloud/cli.toml` or shell history containing tokens.
- Redact server names, IPs, labels, and firewall CIDRs before sharing output.

## Install

macOS:

```bash
brew install hcloud
```

Linux manual install:

```bash
curl -sSLO https://github.com/hetznercloud/cli/releases/latest/download/hcloud-linux-amd64.tar.gz
sudo tar -C /usr/local/bin --no-same-owner -xzf hcloud-linux-amd64.tar.gz hcloud
rm hcloud-linux-amd64.tar.gz
```

## Token Validation Without Persisting a Context

Use an environment variable for one-off checks:

```bash
export HCLOUD_TOKEN="paste-read-only-token-here"
hcloud server list -o json
hcloud firewall list -o json
hcloud image list --type snapshot -o json
unset HCLOUD_TOKEN
```

Expected result for a valid token:

- `hcloud server list -o json` returns JSON with server objects.
- `hcloud firewall list -o json` returns JSON with firewall objects.
- `hcloud image list --type snapshot -o json` returns JSON with images where snapshots have `type` and `created` fields.

If a command returns an authentication error, treat the token as `invalid_key`.
If a command returns a permission/scope error, treat it as `insufficient_scope`.
If the command times out or cannot reach the API, treat it as `unreachable`.

## Token Validation With a Named Context

Use this only on your own machine when you are comfortable storing the token in
the local hcloud config file.

```bash
hcloud context create splnit-test
hcloud context use splnit-test
hcloud datacenter list
```

The `datacenter list` command is a low-risk read operation and is useful for
checking whether the CLI can authenticate.

Remove the context after testing:

```bash
hcloud context delete splnit-test
```

## Mapping To Splnit.eu Checks

| Splnit.eu check | API intent | CLI command |
|---|---|---|
| Server running and reachable | `GET /servers`, at least one production server has `status === "running"` | `hcloud server list -o json` |
| Firewall ruleset present | `GET /firewalls`, at least one firewall has non-empty rules | `hcloud firewall list -o json` |
| Snapshot within 7 days | `GET /images?type=snapshot`, at least one snapshot has recent `created` timestamp | `hcloud image list --type snapshot -o json` |

For screenshots or auditor evidence, use the Hetzner Console where possible.
CLI output is mainly for developer diagnosis and for confirming mocked fixture
shapes.

## Troubleshooting

`context is missing or invalid`

Use `HCLOUD_TOKEN` for one-off commands, or recreate the context:

```bash
hcloud context create splnit-test
```

`401` or authentication failure

Create a new project token in Hetzner Console and retry. Remember that Hetzner
shows the full token only once.

`403` or permission failure

Verify the token has enough read permissions for servers, firewalls, and images.
For Splnit.eu, do not use write permissions unless a future feature explicitly
needs them.

No snapshots returned

The automated check will become an amber gap unless the customer provides manual
fallback evidence. Confirm whether the project uses snapshots, backups, or an
off-server backup tool outside Hetzner Cloud.
