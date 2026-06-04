import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextConfig = readFileSync(path.join(root, "next.config.ts"), "utf8");
const cloudflareTurnstileOrigin = "https://challenges.cloudflare.com";

assert.ok(
  nextConfig.includes(cloudflareTurnstileOrigin),
  "CSP must include Cloudflare Turnstile origin for Clerk bot sign-up protection",
);

const scriptSourcesMatch = nextConfig.match(/const scriptSources = \[([\s\S]*?)\];/);
assert.ok(scriptSourcesMatch, "next.config.ts must define scriptSources");
assert.ok(
  scriptSourcesMatch[1]?.includes(cloudflareTurnstileOrigin),
  "script-src must allow Cloudflare Turnstile challenge scripts",
);

const frameSrcMatch = nextConfig.match(/`frame-src ([^`]+)`/);
assert.ok(frameSrcMatch, "next.config.ts must define frame-src in the CSP");
assert.ok(
  frameSrcMatch[1]?.includes(cloudflareTurnstileOrigin),
  "frame-src must allow Cloudflare Turnstile challenge frames",
);

console.log("Security CSP smoke passed.");
