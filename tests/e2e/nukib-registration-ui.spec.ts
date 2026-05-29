import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { gotoWithRetry } from "./helpers";

const pagePath = "/compliance/nukib-registration";

function nukibTestOrgHeaders(testInfo: TestInfo) {
  const slug = testInfo.title
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return {
    "x-nukib-registration-test-org-id": `org_e2e_nukib_registration_ui_${testInfo.workerIndex}_${slug}`,
  };
}

async function installNukibApiOrgHeader(page: Page, testInfo: TestInfo) {
  const headers = nukibTestOrgHeaders(testInfo);

  await page.route("**/api/compliance/nukib-registration**", async (route) => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        ...headers,
      },
    });
  });

  return headers;
}

async function openRegistrationPage(page: Page, testInfo: TestInfo) {
  const headers = await installNukibApiOrgHeader(page, testInfo);

  await gotoWithRetry(page, pagePath);
  await expect(page.getByRole("heading", { name: "Registrace regulované služby" })).toBeVisible();
  await expect(page.getByText("Beta pro design partnery")).toBeVisible();
  await expect(page.getByText("Dosud nebyl vytvořen žádný záznam.")).toBeVisible();

  return headers;
}

async function fillValidRegistrationForm(page: Page) {
  await page.getByLabel("IČO", { exact: true }).fill("12345678");
  await page.getByLabel("Název organizace").fill("E2E NÚKIB Test s.r.o.");
  await page.getByLabel("Datová schránka").fill("a1b2c3d");
  await page.getByLabel("Kategorie služby").selectOption("digitalni_infrastruktura");
  await page.getByLabel("Režim povinností").selectOption("nizsi");
  await page.getByLabel("Velikost subjektu").selectOption("medium");
  await page
    .getByLabel("Popis služby")
    .fill("Syntetický popis regulované služby pro test uživatelského toku.");
  await page.getByLabel("Rozsah", { exact: true }).selectOption("cz_only");

  await page.getByPlaceholder("např. 192.0.2.0/24").first().fill("192.0.2.0/24");
  await page.getByRole("button", { name: "Přidat doménu" }).click();
  await page.getByPlaceholder("např. splnit.eu").nth(0).fill("example.test");
  await page.getByPlaceholder("např. splnit.eu").nth(1).fill("sluzba.example.test");

  const roles = ["primary", "technical", "statutory"];
  const names = ["Jana Testovací", "Petr Technický", "Eva Statutární"];
  const emails = ["jana.testovaci@example.test", "petr.technicky@example.test", "eva.statutarni@example.test"];
  const phones = ["+420 200 000 001", "+420 200 000 002", "+420 200 000 003"];
  const positions = ["Compliance", "IT", "Jednatelka"];

  for (let index = 0; index < roles.length; index += 1) {
    await page.getByLabel("Role").nth(index).selectOption(roles[index]);
    await page.getByLabel("Jméno", { exact: true }).nth(index).fill(names[index]);
    await page.getByLabel("E-mail").nth(index).fill(emails[index]);
    await page.getByLabel("Telefon").nth(index).fill(phones[index]);
    await page.getByLabel("Pozice").nth(index).fill(positions[index]);
  }

  await page
    .getByLabel("Vlastnická struktura")
    .fill("Syntetický vlastník bez reálných osobních údajů.");
  await page
    .getByLabel("Přeshraniční závislosti")
    .fill("Bez významných přeshraničních závislostí v testovacím scénáři.");
  await page.getByLabel("Manažer kybernetické bezpečnosti").selectOption("true");
}

test.use({ locale: "cs-CZ" });

test.describe("NÚKIB registration browser UI", () => {
  test("fills the beta artifact form, prepares latest status, and exposes a PDF", async ({
    page,
    request,
  }, testInfo) => {
    const headers = await openRegistrationPage(page, testInfo);

    await fillValidRegistrationForm(page);

    const submitResponse = page.waitForResponse((response) =>
      response.url().includes("/api/compliance/nukib-registration") &&
      response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Připravit registraci" }).click();
    expect((await submitResponse).ok()).toBe(true);

    await expect(page.getByText(/Poslední příprava:/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Stáhnout PDF" })).toBeVisible();

    const latestResponse = await request.get("/api/compliance/nukib-registration", { headers });
    expect(latestResponse.status()).toBe(200);
    const latestArtifact = (await latestResponse.json()) as { id: string; content: { organisationName: string } };
    expect(latestArtifact.content.organisationName).toBe("E2E NÚKIB Test s.r.o.");

    const pdfResponse = await request.get(
      `/api/compliance/nukib-registration/${latestArtifact.id}/pdf`,
      { headers },
    );
    expect(pdfResponse.status()).toBe(200);
    expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");
    expect((await pdfResponse.body()).byteLength).toBeGreaterThan(100);

    await expect(page.getByText(/nezaručuje přijetí ani splnění povinností/i)).toBeVisible();
    await expect(page.getByText(/nepodává formulář za vás/i)).toHaveCount(2);
    await expect(page.getByText(/garantuje soulad|podá formulář za vás|produkčně připravené podání/i)).toHaveCount(0);
  });

  test("surfaces validation for bad IČO, bad IP/CIDR, and missing required contact roles", async ({
    page,
  }, testInfo) => {
    await openRegistrationPage(page, testInfo);

    const ico = page.getByLabel("IČO", { exact: true });
    await ico.fill("123");
    await page.getByRole("button", { name: "Připravit registraci" }).click();
    await expect(ico).toBeFocused();
    await expect.poll(() => ico.evaluate((input: HTMLInputElement) => input.validationMessage)).not.toBe("");

    await fillValidRegistrationForm(page);
    await page.getByPlaceholder("např. 192.0.2.0/24").first().fill("999.999.999.999/99");
    await page.getByRole("button", { name: "Připravit registraci" }).click();
    await expect(
      page.getByText("Musí být platná IPv4 adresa nebo rozsah CIDR"),
    ).toBeVisible();

    await page.getByPlaceholder("např. 192.0.2.0/24").first().fill("192.0.2.0/24");
    await page.getByLabel("Role").nth(2).selectOption("primary");
    await expect(
      page.getByText("Chybí některá z povinných rolí: primární, technická, statutární."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Připravit registraci" }).click();
    await expect(
      page.getByText("Alespoň jeden kontakt musí mít roli primary, technical a statutory"),
    ).toBeVisible();
  });

  test("renders on mobile Chrome without horizontal overflow", async ({ page }, testInfo) => {
    await openRegistrationPage(page, testInfo);

    const overflow = await page.evaluate(() => ({
      bodyClientWidth: document.body.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
    }));

    expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.bodyClientWidth + 1);
    expect(overflow.documentScrollWidth).toBeLessThanOrEqual(overflow.documentClientWidth + 1);
  });
});
