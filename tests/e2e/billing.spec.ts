import { expect, test } from "@playwright/test";

test("shows billing settings and keeps checkout disabled without auth", async ({
  page,
}) => {
  await page.goto("/settings/billing");

  await expect(page.getByRole("heading", { name: "Subscription" })).toBeVisible();
  await expect(page.getByText("Current plan", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Free" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Stripe connection" })).toBeVisible();

  for (const button of await page
    .getByRole("button", { name: /checkout/i })
    .all()) {
    await expect(button).toBeDisabled();
  }
});
