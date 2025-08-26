import { expect } from '@playwright/test';

export default class LoginPage {
  constructor(page) {
    this.page = page;
    // Locators for login page elements
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  // Action: Navigate to the login page
  async navigate() {
    await this.page.goto('/');
    // Validate that the login form is visible
    await expect(this.loginButton).toBeVisible();
  }

  // Action: Perform a login with given credentials
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // Validation: Check if the user is on the inventory page after a successful login
  async validateSuccessfulLogin() {
    // A common way to validate success is to check for a URL change or a specific element on the next page
    await expect(this.page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(this.page.locator('.app_logo')).toBeVisible();
  }

  // Validation: Check if the error message is visible and contains the expected text
  async validateErrorMessage(expectedMessage) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedMessage);
  }
}
