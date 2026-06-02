import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(source: string, needle: string, label: string) {
  assert.ok(source.includes(needle), `${label}: missing ${needle}`);
}

const packageJson = JSON.parse(read("package.json")) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  overrides: Record<string, string>;
  scripts: Record<string, string>;
};

const overrideDocPath = "docs/security/dependency-overrides.md";
assert.ok(existsSync(path.join(root, overrideDocPath)), "dependency override rationale doc must exist");
const overrideDoc = read(overrideDocPath);
for (const [name, version] of Object.entries(packageJson.overrides)) {
  assertIncludes(overrideDoc, `\`${name}\``, `override doc covers ${name}`);
  assertIncludes(overrideDoc, `\`${version}\``, `override doc covers ${name} version`);
}
assertIncludes(overrideDoc, "Removal criteria", "override doc includes removal criteria");
assertIncludes(overrideDoc, "npm audit --audit-level=high", "override doc includes audit validation");

const closeoutDoc = read("docs/operations/performance-security-observability-closeout.md");
assertIncludes(closeoutDoc, "Accepted compatibility risk", "closeout doc records Next tooling risk");
assertIncludes(closeoutDoc, "@next/bundle-analyzer", "closeout doc covers bundle analyzer mismatch");
assertIncludes(closeoutDoc, "eslint-config-next", "closeout doc covers eslint-config-next mismatch");
assertIncludes(closeoutDoc, "app/opengraph-image.tsx", "closeout doc names edge runtime source");
assertIncludes(closeoutDoc, "app/layout.tsx", "closeout doc names root cookies dynamic source");
assertIncludes(closeoutDoc, "i18n/request.ts", "closeout doc names i18n headers dynamic source");
assertIncludes(closeoutDoc, "Using edge runtime on a page currently disables static generation for that page", "closeout doc preserves measured warning");

const nextMajor = packageJson.dependencies.next.replace(/^[^0-9]*/, "").split(".")[0];
for (const packageName of ["@next/bundle-analyzer", "eslint-config-next"]) {
  const configuredMajor = packageJson.devDependencies[packageName].replace(/^[^0-9]*/, "").split(".")[0];
  if (configuredMajor !== nextMajor) {
    assertIncludes(
      closeoutDoc,
      "Accepted compatibility risk",
      `${packageName} major mismatch must be explicitly documented`,
    );
  }
}

assert.equal(
  packageJson.scripts["perf:lighthouse"],
  "lhci autorun --upload.target=filesystem",
  "perf:lighthouse must be first-class and keep artifacts local/filesystem",
);
assertIncludes(read(".lighthouserc.json"), "categories:performance", "Lighthouse config retains performance budget");

for (const configPath of ["instrumentation-client.ts", "sentry.server.config.ts", "sentry.edge.config.ts"]) {
  const source = read(configPath);
  assertIncludes(source, "sentryPiiPolicy.sendDefaultPii", `${configPath} disables default PII through policy`);
  assertIncludes(source, "beforeSend: scrubSentryEvent", `${configPath} wires Sentry event scrubber`);
  assertIncludes(source, "beforeSendTransaction: scrubSentryTransaction", `${configPath} wires Sentry transaction scrubber`);
}

const scrubber = read("lib/observability/sentry-scrubber.ts");
assertIncludes(scrubber, "sendDefaultPii: false", "scrubber policy disables default PII");
assertIncludes(scrubber, "sensitiveKeyPattern", "scrubber has sensitive key policy");
assertIncludes(scrubber, "sensitiveQueryKeyPattern", "scrubber scrubs sensitive URL query keys");

console.log("T4-I performance/security/observability source smoke passed.");
