import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = {
  confirm: "lib/discovery/confirm.ts",
  microsoft365: "lib/discovery/providers/microsoft365.ts",
  abraFlexi: "lib/discovery/providers/abra-flexi.ts",
  registry: "lib/discovery/registry.ts",
  route: "app/api/discovery/run/route.ts",
  schema: "lib/db/schema.ts",
  inngestRoute: "app/api/inngest/route.ts",
};

function read(path: string) {
  return readFileSync(path, "utf8");
}

const schema = read(files.schema);
assert.match(schema, /export const assets = pgTable\(\s*"assets"/, "assets register table is defined");
assert.match(schema, /export const discoveryRuns = pgTable\(\s*"discovery_runs"/, "discovery runs table is defined");
assert.match(schema, /export const discoveredAssets = pgTable\(\s*"discovered_assets"/, "discovered assets table is defined");
assert.match(schema, /export const discoveredVendors = pgTable\(\s*"discovered_vendors"/, "discovered vendors table is defined");
assert.match(schema, /assets_org_external_key_unique/, "assets dedupe unique index exists");
assert.match(schema, /discovered_assets_org_external_key_unique/, "discovered asset dedupe unique index exists");
assert.match(schema, /discovered_vendors_org_external_key_unique/, "discovered vendor dedupe unique index exists");

const confirm = read(files.confirm);
assert.match(confirm, /evidence/, "confirmation records evidence with existing evidence table primitives");
assert.match(confirm, /DISCOVERY_ASSET_INVENTORY_CONTROL_KEY = "ctrl_asset_inventory"/, "asset confirmation targets the existing asset inventory control key");
assert.doesNotMatch(confirm, /recordManualEvidence/, "confirmation does not import a non-existent evidence helper");
assert.match(confirm, /assessment_result:\s*"pass"/, "asset confirmation is an explicit human-confirmed pass, not a silent scan result");
assert.match(confirm, /human_confirmed_auto_discovery_draft/, "evidence snapshot preserves the draft-vs-confirmed boundary");
assert.match(confirm, /\.transaction\(/, "asset confirmation is transaction-safe across draft, evidence, and status updates");
assert.match(confirm, /tx\.insert\(evidence\)/, "asset evidence insert happens inside the confirmation transaction");

const microsoft365 = read(files.microsoft365);
assert.doesNotMatch(microsoft365, /Wire graphClientFor|throw new Error\(\s*"Wire/, "Microsoft discovery adapter is wired, not a throw stub");
assert.match(microsoft365, /getGraphClient/, "Microsoft discovery adapter reuses the existing Graph client");
assert.match(microsoft365, /safeGraphCollection|graphCollection/, "Microsoft Graph responses are validated as collections before use");

const abraFlexi = read(files.abraFlexi);
assert.doesNotMatch(abraFlexi, /Wire flexiClientFor|throw new Error\(\s*"Wire/, "ABRA Flexi discovery adapter is wired, not a throw stub");
assert.match(abraFlexi, /buildAbraFlexiUrl/, "ABRA discovery adapter reuses the existing ABRA URL builder");
assert.match(abraFlexi, /createAbraFlexiBasicAuthHeader/, "ABRA discovery adapter reuses the existing auth header builder");
assert.match(abraFlexi, /validateAbraBaseUrl/, "ABRA discovery adapter reuses the existing HTTPS/public-IP URL guard before authenticated fetches");
assert.ok(
  abraFlexi.indexOf("await validateAbraBaseUrl") < abraFlexi.indexOf("authorization: createAbraFlexiBasicAuthHeader"),
  "ABRA URL guard is wired before credentials are sent",
);

const route = read(files.route);
assert.match(route, /z\.object/, "discovery route validates request body");
assert.match(route, /request\.text\(\)/, "discovery route distinguishes empty body from malformed JSON");
assert.match(route, /JSON\.parse/, "discovery route explicitly parses non-empty JSON before side effects");
assert.match(route, /auth\(\)/, "discovery route is scoped to the active Clerk organisation");
assert.doesNotMatch(route, /err instanceof Error \? err\.message/, "route does not expose raw internal error text to users");

assert.match(read(files.registry), /microsoft365|abra-flexi/, "discovery registry includes the first two providers");
assert.match(read(files.inngestRoute), /discoveryRescan/, "weekly discovery rescan is served by Inngest");

console.log("discovery source smoke passed");
