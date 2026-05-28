import { defineConfig, devices, type PlaywrightTestProject } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3002);
const suite = process.env.E2E_SUITE ?? "all";

const publicSpecs = [
  "**/legal.spec.ts",
  "**/navigation-shell.spec.ts",
  "**/pricing.spec.ts",
  "**/readiness.spec.ts",
  "**/security.spec.ts",
];

const localDemoSpecs = [
  "**/activation-loop.spec.ts",
  "**/billing.spec.ts",
  "**/compliance-report-gap.spec.ts",
  "**/compliance-report-happy-path.spec.ts",
  "**/compliance-report-profile-gate.spec.ts",
  "**/demo-fallback-containment.spec.ts",
  "**/helios-workspace.spec.ts",
  "**/intake-prioritization-smoke.spec.ts",
  "**/integration-connect.spec.ts",
  "**/money-s3-workspace.spec.ts",
  "**/onboarding.spec.ts",
  "**/org-aware-index-pages.spec.ts",
  "**/pohoda-workspace.spec.ts",
  "**/settings-organisation.spec.ts",
  "**/team.spec.ts",
];

const authenticatedSpecs = ["**/feature-verification.spec.ts"];
const debugSpecs = ["**/debug-*.spec.ts"];

function project(
  name: string,
  testMatch: string[],
  device: keyof typeof devices,
): PlaywrightTestProject {
  return {
    name,
    testMatch,
    use: { ...devices[device] },
  };
}

const selectedProjects = [
  project("public-chromium", publicSpecs, "Desktop Chrome"),
  project("public-mobile", publicSpecs, "Pixel 7"),
  project("local-demo-chromium", localDemoSpecs, "Desktop Chrome"),
  project("local-demo-mobile", localDemoSpecs, "Pixel 7"),
  project("authenticated-chromium", authenticatedSpecs, "Desktop Chrome"),
  project("debug-chromium", debugSpecs, "Desktop Chrome"),
];

const serverEnv: Record<string, string> = {
  CRON_SECRET: "test-cron-secret",
  ENABLE_TEST_ROUTES: "true",
  NEXT_PUBLIC_ENABLE_TEST_ROUTES: "true",
  NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=8192",
  TEST_BYPASS_PLAN_GATE: "true",
};

if (suite === "local-demo" || suite === "debug") {
  serverEnv.CLERK_SECRET_KEY = "";
  serverEnv.ENABLE_LOCAL_DEMO_DATA = "true";
  serverEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "";
} else if (suite === "public" || suite === "all") {
  serverEnv.CLERK_SECRET_KEY = "";
  serverEnv.ENABLE_LOCAL_DEMO_DATA = "false";
  serverEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "";
} else {
  serverEnv.ENABLE_LOCAL_DEMO_DATA = "false";
}

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests/e2e",
  testIgnore: suite === "debug" ? [] : ["**/debug-*.spec.ts"],
  timeout: 240_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run start -- -p ${port}`,
    env: serverEnv,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: `http://127.0.0.1:${port}`,
  },
  projects: selectedProjects,
});
