import { expect } from '@playwright/test';

export default class InventoryPage {
  constructor(page) {
    this.page = page;
    // Locators for inventory page elements
    this.sortDropdown = page.locator('[data-test="product_sort_container"]');
    this.productItems = page.locator('.inventory_item');
    this.productNames = page.locator('.inventory_item_name');
    this.productPrices = page.locator('.inventory_item_price');
  }


  // Action: Sort products by a given option (e.g., 'Price (low to high)')
 async sortByPriceHighToLow() {
    await this.sortDropdown.selectOption('hilo');
    await this.page.waitForTimeout(500);
  }

  // Action: Add the first two items from the list to the cart and return their details
  async addTwoCheapestItemsAndGetDetails() {
    const cheapestItems = [];
    const items = await this.productItems.elementHandles();
    await this.page.waitForTimeout(5000); // Wait for any potential UI updates

    // Iterate through the first two items
    for (let i = 0; i < 2; i++) {
      const item = items[i];
      const name = await item.locator('.inventory_item_name').innerText();
      const priceText = await item.locator('.inventory_item_price').innerText();
      const price = parseFloat(priceText.replace('$', ''));

      cheapestItems.push({ name, price });
        await this.page.waitForTimeout(5000); 
      // Click the "Add to cart" button for the current item
      const addToCartButton = item.locator('[data-test^="add-to-cart"]');
      await addToCartButton.click();
    }
    return cheapestItems;
  }

  // Validation: Validate the item list is correctly sorted by price (high to low)
  async validateHighToLowSort() {
    // Get all the product prices from the page as strings
    const prices = await this.productPrices.allInnerTexts();

    // Convert the string array to a numeric array
    const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));

    // Create a new array and sort it in descending order
    const sortedPrices = [...numericPrices].sort((a, b) => b - a);

    // Use expect to compare the two arrays and ensure they are identical
    expect(numericPrices).toEqual(sortedPrices);
  }
}
