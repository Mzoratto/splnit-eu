import { expect, test } from "@playwright/test";

test.describe("English billing", () => {
  test.use({ locale: "en-US" });

  test("shows CZK billing settings and keeps checkout disabled without auth", async ({
    page,
  }) => {
    await page.goto("/en/settings/billing");

    await expect(page.getByRole("heading", { name: "Subscription" })).toBeVisible();
    await expect(page.getByText("Current plan", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Free" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stripe connection" })).toBeVisible();
    await expect(
      page.getByText(
        "Checkout and portal actions are disabled in this environment until Stripe billing keys are configured.",
      ),
    ).toBeVisible();
    await expect(page.getByText("490 Kč/month")).toBeVisible();
    await expect(page.getByText("1 990 Kč/month")).toBeVisible();

    for (const button of await page
      .getByRole("button", { name: /subscribe/i })
      .all()) {
      await expect(button).toBeDisabled();
    }
  });
});

test.describe("Italian billing", () => {
  test.use({ locale: "it-IT" });

  test("shows Italian copy with CZK pricing", async ({ page }) => {
    await page.goto("/it/settings/billing");

    await expect(page.getByRole("heading", { name: "Abbonamento" })).toBeVisible();
    await expect(page.getByText("Piano attuale", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gratis" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Connessione Stripe" })).toBeVisible();
    await expect(page.getByText("490 Kč/mese")).toBeVisible();
    await expect(page.getByText("1 990 Kč/mese")).toBeVisible();
  });
});

test.describe("Czech billing", () => {
  test.use({ locale: "cs-CZ" });

  test("shows Czech copy with CZK pricing", async ({ page }) => {
    await page.goto("/settings/billing");

    await expect(page.getByRole("heading", { name: "Předplatné" })).toBeVisible();
    await expect(page.getByText("Aktuální plán", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stripe připojení" })).toBeVisible();
    await expect(page.getByText("490 Kč/měsíc")).toBeVisible();
    await expect(page.getByText("1 990 Kč/měsíc")).toBeVisible();
  });
});
