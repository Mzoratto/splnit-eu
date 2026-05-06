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
    page.getByText("Akce připojení jsou vypnuté", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("Conditional Access policies enabled"),
  ).toBeVisible();
  await expect(page.getByText("Výsledky se zobrazí po prvním automatickém běhu.")).toBeVisible();
});

test("renders the integrations hub with clear available and coming-soon states", async ({
  page,
}) => {
  await page.goto("/integrations");

  await expect(
    page.getByRole("heading", { name: "Automatické testy" }),
  ).toBeVisible();

  for (const provider of ["Microsoft 365", "GitHub", "AWS"]) {
    const card = page.locator("article", {
      has: page.getByRole("heading", { name: provider }),
    });
    await expect(card.getByRole("link", { name: /Připojit/ })).toBeVisible();
  }

  const googleCard = page.locator("article", {
    has: page.getByRole("heading", { name: "Google Workspace" }),
  });
  await expect(googleCard.getByText("Připravuje se")).toBeVisible();
  await expect(
    googleCard.getByText("Produkční kontroly zatím nejsou zapnuté."),
  ).toBeVisible();
  await expect(
    googleCard.getByRole("link", { name: /Zobrazit plán/ }),
  ).toHaveAttribute("href", "/integrations/google-workspace");
  await expect(
    googleCard.getByRole("button", { name: "Připravuje se" }),
  ).toHaveCount(0);
});

test("renders GitHub and AWS integration surfaces without dead connection states", async ({
  page,
}) => {
  await page.goto("/integrations/github");
  await expect(
    page.getByRole("heading", { name: "GitHub integrace" }),
  ).toBeVisible();
  await expect(page.getByText("Akce připojení jsou vypnuté", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Instalovat GitHub App" })).toBeDisabled();

  await page.goto("/integrations/aws");
  await expect(page.getByRole("heading", { name: "AWS integrace" })).toBeVisible();
  await expect(page.getByText("Akce připojení jsou vypnuté", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Validovat a uložit" })).toBeDisabled();
  await expect(page.getByText("CloudFormation")).toBeVisible();
});

test("renders planned integration details without enabling OAuth", async ({
  page,
}) => {
  await page.goto("/integrations/google-workspace");

  await expect(
    page.getByRole("heading", { name: "Google Workspace" }),
  ).toBeVisible();
  await expect(page.getByText("Připravuje se")).toBeVisible();
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
