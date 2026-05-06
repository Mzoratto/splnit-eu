import { expect, test } from "@playwright/test";

test.use({ locale: "en-US" });

test("separates active framework scope from available framework library", async ({
  page,
}) => {
  await page.goto("/frameworks");

  await expect(page.getByRole("heading", { name: "Active frameworks" })).toBeVisible();
  await expect(page.getByText("No frameworks are active yet.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Available to activate" })).toBeVisible();
});

test("separates in-scope controls from the available control library", async ({
  page,
}) => {
  await page.goto("/controls");

  await expect(page.getByRole("heading", { name: "Controls in scope" })).toBeVisible();
  await expect(
    page.getByText("No controls are in scope yet because no framework is active."),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Available control library" })).toBeVisible();
});
