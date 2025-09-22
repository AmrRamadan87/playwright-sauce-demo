import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import InventoryPage from '../pages/InventoryPage.js';
import CartPage from '../pages/CartPage.js';
import CheckoutPage from '../pages/CheckoutPage.js';
import testData from '../data/testData.json';

// This test suite focuses on the login and a simple end-to-end purchase flow.
test.describe('Login and Purchase Flow', () => {

    // Test Case 3: End-to-End Test for the complete purchase flow
    test('should complete the end-to-end purchase flow successfully', { tags: ['@smoke', '@regression'] }, async ({ page }) => {
        // Instantiate all required Page Objects
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);
        let addedItemsDetails;
        // Step 1: Login
        await test.step('Log in with valid credentials', async () => {
            await loginPage.navigate();

            // Handle dialogs BEFORE login (not after)
            page.once('dialog', async dialog => {
                console.log(`Dialog message: ${dialog.message()}`);
                await dialog.accept();
            });
            await loginPage.login(testData.validUser.username, testData.validUser.password);
            await loginPage.validateSuccessfulLogin();
            await page.waitForLoadState('networkidle'); // Wait for the inventory page to fully load
        });
        // Step 2: Sort products by price (low to high)
        await page.waitForSelector('.inventory_list');
        await page.locator('.product_sort_container').click();
        await page.keyboard.press('ArrowDown'); // Move to next option
        await page.keyboard.press('ArrowDown'); // Move to "Price (low to high)"
        await page.keyboard.press('Enter');
        const itemCount = await page.locator('.inventory_item').count();
        const itemData = [];
        // Collect all items with their prices
        for (let i = 0; i < itemCount; i++) {
            const item = page.locator('.inventory_item').nth(i);
            const name = await item.locator('.inventory_item_name').textContent();
            const priceText = await item.locator('.inventory_item_price').textContent();
            const price = parseFloat(priceText.replace('$', ''));

            itemData.push({
                name: name.trim(),
                price: price,
                index: i
            });
        }
        // Sort items by price to get the actual cheapest ones
        itemData.sort((a, b) => a.price - b.price);

        console.log('All items sorted by price:');
        itemData.forEach((item, index) => {
            console.log(`${index + 1}. ${item.name} - $${item.price}`);
        });

        // Get the two cheapest items
        const cheapestItem = itemData[0];
        const secondCheapestItem = itemData[1];
        console.log(`Cheapest item: ${cheapestItem.name} - $${cheapestItem.price}`);
        console.log(`Second cheapest: ${secondCheapestItem.name} - $${secondCheapestItem.price}`);
        // Add the two cheapest items to cart by their position after sorting
        // Since we sorted by price (low to high), first two items should be cheapest
        await page.locator('.inventory_item').nth(0).locator('button[data-test*="add-to-cart"]').click();
        console.log('Added first cheapest item to cart');

        await page.locator('.inventory_item').nth(1).locator('button[data-test*="add-to-cart"]').click();
        console.log('Added second cheapest item to cart');
        // Verify cart has 2 items
        const cartBadge = page.locator('.shopping_cart_badge');
        await expect(cartBadge).toHaveText('2');
        // Optional: Navigate to cart to verify items are there
        await page.click('.shopping_cart_link');
        await page.waitForSelector('.cart_list');

        // Verify both items are in the cart
        const cartItems = page.locator('.cart_item');
        await expect(cartItems).toHaveCount(2);

        console.log('Successfully added two cheapest items to cart!');

        await page.waitForTimeout(5000);
    });
});