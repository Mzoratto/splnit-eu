import { expect, test } from "@playwright/test";

test("renders the Microsoft 365 integration test suite", async ({ page }) => {
  await page.goto("/integrations/microsoft365");

  await expect(
    page.getByRole("heading", { name: "Microsoft 365 integrace" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Připojit Microsoft 365" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("heading", { name: "Automatické testy" }),
  ).toBeVisible();
  await expect(page.getByText("Microsoft 365 MFA enabled")).toBeVisible();
  await expect(
    page.getByText("Conditional Access policies enabled"),
  ).toBeVisible();
  await expect(page.getByText("Výsledky se zobrazí po prvním běhu runneru.")).toBeVisible();
});
