import { expect, test } from "@playwright/test";

test.use({ locale: "en-US" });

test("separates active framework scope from available framework library", async ({
  page,
}) => {
  await page.goto("/frameworks");

  await expect(page.getByRole("heading", { name: /Active frameworks|Aktivní frameworky/ })).toBeVisible();
  await expect(
    page.getByText(/Start by activating one framework|Začněte aktivací jednoho frameworku/),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /Available to activate|Dostupné k zapnutí/ })).toBeVisible();
});

test("separates in-scope controls from the available control library", async ({
  page,
}) => {
  await page.goto("/controls");

  await expect(page.getByRole("heading", { name: /Controls in scope|Kontroly v rozsahu/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /In-scope controls|Kontroly v rozsahu/ })).toHaveAttribute(
    "href",
    "/controls",
  );
  await expect(
    page.getByRole("link", { name: /Out of scope \/ not applicable|Mimo rozsah \/ nerelevantní/ }),
  ).toHaveAttribute("href", "/controls?scope=out-of-scope");
  await expect(
    page.getByText(/Controls appear here after a framework is activated|Kontroly se zobrazí po aktivaci frameworku/),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /Available control library|Dostupná knihovna kontrol/ })).toBeVisible();
});

test("guides first-time tenants through empty evidence and policy states", async ({
  page,
}) => {
  await page.goto("/evidence");

  await expect(page.getByRole("heading", { name: /Evidence records|Záznamy evidence/ })).toBeVisible();
  await expect(
    page.getByText(/Evidence will appear after framework setup|Evidence se objeví po nastavení frameworku/),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Set up a framework|Nastavit framework/ })).toHaveAttribute("href", "/frameworks");

  await page.goto("/policies");

  await expect(
    page.getByText(
      /No draft has been generated yet|Zatím není vygenerovaný žádný draft/,
    ).first(),
  ).toBeVisible();
});
