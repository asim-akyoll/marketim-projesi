import { test, expect } from '@playwright/test';

test('Admin Login Flow', async ({ page }) => {
  console.log('Navigating to login page...');
  await page.goto('/login');

  // 1. Check title
  await expect(page).toHaveTitle(/KöşeBaşı Market/);

  // 2. Fill form using Labels
  await page.getByLabel('E-posta').fill('admin');
  await page.getByLabel('Şifre').fill('admin');

  // 3. Submit
  await page.click('button:has-text("Giriş Yap")');

  // 4. Wait for Success or Failure
  console.log('Waiting for response...');
  
  // Check for error message first (fast fail)
  const errorLocator = page.locator('.text-red-700');
  
  try {
    // Wait for either URL change or Error message
    await Promise.race([
      page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 }),
      errorLocator.waitFor({ state: 'visible', timeout: 30000 })
    ]);
  } catch (e) {
    console.log('Timeout waiting for login response.');
  }

  // Check if error appeared
  if (await errorLocator.isVisible()) {
    const msg = await errorLocator.textContent();
    throw new Error(`Login failed with UI error: "${msg}"`);
  }

  // 5. Verify URL and Content
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
