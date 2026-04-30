import { expect, test } from "@playwright/test";

test("walks the onboarding wizard to the score reveal", async ({ page }) => {
  await page.goto("/onboarding");

  await expect(
    page.getByRole("heading", { name: "Nastavení organizace" }),
  ).toBeVisible();

  await page.getByLabel("Název firmy").fill("Splnit Demo s.r.o.");
  await page.getByLabel("IČO").fill("12345678");
  await page.getByLabel("Sektor").selectOption("technology");
  await page.getByLabel("Počet zaměstnanců").selectOption("10-49");

  await page.getByRole("button", { name: "Frameworky" }).click();
  await page.getByRole("button", { name: /EU AI Act/ }).click();
  await page.getByRole("button", { name: "Nástroje" }).click();
  await page.getByRole("button", { name: /ChatGPT/ }).click();
  await page.getByRole("button", { name: /Microsoft Copilot/ }).click();
  await page.getByRole("button", { name: "Integrace" }).click();

  await expect(
    page.getByRole("heading", { name: "Doporučená integrace" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Otevřít nastavení integrace/ }),
  ).toHaveAttribute("href", "/integrations/microsoft365");

  await page.getByRole("button", { name: "Skóre", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "První baseline je připravená" }),
  ).toBeVisible();
  await expect(page.getByText("60%")).toBeVisible();
});
