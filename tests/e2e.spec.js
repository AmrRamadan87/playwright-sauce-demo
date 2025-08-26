import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import InventoryPage from '../pages/InventoryPage.js';
import CartPage from '../pages/CartPage.js';
import CheckoutPage from '../pages/CheckoutPage.js';
import testData from '../data/testData.json';

// This test suite focuses on the login and a simple end-to-end purchase flow.
test.describe('Login and Purchase Flow', () => { // Changed the describe block title to be more specific

    // Test Case 3: End-to-End Test for the complete purchase flow
    test('should complete the end-to-end purchase flow successfully', { tag: ['@smoke', '@regression'] }, async ({ page }) => {


        // Instantiate all required Page Objects
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);
        let addedItemsDetails;

        // Step 1: Login
        await test.step('Log in with valid credentials', async () => {
            await loginPage.navigate();
            // Add a listener here to handle any dialogs that may appear after login

            await loginPage.login(testData.validUser.username, testData.validUser.password);
            await loginPage.validateSuccessfulLogin();

            //handle the dialoug if appears
            page.once('dialog', async dialog => {
                console.log(`Dialog message: ${dialog.message()}`);
                await dialog.accept();
            });

            await page.waitForLoadState('networkidle'); // Wait for the inventory page to fully load
        });

        // Step 2: Sort products by price (low to high)
        await test.step('Sort products by price (low to high)', async () => {
            await page.waitForSelector('.inventory_list'); // Add a wait for the product list to be visible
            await inventoryPage.sortProductsBy('hilo');
            // Validate that the products are now sorted high to low
            await inventoryPage.validateHighToLowSort();
        });

        // Step 3: Add the two cheapest items to the cart and store their details
        await test.step('Add the two cheapest items to cart and get their details', async () => {
            addedItemsDetails = await inventoryPage.addTwoCheapestItemsAndGetDetails();
        });

        // Step 4: Verify item count on the cart icon
        await test.step('Verify item count on the cart icon', async () => {
            await cartPage.verifyItemCount();
        });

        // Step 5: Navigate to the cart and proceed to checkout
        await test.step('Navigate to the cart and proceed to checkout', async () => {
            await cartPage.navigateToCart();
            await cartPage.verifyItemsInCart(addedItemsDetails);
            await cartPage.proceedToCheckout();
        });

        // Step 6: Fill out the customer information
        await test.step('Fill out customer information', async () => {
            await checkoutPage.fillCustomerInfo(testData.customerData.firstName, testData.customerData.lastName, testData.customerData.postalCode);
            await page.waitForLoadState('networkidle'); // Wait for checkout step two page to fully load
        });

        // Step 7: Validate order totals on the summary page
        await test.step('Validate order totals', async () => {
            await checkoutPage.validateOrderTotals(addedItemsDetails);
        });

        // Step 8: Complete the order
        await test.step('Complete the order', async () => {
            await checkoutPage.completeOrder();
            await page.waitForLoadState('domcontentloaded'); // Wait for the order confirmation page
        });

        // Step 9: Assert the order confirmation message
        await test.step('Assert order confirmation message', async () => {
            await checkoutPage.validateOrderConfirmation(testData.orderConfirmationMessage);
        });
    });
});
