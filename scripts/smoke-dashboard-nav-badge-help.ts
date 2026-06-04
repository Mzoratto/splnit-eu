import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function getPath(source: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    return (value as Record<string, unknown>)[key];
  }, source);
}

const sidebarSource = readFileSync("components/app/sidebar.tsx", "utf8");
const packageJson = readJson("package.json");
const dashboardBadgeAriaLabelMatches = sidebarSource.match(/t\("dashboardBadge\.linkLabel"/g) ?? [];

assert.equal(
  getPath(packageJson, "scripts.smoke:dashboard-nav-badge-help"),
  "tsx scripts/smoke-dashboard-nav-badge-help.ts",
  "package.json must expose smoke:dashboard-nav-badge-help",
);

assert.match(
  sidebarSource,
  /dashboard-regulation-count-help/,
  "Dashboard badge must render a stable help tooltip id",
);
assert.match(
  sidebarSource,
  /aria-describedby=\{hasDashboardBadge \? dashboardBadgeHelpId : undefined\}/,
  "Dashboard nav link must describe the badge with the help tooltip",
);
assert.equal(
  dashboardBadgeAriaLabelMatches.length,
  2,
  "Desktop sidebar link and mobile dashboard tab must use the clearer badge aria-label",
);
assert.match(
  sidebarSource,
  /group-hover:opacity-100/,
  "Dashboard badge help must open on hover",
);
assert.match(
  sidebarSource,
  /group-focus-within:opacity-100/,
  "Dashboard badge help must open on keyboard focus",
);
assert.match(
  sidebarSource,
  /role="tooltip"/,
  "Dashboard badge help must expose tooltip semantics",
);
assert.match(
  sidebarSource,
  /aria-hidden="true"\s+className="rounded-sm bg-danger/,
  "Visible desktop badge count must be hidden from screen readers when the link has a clearer label",
);
assert.match(
  sidebarSource,
  /<span aria-hidden="true" className="absolute -right-2 -top-2 h-2 w-2 rounded-full bg-danger"/,
  "Mobile dashboard dot must be hidden from screen readers when the link has a clearer label",
);

const requiredLocalePaths = [
  "navigation.dashboardBadge.linkLabel",
  "navigation.dashboardBadge.title",
  "navigation.dashboardBadge.body",
] as const;

for (const localePath of ["messages/cs-CZ.json", "messages/en-EU.json", "messages/it-IT.json"]) {
  const messages = readJson(localePath);
  for (const path of requiredLocalePaths) {
    const value = getPath(messages, path);
    assert.equal(typeof value, "string", `${localePath} must define ${path}`);
    assert.ok((value as string).trim().length > 20, `${localePath} ${path} must be explanatory`);
  }

  const body = getPath(messages, "navigation.dashboardBadge.body") as string;
  assert.match(
    body.toLowerCase(),
    /30|třiceti|trenta/,
    `${localePath} badge body must explain the 30-day unread update window`,
  );
  assert.match(
    body.toLowerCase(),
    /not a control count or gap count|není to počet kontrol ani mezer|non è il numero di controlli o gap/,
    `${localePath} badge body must state this is not a control or gap count`,
  );
}

console.log("Dashboard navigation badge help smoke passed.");
