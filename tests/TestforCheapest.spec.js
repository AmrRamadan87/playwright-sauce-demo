import { test, expect } from '@playwright/test';

test('Sample test to verify cheapest item', async ({ page }) => {

    page.on('dialog', async dialog => {
        console.log(`Alert appeared: ${dialog.message()}`);
        await dialog.accept();
    });

    await page.goto('https://www.saucedemo.com/');

    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await page.waitForTimeout(2000);
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