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
  test(`authenticated app route ${path} keeps the shared navigation shell`, async ({
    page,
  }, testInfo) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const sidebar = page.locator("aside").filter({
      has: page.getByRole("link", { name: "Dashboard" }),
    });

    await expect(page.getByRole("banner")).toBeVisible();
    if (testInfo.project.name === "mobile-chrome") {
      await expect(
        page.locator("nav").filter({
          has: page.getByRole("link", { name: "Dashboard" }),
        }).last(),
      ).toBeVisible();
    } else {
      await expect(sidebar).toContainText("Splnit.eu");
    }
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Kontroly" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nastavení" })).toBeVisible();
  });
}
