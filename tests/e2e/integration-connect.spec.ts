import { expect, test } from "@playwright/test";

test.use({ locale: "cs-CZ" });

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

test("renders planned integration details without enabling OAuth", async ({
  page,
}) => {
  await page.goto("/integrations/google-workspace");

  await expect(
    page.getByRole("heading", { name: "Google Workspace" }),
  ).toBeVisible();
  await expect(page.getByText("PENDING")).toBeVisible();
  await expect(
    page.getByText(
      "OAuth tok ani ukládání tokenů pro tohoto poskytovatele zatím nejsou aktivní.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Zpět na integrace/ })).toHaveAttribute(
    "href",
    "/integrations",
  );
});
