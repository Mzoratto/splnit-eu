/**
 * Project-local /system command for Pi.
 *
 * Scans project-local agent definition files and lets the user prepend one
 * agent persona to Pi's default system prompt for the current session.
 */

const { readdirSync, readFileSync, existsSync } = require("node:fs");
const { join, basename } = require("node:path");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { fields: {}, body: raw };

  const fields = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }

  return { fields, body: match[2] };
}

function scanAgents(dir, source) {
  if (!existsSync(dir)) return [];

  const agents = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;

    const raw = readFileSync(join(dir, file), "utf8");
    const { fields, body } = parseFrontmatter(raw);
    agents.push({
      name: fields.name || basename(file, ".md"),
      description: fields.description || "",
      tools: fields.tools ? fields.tools.split(",").map((tool) => tool.trim()).filter(Boolean) : [],
      body: body.trim(),
      source,
    });
  }

  return agents;
}

function displayName(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toolNames(tools) {
  return tools.map((tool) => (typeof tool === "string" ? tool : tool && tool.name)).filter(Boolean);
}

module.exports = function systemSelect(pi) {
  let activeAgent = null;
  let allAgents = [];
  let defaultTools = [];

  pi.on("session_start", async (_event, ctx) => {
    activeAgent = null;
    allAgents = [];
    defaultTools = toolNames(pi.getActiveTools());

    const cwd = ctx.cwd;
    const dirs = [[join(cwd, ".pi", "agents"), ".pi"]];

    const seen = new Set();
    const sourceCounts = new Map();

    for (const [dir, source] of dirs) {
      for (const agent of scanAgents(dir, source)) {
        const key = agent.name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        allAgents.push(agent);
        sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
      }
    }

    ctx.ui.setStatus("system-prompt", "System Prompt: Default");

    if (allAgents.length > 0) {
      const loadedSources = Array.from(sourceCounts.entries())
        .map(([source, count]) => `${count} from ${source}`)
        .join(", ");
      ctx.ui.notify(`Loaded ${allAgents.length} project-local agent personas (${loadedSources}). Use /system to switch.`, "info");
    }
  });

  pi.registerCommand("system", {
    description: "Select a system prompt persona from .pi/agents",
    handler: async (_args, ctx) => {
      if (allAgents.length === 0) {
        ctx.ui.notify("No project-local agent personas found in .pi/agents.", "warning");
        return;
      }

      const options = [
        "Reset to Default",
        ...allAgents.map((agent) => `${agent.name} — ${agent.description} [${agent.source}]`),
      ];

      const choice = await ctx.ui.select("Select System Prompt", options);
      if (choice === undefined) return;

      if (choice === options[0]) {
        activeAgent = null;
        pi.setActiveTools(defaultTools);
        ctx.ui.setStatus("system-prompt", "System Prompt: Default");
        ctx.ui.notify("System prompt reset to default.", "success");
        return;
      }

      const idx = options.indexOf(choice) - 1;
      const agent = allAgents[idx];
      if (!agent) return;

      activeAgent = agent;
      pi.setActiveTools(agent.tools.length > 0 ? agent.tools : defaultTools);
      ctx.ui.setStatus("system-prompt", `System Prompt: ${displayName(agent.name)}`);
      ctx.ui.notify(`System prompt switched to ${displayName(agent.name)}.`, "success");
    },
  });

  pi.on("before_agent_start", async (event) => {
    if (!activeAgent) return undefined;
    return {
      systemPrompt: `${activeAgent.body}\n\n${event.systemPrompt}`,
    };
  });
};
