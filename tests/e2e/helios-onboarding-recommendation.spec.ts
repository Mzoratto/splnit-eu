import { expect, test } from "@playwright/test";
import { gotoWithRetry } from "./helpers";

const automatedIntegrationCopy = /automated\s+(evidence|integration)|runtime\s+api|live\s+(mes|scada|edi)\s+checks/i;

test.use({ locale: "cs-CZ" });

test("recommends Helios from onboarding and exposes safe controls callout", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "splnit:onboarding-draft:v1",
      JSON.stringify({
        company: {
          country: "CZ",
          employeeCount: "50-249",
          ico: "12345678",
          locale: "cs-CZ",
          name: "Helios Flow Demo s.r.o.",
          primaryJurisdiction: "CZ",
          sector: "manufacturing",
        },
        intake: {
          accountingPlatform: "helios",
          businessModel: "physical_operations",
          employeeBand: "50_249",
          handlesPersonalData: "customers_and_employees",
          handlesSensitiveData: false,
          hasCriticalOperations: true,
          hasProductionSoftware: true,
          hasPublicApp: false,
          sector: "manufacturing",
          usesAiSystems: "none",
          usesCloudHosting: false,
          usesHighRiskAi: false,
          usesThirdPartyProcessors: "few",
        },
        intakeSectionIndex: 7,
        selectedFrameworks: ["nis2"],
        selectedTools: [],
        step: 5,
      }),
    );
  });

  await gotoWithRetry(page, "/onboarding");

  const recommendation = page
    .locator("div")
    .filter({ hasText: "Doporučení pracovního prostoru" })
    .filter({ hasText: "Helios (Asseco)" })
    .first();

  await expect(recommendation).toBeVisible({ timeout: 15_000 });
  await expect(recommendation).toContainText("Helios (Asseco)");
  await expect(recommendation).toContainText(/SQL Server zálohy/i);
  await expect(recommendation).toContainText(/přístupy/i);
  await expect(recommendation).toContainText(/MES\/SCADA/i);
  await expect(recommendation).toContainText(/EDI zabezpečení/i);
  await expect(page.locator("body")).not.toContainText(automatedIntegrationCopy);

  await gotoWithRetry(page, "/controls");

  const callout = page.getByRole("link", {
    name: /Helios \(Asseco\).*compliance workspace/i,
  });
  await expect(callout).toBeVisible({ timeout: 15_000 });
  await expect(callout).toHaveAttribute("href", /\/workspaces\/helios$/);
  await expect(page.locator("body")).not.toContainText(automatedIntegrationCopy);
});
