import { expect, test } from "@playwright/test";

test.use({ locale: "en-US" });

const appPages = [
  {
    notice: /Demo mode: live data will load|Demo režim: živá data se načtou/,
    path: "/dashboard",
  },
  {
    notice: /Local demo data|Lokální demo data/,
    path: "/risks",
  },
  {
    notice: /Local demo data|Lokální demo data/,
    path: "/incidents",
  },
  {
    notice: /Local demo data|Lokální demo data/,
    path: "/frameworks/nis2",
  },
  {
    notice: /Local demo data|Lokální demo data/,
    path: "/vendors",
  },
  {
    notice: /Local demo data|Lokální demo data/,
    path: "/trust-center",
  },
];

for (const appPage of appPages) {
  test(`labels local demo data on ${appPage.path}`, async ({ page }) => {
    await page.goto(appPage.path, { waitUntil: "domcontentloaded" });

    await expect(page.getByText(appPage.notice)).toBeVisible();
  });
}

test("does not link the authenticated Trust Center to the sample public demo", async ({
  page,
}) => {
  await page.goto("/trust-center", { waitUntil: "domcontentloaded" });
  await expect(page.locator('main a[href="/trust/demo"]')).toHaveCount(0);
});

test("public demo Trust Center is explicitly labeled as sample data", async ({
  page,
}) => {
  await page.goto("/trust/demo", { waitUntil: "domcontentloaded" });

  await expect(page.getByText(/Sample Trust Center|Ukázkový Trust Center/)).toBeVisible();
  await expect(page.getByText("splnit.eu/trust/demo")).toBeVisible();
  await expect(page.getByText(/VERIFIED CONTINUOUSLY|PRŮBĚŽNĚ OVĚŘOVÁNO/)).toHaveCount(0);
  await expect(page.getByText("Live", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText(
      /This public page uses sample data|Tato veřejná stránka používá ukázková data/,
    ),
  ).toBeVisible();

  await page.goto("/trust/demo/frameworks/nis2", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Sample Trust Center|Ukázkový Trust Center/)).toBeVisible();
  await expect(page.getByText("splnit.eu/trust/demo")).toBeVisible();
  await expect(page.getByText(/VERIFIED CONTINUOUSLY|PRŮBĚŽNĚ OVĚŘOVÁNO/)).toHaveCount(0);
});

test("marketing demo Trust Center link is named as a sample", async ({
  page,
}) => {
  await page.goto("/platform", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("splnit.eu/trust/demo")).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: /View sample Trust Center →|Zobrazit ukázkový Trust Center →/,
    }),
  ).toHaveAttribute("href", "/trust/demo");
});
