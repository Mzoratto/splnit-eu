import { expect, test } from "@playwright/test";

test.use({ locale: "en-US" });

test("separates active framework scope from available framework library", async ({
  page,
}) => {
  await page.goto("/frameworks");

  await expect(page.getByRole("heading", { name: "Active frameworks" })).toBeVisible();
  await expect(
    page.getByText("Start by activating one framework. NIS2 is the usual first baseline for EU cybersecurity readiness."),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Available to activate" })).toBeVisible();
});

test("separates in-scope controls from the available control library", async ({
  page,
}) => {
  await page.goto("/controls");

  await expect(page.getByRole("heading", { name: "Controls in scope" })).toBeVisible();
  await expect(
    page.getByText("Controls appear here after a framework is activated. Start with framework setup to create the first control scope."),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Available control library" })).toBeVisible();
});

test("guides first-time tenants through empty evidence and policy states", async ({
  page,
}) => {
  await page.goto("/evidence");

  await expect(page.getByRole("heading", { name: "Evidence records" })).toBeVisible();
  await expect(
    page.getByText("Evidence will appear after framework setup, integrations, uploads, or generated documents create the first control records."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Set up a framework" })).toHaveAttribute("href", "/frameworks");

  await page.goto("/policies");

  await expect(
    page.getByText(
      /No draft has been generated yet|Zatím není vygenerovaný žádný draft/,
    ).first(),
  ).toBeVisible();
});
