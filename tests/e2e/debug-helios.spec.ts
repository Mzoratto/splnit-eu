import { test, expect } from '@playwright/test';
import { checkRadio } from "./helpers";

// Try different RSC payload formats to find one that doesn't crash
const RSC_VARIANTS = [
  // Variant 1: current pohoda format
  '0:{"a":"$@1","f":null}\n1:{"assessmentResult":"pass","controlId":"test","evidenceId":"test"}\n',
  // Variant 2: no flight data field
  '0:{"a":"$@1"}\n1:{"assessmentResult":"pass","controlId":"test","evidenceId":"test"}\n',
  // Variant 3: flight as undefined/empty object
  '0:{"a":"$@1","f":{}}\n1:{"assessmentResult":"pass","controlId":"test","evidenceId":"test"}\n',
  // Variant 4: simpler inline
  '0:{"assessmentResult":"pass","controlId":"test","evidenceId":"test"}\n',
];

for (let i = 0; i < RSC_VARIANTS.length; i++) {
  test(`debug rsc variant ${i}`, async ({ page }) => {
    let actionIntercepted = false;
    const RSC = RSC_VARIANTS[i];
    console.log(`Testing variant ${i}: ${RSC.substring(0, 60)}`);

    await page.route("**/workspaces/helios", async (route, request) => {
      if (request.method() === "POST" && request.headers()["next-action"]) {
        actionIntercepted = true;
        await route.fulfill({
          status: 200,
          headers: { "content-type": "text/x-component", "x-action-revalidated": "[[],0,0]" },
          body: RSC,
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/workspaces/helios");
    await expect(page.getByRole("heading", { name: "Helios (Asseco)" })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Řízení přístupu a správa identit" }).click();
    
    const expandButton = page
      .getByRole("button", { expanded: false })
      .filter({ hasText: /Jsou uživatelé Heliosu spravováni s individuálními účty/ });
    await expandButton.click();
    await expect(page.getByRole("group", { name: "Vaše odpověď" })).toBeVisible();

    const yesRadio = page.getByRole("radio", { name: "Ano / hotovo" });
    await checkRadio(yesRadio);
    await expect(yesRadio).toBeChecked();
    await page.getByRole("button", { name: "Uložit prohlášení" }).click();
    
    await page.waitForTimeout(2000);
    
    const savedVisible = await page.getByText("Čestné prohlášení uloženo. Obnovte stránku pro zobrazení aktualizovaného stavu.").isVisible();
    const formText = await page.locator('form').first().textContent().catch(() => 'no form');
    console.log(`variant ${i} result - intercepted: ${actionIntercepted}, saved: ${savedVisible}, formSnippet: ${formText?.substring(0, 100)}`);
  });
}
