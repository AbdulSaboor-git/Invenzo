/**
 * Shared profit calculation utility.
 *
 * QUAL-01 fix: the same profit logic was duplicated in sales/index.js,
 * dashboard.js, and pos/components/cart.js.  A typo in one copy ('liter'
 * instead of 'litre') was the root cause of BUG-01.
 *
 * All three call-sites now import from here so a single fix propagates
 * everywhere.
 */

import { normaliseQuantity } from './units';

/**
 * Calculate the total cost of a list of SaleItems (each must have a Product
 * relation attached, as returned by Prisma's `include: { Product: true }`).
 *
 * @param {Array} saleItems  Array of { quantity, Product: { purchasePrice, unit } }
 * @returns {number}  Total cost in currency units
 */
export function calculateCost(saleItems) {
  return saleItems.reduce((acc, item) => {
    const qty = normaliseQuantity(item.quantity, item.Product?.unit);
    const unitCost = item.Product?.purchasePrice ?? 0;
    return acc + unitCost * qty;
  }, 0);
}

/**
 * Calculate profit for a single sale.
 *
 * @param {{ totalAmount: number, SaleItem: Array }} sale
 * @returns {number}
 */
export function calculateSaleProfit(sale) {
  const cost = calculateCost(sale.SaleItem);
  return sale.totalAmount - cost;
}

/**
 * Calculate profit across an array of sales.
 *
 * @param {Array} sales  Array of Sale objects with SaleItem[] included
 * @returns {number}
 */
export function calculateTotalProfit(sales) {
  return sales.reduce((acc, sale) => acc + calculateSaleProfit(sale), 0);
}

/**
 * Cart-side profit helper (used in the POS cart component).
 * Accepts a cart item as stored in React state.
 *
 * @param {{ quantity: number, price: number, product: { purchasePrice: number, unit: string } }} cartItem
 * @returns {number}  Profit for this single line item
 */
export function calculateCartItemProfit(cartItem) {
  const qty = normaliseQuantity(cartItem.quantity, cartItem.product?.unit);
  const cost = (cartItem.product?.purchasePrice ?? 0) * qty;
  return cartItem.price - cost;
}
