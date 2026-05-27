# Project Pi Workspace

This directory imports the project-local Pi resources from `disler/pi-vs-claude-code/.pi`.

## Loaded automatically by Pi

- `settings.json` selects the `synthwave` theme.
- `themes/*.json` are available through `/settings` or `--theme`.
- `skills/bowser/SKILL.md` registers the `/skill:bowser` browser-automation skill.
- `extensions/system-select.js` registers `/system` so you can switch to a persona from `.pi/agents/*.md` during a Pi session.

## Agent resources

`agents/*.md`, `agents/teams.yaml`, and `agents/agent-chain.yaml` are data files for the companion Pi extensions in `disler/pi-vs-claude-code` (`agent-team`, `agent-chain`, `system-select`, `pi-pi`). Pi does not treat `.pi/agents` as native subagents by itself.

The full upstream executable extensions are vendored and ported under `.pi/pi-vs-claude-code/`. They are not auto-loaded because several are mutually exclusive. Use the profile launcher:

```bash
node .pi/pi-vs-claude-code/run.mjs agent-team
node .pi/pi-vs-claude-code/run.mjs agent-chain
node .pi/pi-vs-claude-code/run.mjs local-coms --name planner
```

See `.pi/pi-vs-claude-code/README.md` for all profiles and security notes. The included auto-loaded `/system` extension is a small local port that only reads project-local `.pi/agents/*.md` files and changes the active system prompt/tools.

## Safety rules

`damage-control-rules.yaml` is included for the companion `damage-control` extensions. It protects secrets, destructive commands, generated outputs, and project rules files.
