import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3002);

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests/e2e",
  timeout: 240_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  ...(process.env.CI
    ? {
        webServer: {
          command: `npm run dev -- --hostname 127.0.0.1 -p ${port}`,
          env: {
            ENABLE_LOCAL_DEMO_DATA: "true",
            ENABLE_TEST_ROUTES: "true",
            NEXT_PUBLIC_ENABLE_TEST_ROUTES: "true",
            NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=8192",
            TEST_BYPASS_PLAN_GATE: "true",
          },
          reuseExistingServer: false,
          timeout: 120_000,
          url: `http://127.0.0.1:${port}`,
        },
      }
    : {}),
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
