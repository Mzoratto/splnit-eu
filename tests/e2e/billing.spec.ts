import { expect, type Page, test } from "@playwright/test";

type BillingExpectations = {
  agencyPrice: string;
  choosePlan: string;
  subscribe: string;
  subscription: string;
  smePrice: string;
};

const billingCopy = {
  cs: {
    agencyPrice: "1 990 Kč/měsíc",
    choosePlan: "Vyberte plán",
    smePrice: "490 Kč/měsíc",
    subscribe: "Předplatit",
    subscription: "Předplatné",
  },
  en: {
    agencyPrice: "1 990 Kč/month",
    choosePlan: "Choose a plan",
    smePrice: "490 Kč/month",
    subscribe: "Subscribe",
    subscription: "Subscription",
  },
  it: {
    agencyPrice: "1 990 Kč/mese",
    choosePlan: "Scegli un piano",
    smePrice: "490 Kč/mese",
    subscribe: "Abbonati",
    subscription: "Abbonamento",
  },
} satisfies Record<string, BillingExpectations>;

async function expectCurrentBillingSurface(
  page: Page,
  copy: BillingExpectations,
) {
  await expect(page.getByRole("heading", { name: copy.subscription })).toBeVisible();
  await expect(page.getByRole("heading", { name: copy.choosePlan })).toBeVisible();
  await expect(page.getByText(copy.smePrice)).toBeVisible();
  await expect(page.getByText(copy.agencyPrice)).toBeVisible();

  for (const button of await page
    .getByRole("button", { name: copy.subscribe })
    .all()) {
    await expect(button).toBeDisabled();
  }
}

test.describe("English-prefixed billing route", () => {
  test.use({ locale: "en-US" });

  test("shows current CZK billing settings and keeps checkout disabled without auth", async ({
    page,
  }) => {
    await page.goto("/en/settings/billing");

    await expectCurrentBillingSurface(page, billingCopy.en);
  });
});

test.describe("Italian-prefixed billing route", () => {
  test.use({ locale: "it-IT" });

  test("shows current CZK billing settings", async ({ page }) => {
    await page.goto("/it/settings/billing");

    await expectCurrentBillingSurface(page, billingCopy.it);
  });
});

test.describe("Czech billing", () => {
  test.use({ locale: "cs-CZ" });

  test("shows Czech copy with CZK pricing", async ({ page }) => {
    await page.goto("/settings/billing");

    await expectCurrentBillingSurface(page, billingCopy.cs);
  });
});
