import { test, expect } from '@playwright/test';

test('Guest Shopping Flow', async ({ page }) => {
  test.setTimeout(60000);
  // 1. Visit Homepage
  await page.goto('/');
  await expect(page).toHaveTitle(/KöşeBaşı Market/);

  // 2. Add a Product to Cart
  // First, click "Alışverişe Başla" to see products
  console.log('Clicking Start Shopping...');
  await page.click('button:has-text("Alışverişe Başla")');
  console.log('Waiting for products...');
  // await page.waitForLoadState('networkidle'); // Networkidle can be flaky if polling exists

  // Wait for at least one "Add to Cart" button to appear
  console.log('Looking for Add to Cart...');
  const addToCartBtn = page.getByLabel('Sepete ekle').first();
  await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Adding to cart...');
  await addToCartBtn.click();
  
  // Wait for cart badge to update
  console.log('Waiting for cart badge update...');
  // Target the span inside the cart link that contains the count
  const badge = page.locator('a[href="/cart"] span').first();
  await expect(badge).toHaveText('1', { timeout: 10000 });

  console.log('Cart updated. Navigating...');
  await page.getByRole('link', { name: 'Sepet' }).click({ force: true });
  await expect(page).toHaveURL(/.*\/cart/);
  
  // Verify Cart Step 1
  await expect(page.getByRole('heading', { name: 'Sepetim' })).toBeVisible();
  await expect(page.getByText('Ara Toplam:')).toBeVisible();
  
  await page.click('button:has-text("Sonraki")');

  // 4. Fill Guest Details (Step 2)
  await expect(page.getByText('Misafir girişi ile devam ediyorsunuz')).toBeVisible();
  
  await page.getByPlaceholder('Adınız Soyadınız').fill('Misafir Kullanıcı');
  await page.getByPlaceholder('ornek@email.com').fill('misafir@test.com');
  
  // For Address and Phone, using generic locators based on labels/placeholders
  await page.getByPlaceholder('Mahalle, cadde, no, daire, tarif...').fill('Test Adresi Mahallesi No:1');
  await page.getByPlaceholder('05XX XXX XX XX').fill('05551234567');

  await page.click('button:has-text("Sonraki")');

  // 5. Payment (Step 3)
  await expect(page.getByText('Ödeme Yöntemleri')).toBeVisible();
  
  // Select "Kapıda Nakit"
  await page.click('button:has-text("Kapıda Nakit")');

  // 6. Complete Order
  await page.click('button:has-text("Siparişi Tamamla")');

  // 7. Verification
  // Should redirect to success page
  try {
    await expect(page).toHaveURL(/\/order-success/, { timeout: 15000 });
  } catch (e) {
    console.log('Checkout failed. Current Page Text Dump:');
    console.log(await page.textContent('body'));
    throw e;
  }
  await expect(page.getByText('Siparişiniz Alındı!')).toBeVisible();
});
