import { test, expect } from '@playwright/test';

test('Admin Product Lifecycle', async ({ page }) => {
  test.setTimeout(60000); // Give it more time (default is 30s)
  console.log('Starting Admin Product Lifecycle Test...');

  // 1. Login
  console.log('Logging in...');
  await page.goto('/login');
  await page.fill('#email', 'admin'); 
  await page.fill('#password', 'admin'); 
  await page.click('button:has-text("Giriş Yap")');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 });
  console.log('Login successful.');

  // 2. Navigate to Products
  console.log('Navigating to Products...');
  await page.goto('/admin/products');
  // Verify heading
  await expect(page.getByRole('heading', { name: 'Ürün Yönetimi' })).toBeVisible({ timeout: 10000 });

  // 3. Open Add Modal
  console.log('Opening Add Modal...');
  try {
    const addBtn = page.getByText('Yeni Ürün Ekle');
    await addBtn.waitFor({ state: 'visible', timeout: 5000 });
    await addBtn.click();
  } catch (e) {
    console.log('Failed to find Add Button. Listing visible buttons:');
    const buttons = await page.getByRole('button').allInnerTexts();
    console.log(buttons);
    console.log('Page Content Dump:');
    console.log(await page.mainFrame().content());
    throw e;
  }
  await expect(page.getByRole('heading', { name: 'Yeni Ürün Ekle' })).toBeVisible();

  // 4. Fill Form
  console.log('Filling Form...');
  const testProductName = `Test Urun ${Date.now()}`;
  
  // Use explicit IDs for reliability
  await page.fill('#productName', testProductName);
  
  // Select Category
  // We need to wait for categories to be populated
  const catSelect = page.locator('#productCategory');
  await catSelect.waitFor({ state: 'visible' });
  
  // Select the second option (index 1) assuming first is "Meyve & Sebze" or similar
  // Or just pick the value of the first option
  // Let's just type the key if we knew it, but index is safer for generic test
  await catSelect.selectOption({ index: 0 }); 

  await page.fill('#productPrice', '100');
  await page.fill('#productStock', '50');
  await page.fill('#productUnit', 'Adet');

  // 5. Submit
  console.log('Submitting...');
  await page.click('button:has-text("Kaydet")');

  // 6. Verify in List
  console.log('Verifying...');
  // Wait for modal to close
  await expect(page.getByRole('heading', { name: 'Yeni Ürün Ekle' })).not.toBeVisible();
  
  // Search for the product
  await page.getByPlaceholder('Ürün ara...').fill(testProductName);
  // Wait for search debounce
  await page.waitForTimeout(1500); 
  
  await expect(page.getByText(testProductName)).toBeVisible({ timeout: 10000 });
  console.log('Product found!');
});
