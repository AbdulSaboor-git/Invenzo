import React, { useState } from 'react';
import CartItem from './cart_item';

export default function Cart({ cart, setCart }) {
  const [discount, setDiscount] = useState(0);

  const subTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const netPayable = Math.max(0, subTotal - discount);

  const handleUpdate = (index, updatedItem) => {
    setCart((prev) =>
      prev.map((item, i) => (i === index ? updatedItem : item))
    );
  };

  const handleDelete = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white md:shadow-sm md:rounded-xl h-full flex flex-col">
      <div className="p-3 flex-1 flex flex-col">
        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-gray-400 text-sm border border-dashed md:rounded-xl p-6">
            🛒 Cart is empty – add products to start billing
          </div>
        ) : (
          <div className="p-2  flex flex-col h-full">
            {/* Header (hidden on mobile) */}
            <div className="hidden sm:grid w-full sticky top-0 bg-white font-bold text-sm grid-cols-[2fr_2fr_1fr_0.3fr] pb-2 border-b pr-1">
              <h1>Item</h1>
              <h1 className="place-self-center">Qty</h1>
              <h1 className="place-self-center">Price</h1>
              <h1>Delete</h1>
            </div>

            {/* Cart Items */}
            <div className="md:h-[calc(30vh)] overflow-y-auto relative space-y-2">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg sm:rounded-none sm:border-0 sm:p-0 p-2"
                >
                  <CartItem
                    item={item}
                    onUpdate={(updated) => handleUpdate(index, updated)}
                    onDelete={() => handleDelete(index)}
                  />
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex w-full flex-col gap-1 py-4 border-t mt-2 text-sm md:text-base">
              <div className="grid grid-cols-[2fr_1fr] gap-2">
                <span className="place-self-end">Subtotal</span>
                <span className="place-self-end">Rs.{subTotal.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-[2fr_1fr] gap-2 items-center">
                <span className="place-self-end">Discount</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-20 md:w-24 text-right border rounded px-2 py-1 place-self-end text-sm md:text-base"
                />
              </div>

              <div className="font-bold grid grid-cols-[2fr_1fr] gap-2">
                <span className="place-self-end">Net Payable</span>
                <span className="place-self-end">
                  Rs.{netPayable.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-2 md:gap-3 items-center w-full text-white mt-auto">
              <button className="w-full px-3 py-2 md:px-4 rounded-md bg-red-500 hover:bg-red-600 text-sm md:text-base">
                Cancel
              </button>
              <button className="w-full px-3 py-2 md:px-4 rounded-md bg-green-500 hover:bg-green-600 text-sm md:text-base">
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
