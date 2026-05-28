import { expect, test } from "@playwright/test";

test.use({ locale: "cs-CZ" });

const demoRoutes = [
  "/demo",
  "/demo/controls",
  "/demo/export",
  "/demo/workspaces/pohoda",
  "/demo/workspaces/hetzner",
];

const appShellRoutes = [
  "/dashboard",
  "/controls",
  "/workspaces/pohoda",
  "/workspaces/abra-flexi",
  "/integrations",
  "/settings/organisation",
  "/trust-center",
];

for (const path of demoRoutes) {
  test(`public demo page ${path} includes a return-home path`, async ({
    page,
  }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("link", { name: "Domů" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(
      page.getByRole("link", { name: "Zpět na homepage Splnit.eu" }),
    ).toHaveAttribute("href", "/");
  });
}

for (const path of appShellRoutes) {
  test(`protected app route ${path} does not expose the app shell without auth`, async ({
    page,
  }) => {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    const status = response?.status() ?? 0;

    if (status === 503) {
      await expect(page.locator("body")).toContainText("Authentication is not configured.");
      return;
    }

    if (page.url().includes("/sign-in")) {
      await expect(page.locator("body")).toContainText(/Sign in|Přihlásit|Přihlášení/i);
      return;
    }

    await expect(
      page
        .locator("aside")
        .filter({ has: page.getByRole("link", { name: "Dashboard" }) }),
    ).toHaveCount(0);
  });
}
