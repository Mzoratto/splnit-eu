import { expect, test } from "@playwright/test";

test("privacy page includes GDPR transparency basics", async ({ page }) => {
  await page.goto("/soukromi");

  await expect(
    page.getByRole("heading", { name: "Zásady ochrany soukromí" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Účely a právní základy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Práva subjektů údajů" })).toBeVisible();
  await expect(page.getByText("Úřadu pro ochranu osobních údajů")).toBeVisible();
});

test("cookie page can reopen consent controls", async ({ page }) => {
  await page.goto("/cookies");

  await page.getByRole("button", { name: "Odmítnout" }).click();
  await expect(page.getByRole("button", { name: "Přijmout" })).toBeHidden();

  await page.getByRole("button", { name: "Změnit nastavení cookies" }).click();

  await expect(page.getByRole("button", { name: "Přijmout" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Odmítnout" })).toBeVisible();
});

test("DPA page includes Article 28 operating terms", async ({ page }) => {
  await page.goto("/dpa");

  await expect(page.getByRole("heading", { name: "DPA a subdodavatelé" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pokyny zákazníka" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Audit a informace" })).toBeVisible();
  await expect(page.getByText("po skončení služby")).toBeVisible();
});
