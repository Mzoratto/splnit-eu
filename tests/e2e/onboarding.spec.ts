import { expect, test } from "@playwright/test";

test.use({ locale: "cs-CZ" });

test("walks the focused intake flow to the reveal modal", async ({ page }) => {
  await page.goto("/onboarding");

  await expect(
    page.getByRole("heading", { name: "Nastavení organizace" }),
  ).toBeVisible();

  await page.getByLabel("Název firmy").fill("Splnit Demo s.r.o.");
  await page.getByLabel("IČO").fill("12345678");
  await page.getByLabel("Sektor").selectOption("technology");
  await page.getByLabel("Počet zaměstnanců").selectOption("10-49");
  await page.getByRole("button", { name: /Pokračovat/ }).click();

  await expect(page.getByText("Intake · sekce 1 ze 8")).toBeVisible();
  await expect(page.getByText("Postup intake")).toBeVisible();
  await expect(page.getByText("~8 min zbývá")).toBeVisible();
  await expect(page.getByText(/Autosave: odpovědi se ukládají průběžně/)).toBeVisible();
  await expect(page.getByText("Který obchodní model organizaci nejlépe vystihuje?")).toBeVisible();

  await page.getByRole("radio").first().check();
  await expect(page.getByText(/Radio volba je výběr jedné odpovědi/)).toBeVisible();

  for (let section = 2; section <= 8; section += 1) {
    await page.getByRole("button", { name: "Další sekce" }).click();
    await expect(page.getByText(`Intake · sekce ${section} ze 8`)).toBeVisible();

    if (section === 5) {
      await expect(page.getByText(/Checkbox je nezávislý/).first()).toBeVisible();
      await page.getByRole("checkbox").first().check();
    }
  }

  await expect(page.getByRole("button", { name: "Dokončit intake" })).toBeVisible();
  await page.getByRole("button", { name: "Dokončit intake" }).click();

  await expect(
    page.getByRole("dialog", { name: "První mezery jsou připravené" }),
  ).toBeVisible();
  await expect(page.getByText("Prioritních mezer")).toBeVisible();
  await expect(page.getByText("Microsoft 365")).toBeVisible();

  await page.getByRole("button", { name: "Pokračovat na nástroje" }).click();
  await expect(page.getByRole("heading", { name: "AI nástroje a SaaS inventář" })).toBeVisible();
});

test("restores intake draft and recommends the selected first integration", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "splnit:onboarding-draft:v1",
      JSON.stringify({
        company: {
          country: "CZ",
          employeeCount: "10-49",
          ico: "",
          locale: "cs-CZ",
          name: "Draft Demo s.r.o.",
          primaryJurisdiction: "CZ",
          sector: "technology",
        },
        intake: {
          businessModel: "saas",
          employeeBand: "10_49",
          handlesPersonalData: "customers_and_employees",
          handlesSensitiveData: false,
          hasCriticalOperations: false,
          hasProductionSoftware: true,
          hasPublicApp: true,
          sector: "technology",
          usesAiSystems: "internal_productivity",
          usesCloudHosting: true,
          usesHighRiskAi: false,
          usesThirdPartyProcessors: "few",
        },
        intakeSectionIndex: 3,
        selectedFrameworks: ["nis2"],
        selectedTools: ["github", "aws"],
        step: 2,
      }),
    );
  });

  await page.goto("/onboarding");

  await expect(page.getByText("Intake · sekce 4 ze 8")).toBeVisible();
  await expect(page.getByText(/Autosave: odpovědi se ukládají průběžně/)).toBeVisible();

  for (let section = 5; section <= 8; section += 1) {
    await page.getByRole("button", { name: "Další sekce" }).click();
    await expect(page.getByText(`Intake · sekce ${section} ze 8`)).toBeVisible();
  }

  await page.getByRole("button", { name: "Dokončit intake" }).click();

  const dialog = page.getByRole("dialog", { name: "První mezery jsou připravené" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("GitHub")).toBeVisible();
  await expect(dialog.getByText("Microsoft 365")).toHaveCount(0);
});
