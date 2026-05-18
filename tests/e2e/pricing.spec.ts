import { expect, test } from "@playwright/test";

test.describe("Marketing pricing", () => {
  test.use({ locale: "cs-CZ" });

  test("shows partner pricing in CZK on Czech pricing page", async ({ page }) => {
    await page.goto("/cenik");

    await expect(
      page.getByRole("heading", { name: "Jste poradce nebo MSP?" }),
    ).toBeVisible();
    await expect(page.getByText("7 475 Kč/měsíc")).toBeVisible();
    await expect(page.getByText("€299 / měsíc")).toHaveCount(0);
  });
});
