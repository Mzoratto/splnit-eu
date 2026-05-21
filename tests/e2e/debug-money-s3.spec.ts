import { test, expect } from '@playwright/test';

test('debug intercept', async ({ page }) => {
  const interceptedUrls: string[] = [];
  
  await page.route('**/*', async (route, request) => {
    if (request.method() === 'POST') {
      interceptedUrls.push(`POST ${request.url()}`);
    }
    await route.continue();
  });
  
  await page.goto('/workspaces/money-s3');
  
  await expect(
    page.getByRole('heading', { name: 'Money S3 / S4 (Seyfor)' }),
  ).toBeVisible({ timeout: 15_000 });
  
  await page.getByRole('button', { name: 'Zálohy a obnova po havárii' }).click();
  
  const expandButton = page
    .getByRole('button', { expanded: false })
    .filter({ hasText: /Je záloha databáze Money S3 automatizována/ });
  await expandButton.click();
  
  const yesLabel = page.locator(
    `label:has(input[value="yes"][name="attest-money-s3-backup-automated-daily"])`,
  );
  await yesLabel.click({ force: true });
  await page.getByRole('button', { name: 'Save attestation' }).click();
  
  await page.waitForTimeout(5000);
  
  console.log('POST URLs intercepted:', JSON.stringify(interceptedUrls));
  expect(interceptedUrls.length).toBeGreaterThan(0);
});
