import { expect, type Page, test } from "@playwright/test";

async function expectCurrentBillingSurface(page: Page) {
  await expect(page.getByRole("heading", { name: "Předplatné" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Vyberte plán" })).toBeVisible();
  await expect(page.getByText("490 Kč/měsíc")).toBeVisible();
  await expect(page.getByText("1 990 Kč/měsíc")).toBeVisible();

  for (const button of await page
    .getByRole("button", { name: "Předplatit" })
    .all()) {
    await expect(button).toBeDisabled();
  }
}

test.describe("English-prefixed billing route", () => {
  test.use({ locale: "en-US" });

  test("shows current CZK billing settings and keeps checkout disabled without auth", async ({
    page,
  }) => {
    await page.goto("/en/settings/billing");

    await expectCurrentBillingSurface(page);
  });
});

test.describe("Italian-prefixed billing route", () => {
  test.use({ locale: "it-IT" });

  test("shows current CZK billing settings", async ({ page }) => {
    await page.goto("/it/settings/billing");

    await expectCurrentBillingSurface(page);
  });
});

test.describe("Czech billing", () => {
  test.use({ locale: "cs-CZ" });

  test("shows Czech copy with CZK pricing", async ({ page }) => {
    await page.goto("/settings/billing");

    await expectCurrentBillingSurface(page);
  });
});
