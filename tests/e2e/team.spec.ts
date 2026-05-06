import { expect, test } from "@playwright/test";

test.use({ locale: "cs-CZ" });

test("marks unfinished team modules as coming soon", async ({ page }) => {
  await page.goto("/team");

  await expect(
    page.getByRole("heading", { name: "Přístupy a školení" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Přístupové revize/ }),
  ).toHaveAttribute("href", "/team/access-reviews");
  await expect(
    page.getByRole("heading", { exact: true, name: "Role a oprávnění" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { exact: true, name: "Školení" }),
  ).toBeVisible();
  await expect(page.getByText("Připravuje se")).toHaveCount(2);
});
