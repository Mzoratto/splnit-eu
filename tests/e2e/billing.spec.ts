import { expect, test } from "@playwright/test";

test.describe("English billing", () => {
  test.use({ locale: "en-US" });

  test("shows EUR billing settings and keeps checkout disabled without auth", async ({
    page,
  }) => {
    await page.goto("/settings/billing");

    await expect(page.getByRole("heading", { name: "Subscription" })).toBeVisible();
    await expect(page.getByText("Current plan", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Free" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stripe connection" })).toBeVisible();
    await expect(page.getByText("€1,475/month")).toBeVisible();

    for (const button of await page
      .getByRole("button", { name: /checkout/i })
      .all()) {
      await expect(button).toBeDisabled();
    }
  });
});

test.describe("Italian billing", () => {
  test.use({ locale: "it-IT" });

  test("shows Italian copy with EUR pricing", async ({ page }) => {
    await page.goto("/settings/billing");

    await expect(page.getByRole("heading", { name: "Abbonamento" })).toBeVisible();
    await expect(page.getByText("Piano attuale", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gratis" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Connessione Stripe" })).toBeVisible();
    await expect(page.getByText(/1475\s€\/mese/)).toBeVisible();
  });
});

test.describe("Czech billing", () => {
  test.use({ locale: "cs-CZ" });

  test("shows Czech copy with CZK pricing", async ({ page }) => {
    await page.goto("/settings/billing");

    await expect(page.getByRole("heading", { name: "Předplatné" })).toBeVisible();
    await expect(page.getByText("Aktuální plán", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stripe připojení" })).toBeVisible();
    await expect(page.getByText(/1\s475\sKč\/měsíc/)).toBeVisible();
  });
});
