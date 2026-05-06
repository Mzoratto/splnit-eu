import { expect, test } from "@playwright/test";

test.use({ locale: "cs-CZ" });

test("renders organisation settings in readonly demo mode without auth", async ({
  page,
}) => {
  await page.goto("/settings/organisation");

  await expect(
    page.getByRole("heading", { exact: true, name: "Organizace" }),
  ).toBeVisible();
  await expect(page.getByLabel("Název firmy")).toHaveValue("Demo organizace");
  await expect(page.getByLabel("IČO")).toHaveValue("12345678");
  await expect(page.getByText("Demo jen pro čtení")).toBeVisible();
  await expect(page.getByRole("button", { name: /Uložit změny/ })).toBeDisabled();
  await expect(page.getByText("monitoring")).toBeVisible();
});
