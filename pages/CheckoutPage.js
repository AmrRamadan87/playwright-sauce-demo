import { expect } from '@playwright/test';

export default class CheckoutPage {
  constructor(page) {
    this.page = page;
    // Locators for checkout page elements
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.itemTotal = page.locator('.summary_subtotal_label');
    this.tax = page.locator('.summary_tax_label');
    this.total = page.locator('.summary_total_label');
    this.confirmationMessage = page.locator('[data-test="complete-header"]');
  }

  // Action: Fill out the customer information form
  async fillCustomerInfo(firstName, lastName, postalCode) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
    await expect(this.page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
  }

  // Action: Complete the order
  async completeOrder() {
    await this.finishButton.click();
  }

  // Validation: Validate the order totals (item total, tax, and grand total)
  async validateOrderTotals(expectedItemPrices) {
    // Get the item total from the page and remove the "$Item total: " prefix
    const itemTotalText = await this.itemTotal.innerText();
    const itemTotalOnPage = parseFloat(itemTotalText.replace('Item total: $', ''));
    
    // Calculate the expected item total from the provided item prices
    const expectedItemTotal = expectedItemPrices.reduce((sum, item) => sum + item.price, 0);
    expect(itemTotalOnPage).toBe(expectedItemTotal);

    // Get the tax and grand total from the page
    const taxText = await this.tax.innerText();
    const taxOnPage = parseFloat(taxText.replace('Tax: $', ''));

    const totalText = await this.total.innerText();
    const totalOnPage = parseFloat(totalText.replace('Total: $', ''));

    // Validate the total calculation
    const calculatedTotal = itemTotalOnPage + taxOnPage;
    // Use toBeCloseTo for floating point comparisons to avoid precision issues
    expect(totalOnPage).toBeCloseTo(calculatedTotal, 2); 
  }

  // Validation: Validate the final order confirmation message
  async validateOrderConfirmation(expectedMessage) {
    await expect(this.confirmationMessage).toBeVisible();
    await expect(this.confirmationMessage).toHaveText(expectedMessage);
  }
}