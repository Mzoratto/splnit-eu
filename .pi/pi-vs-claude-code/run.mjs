#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const extDir = resolve(here, "extensions");
const scriptDir = resolve(here, "scripts");

const profiles = {
  "pure-focus": ["pure-focus"],
  minimal: ["minimal", "theme-cycler"],
  "cross-agent": ["cross-agent", "minimal"],
  "purpose-gate": ["purpose-gate", "minimal"],
  "tool-counter": ["tool-counter"],
  "tool-counter-widget": ["tool-counter-widget", "minimal"],
  "subagent-widget": ["subagent-widget", "pure-focus", "theme-cycler"],
  tilldone: ["tilldone", "theme-cycler"],
  "agent-team": ["agent-team", "theme-cycler"],
  "system-select": ["system-select", "minimal", "theme-cycler"],
  "damage-control": ["damage-control", "minimal", "theme-cycler"],
  "damage-control-continue": ["damage-control-continue", "minimal", "theme-cycler"],
  "agent-chain": ["agent-chain", "theme-cycler"],
  "pi-pi": ["pi-pi", "theme-cycler"],
  "session-replay": ["session-replay", "minimal"],
  "theme-cycler": ["theme-cycler", "minimal"],
  "local-coms": ["coms", "minimal", "theme-cycler"],
  coms: ["coms-net", "minimal", "theme-cycler"],
  "coms-net": ["coms-net", "minimal", "theme-cycler"],
};

function usage() {
  console.log(`Usage:
  node .pi/pi-vs-claude-code/run.mjs <profile> [pi args...]
  node .pi/pi-vs-claude-code/run.mjs open <ext> [ext...] -- [pi args...]
  node .pi/pi-vs-claude-code/run.mjs coms-net-server
  node .pi/pi-vs-claude-code/run.mjs coms-net-server-lan

Profiles:
${Object.keys(profiles).map((name) => `  ${name}`).join("\n")}

Examples:
  node .pi/pi-vs-claude-code/run.mjs agent-team
  node .pi/pi-vs-claude-code/run.mjs agent-chain "Plan and build X"
  node .pi/pi-vs-claude-code/run.mjs local-coms --name planner --purpose "Plans work"
  node .pi/pi-vs-claude-code/run.mjs open damage-control-continue minimal -- "Review current diff"
`);
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  process.exit(result.status ?? 0);
}

function piArgsForExtensions(extensionNames, passthrough) {
  const args = ["--no-extensions"];
  for (const name of extensionNames) {
    args.push("-e", resolve(extDir, `${name}.ts`));
  }
  return args.concat(passthrough);
}

const [profile, ...rest] = process.argv.slice(2);

if (!profile || profile === "help" || profile === "--help" || profile === "-h") {
  usage();
  process.exit(0);
}

if (profile === "coms-net-server" || profile === "coms-net-server-lan") {
  const env = { ...process.env };
  if (profile === "coms-net-server-lan") env.PI_COMS_NET_HOST = env.PI_COMS_NET_HOST || "0.0.0.0";
  run(env.BUN_BIN || "bun", [resolve(scriptDir, "coms-net-server.ts"), ...rest], env);
}

if (profile === "open") {
  const sep = rest.indexOf("--");
  const extensionNames = sep >= 0 ? rest.slice(0, sep) : rest;
  const passthrough = sep >= 0 ? rest.slice(sep + 1) : [];
  if (extensionNames.length === 0) {
    console.error("open requires at least one extension name");
    usage();
    process.exit(2);
  }
  run(process.env.PI_BIN || "pi", piArgsForExtensions(extensionNames, passthrough));
}

if (!profiles[profile]) {
  console.error(`Unknown profile: ${profile}`);
  usage();
  process.exit(2);
}

run(process.env.PI_BIN || "pi", piArgsForExtensions(profiles[profile], rest));
