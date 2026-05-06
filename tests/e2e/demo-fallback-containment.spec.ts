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

    await expect(page.getByText("Workspace data unavailable")).toBeVisible();
    await expect(page.getByText(appPage.forbidden)).toHaveCount(0);
  }

  await page.goto("/trust-center");
  await expect(page.locator('main a[href="/trust/demo"]')).toHaveCount(0);
});
