# pi-vs-claude-code Extension Port

Vendored from <https://github.com/disler/pi-vs-claude-code> at commit `3ce16391a1f4d244f9204578833506580273fe20`.

This directory contains the upstream executable Pi extensions from the repository root, adapted for the current Pi package namespace (`@earendil-works/*`) and current `typebox` import path.

## Why these are not auto-loaded

The upstream extensions are designed to be launched in selected combinations. Loading all of them at once would conflict:

- `agent-team` makes the primary Pi agent dispatcher-only.
- `agent-chain` makes the primary Pi agent chain-runner-only.
- `damage-control` and `damage-control-continue` both intercept tool calls.
- footer/widget extensions replace the same UI areas.
- `purpose-gate` blocks prompts until a session purpose is declared.
- `coms` and `coms-net` create local/network agent communication surfaces.

For that reason, the files live outside `.pi/extensions/` auto-discovery and are run through the profile launcher below.

## Launch profiles

Use from the repository root:

```bash
node .pi/pi-vs-claude-code/run.mjs <profile> [pi args...]
```

Examples:

```bash
node .pi/pi-vs-claude-code/run.mjs agent-team
node .pi/pi-vs-claude-code/run.mjs agent-chain "Plan and implement the requested change"
node .pi/pi-vs-claude-code/run.mjs damage-control-continue "Review current diff"
node .pi/pi-vs-claude-code/run.mjs local-coms --name planner --purpose "Plans work"
```

Available profiles:

- `pure-focus`
- `minimal`
- `cross-agent`
- `purpose-gate`
- `tool-counter`
- `tool-counter-widget`
- `subagent-widget`
- `tilldone`
- `agent-team`
- `system-select`
- `damage-control`
- `damage-control-continue`
- `agent-chain`
- `pi-pi`
- `session-replay`
- `theme-cycler`
- `local-coms`
- `coms` / `coms-net`

Run arbitrary extension combinations:

```bash
node .pi/pi-vs-claude-code/run.mjs open damage-control-continue minimal -- "Do the task"
```

## Coms-net server

The networked communication hub requires Bun, matching the upstream project.

```bash
node .pi/pi-vs-claude-code/run.mjs coms-net-server
node .pi/pi-vs-claude-code/run.mjs coms-net-server-lan
```

For LAN/remote use, set `PI_COMS_NET_AUTH_TOKEN`. The upstream server refuses non-localhost binding without a token. See `env.sample` for the relevant environment variables.

## Direct Pi usage

You can also load a single extension directly:

```bash
pi --no-extensions -e .pi/pi-vs-claude-code/extensions/agent-team.ts
```

`--no-extensions` avoids auto-loading unrelated project extensions while still allowing explicit `-e` paths.

## Dependency notes

- Pi supplies `@earendil-works/pi-coding-agent`, `@earendil-works/pi-ai`, `@earendil-works/pi-tui`, and `typebox` to extensions.
- The damage-control extensions import `yaml`; this project already has `yaml` in `node_modules` through the existing lockfile.
- `coms-net-server` requires Bun.

## Security notes

These are third-party executable extensions. They can spawn `pi`, open local sockets, start HTTP/SSE services, alter active tools, and intercept tool calls. Review the specific extension before using it in sensitive workspaces.
