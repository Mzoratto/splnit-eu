import { expect, test } from "@playwright/test";

test.describe("Marketing pricing", () => {
  test.use({ locale: "cs-CZ" });

  test("shows Stripe-aligned pricing in CZK on Czech pricing page", async ({ page }) => {
    await page.goto("/cenik");

    await expect(
      page.getByRole("heading", { name: "Potřebujete klientský portál?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("article").filter({ hasText: "SME" }).getByText("1 490 Kč"),
    ).toBeVisible();
    await expect(
      page.getByRole("article").filter({ hasText: "Agency" }).getByText("4 990 Kč"),
    ).toBeVisible();
    await expect(page.getByText("Hetzner Cloud")).toBeVisible();
    await expect(page.getByText("OVHcloud")).toBeVisible();
    await expect(page.getByText("ABRA Flexi")).toBeVisible();
    await expect(page.getByText("Pohoda, Money S3/S4 a Helios")).toBeVisible();
    await expect(page.getByText("Azure")).toHaveCount(0);
    await expect(page.getByText("Starter")).toHaveCount(0);
    await expect(page.getByText("Business")).toHaveCount(0);
  });
});
