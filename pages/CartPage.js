import { expect } from '@playwright/test';

export default class CartPage {
  constructor(page) {
    this.page = page;
    // Locators for cart page elements
    this.cartIcon = page.locator('.shopping_cart_link');
    this.cartItems = page.locator('.cart_item');
    this.itemName = page.locator('.inventory_item_name');
    this.itemPrice = page.locator('.inventory_item_price');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  // Action: Navigate to the cart page
  async navigateToCart() {
    await this.cartIcon.click();
    await this.page.waitForLoadState('networkidle'); // Added wait for network idle
    await expect(this.page).toHaveURL('https://www.saucedemo.com/cart.html');
  }

  // Action: Proceed to checkout from the cart page
  async proceedToCheckout() {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
  }

  // Validation: Verify that the items and their details are correct in the cart
  async verifyItemsInCart(expectedItems) {
    const cartItemElements = await this.cartItems.elementHandles();
    expect(cartItemElements.length).toBe(expectedItems.length);

    // Loop through each expected item and validate its presence and details
    for (let i = 0; i < expectedItems.length; i++) {
      const expectedItem = expectedItems[i];
      const itemElement = cartItemElements[i];
      
      const actualName = await itemElement.locator('.inventory_item_name').innerText();
      const actualPriceText = await itemElement.locator('.inventory_item_price').innerText();
      const actualPrice = parseFloat(actualPriceText.replace('$', ''));
      
      expect(actualName).toBe(expectedItem.name);
      expect(actualPrice).toBe(expectedItem.price);
    }
  }

  // Validation: Verify the total number of items in the cart
  async verifyItemCount() {
    const countText = await this.cartIcon.innerText();
    expect(countText).toBe('2');
  }
}

