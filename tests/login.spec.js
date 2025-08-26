import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import InventoryPage from '../pages/InventoryPage.js';
import CartPage from '../pages/CartPage.js';
import CheckoutPage from '../pages/CheckoutPage.js';
import testData from '../data/testData.json';

// This test suite focuses on the login and a simple end-to-end purchase flow.
test.describe('Login and Purchase Flow', () => { // Changed the describe block title to be more specific

  // Test Case 1: Validate a successful login.
  test('should successfully log in with valid credentials', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // Create an instance of the LoginPage
    const loginPage = new LoginPage(page);

    // Step 1: Navigate to the login page
    await test.step('Navigate to login page', async () => {
      await loginPage.navigate();
    });

    // Step 2: Perform the login action using data from the JSON file
    await test.step('Perform login with valid credentials', async () => {
      // Add a listener to handle any dialogs that may appear after login
      page.once('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
      });
      await loginPage.login(testData.validUser.username, testData.validUser.password);
      await page.waitForLoadState('networkidle'); // Wait for the network to be idle after login
    });

    // Step 3: Validate successful redirection to the inventory page
    await test.step('Validate successful login', async () => {
      await loginPage.validateSuccessfulLogin();
    });
  });

  // Test Case 2: Validate a negative login attempt.
  test('should display an error message for incorrect credentials', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // Create an instance of the LoginPage
    const loginPage = new LoginPage(page);

    // Step 1: Navigate to the login page
    await test.step('Navigate to login page', async () => {
      await loginPage.navigate();
    });

    // Step 2: Attempt to login with invalid credentials using data from the JSON file
    await test.step('Attempt to login with incorrect credentials', async () => {
      await loginPage.login(testData.invalidUser.username, testData.invalidUser.password);
      await page.waitForLoadState('domcontentloaded'); // Wait for the DOM to be loaded after login attempt
    });

    // Step 3: Validate that the specific error message is displayed using data from the JSON file
    await test.step('Validate error message', async () => {
      await loginPage.validateErrorMessage(testData.loginErrorMessage);
    });
  });


});
