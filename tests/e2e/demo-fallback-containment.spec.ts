import { expect, test } from "@playwright/test";

test.use({ locale: "en-US" });

test("does not silently render demo data when workspace data is unavailable", async ({
  page,
}) => {
  const pages = [
    { forbidden: "Demo monitor", path: "/dashboard" },
    { forbidden: "Backup recovery is not verified", path: "/risks" },
    { forbidden: "Suspicious admin access", path: "/incidents" },
    { forbidden: "ctrl_mfa_all_users", path: "/frameworks/nis2" },
    { forbidden: "Demo Cloud Provider", path: "/vendors" },
    { forbidden: "NIS2", path: "/trust-center" },
  ];

  for (const appPage of pages) {
    await page.goto(appPage.path);

    await expect(page.getByText("Organisation data unavailable")).toBeVisible();
    await expect(page.getByText(appPage.forbidden)).toHaveCount(0);
  }

  await page.goto("/trust-center");
  await expect(page.locator('main a[href="/trust/demo"]')).toHaveCount(0);
});

test("public demo Trust Center is explicitly labeled as sample data", async ({
  page,
}) => {
  await page.goto("/trust/demo");

  await expect(page.getByText("Sample Trust Center")).toBeVisible();
  await expect(page.getByText("Live", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText(
      "This public page uses sample data to demonstrate the product. It does not describe any organisation's live compliance status.",
    ),
  ).toBeVisible();

  await page.goto("/trust/demo/frameworks/nis2");
  await expect(page.getByText("Sample Trust Center")).toBeVisible();
});

test("marketing demo Trust Center link is named as a sample", async ({
  page,
}) => {
  await page.goto("/platform");

  await expect(
    page.getByRole("link", { name: "View sample Trust Center →" }),
  ).toHaveAttribute("href", "/trust/demo");
});
