import React, { useEffect, useState } from 'react';
import CartItem from './cart_item';
import { MdOutlineDragIndicator } from 'react-icons/md';
import { toast } from 'sonner';
import ViewSaleInvoice from '@/components/viewSaleInvoice';

export default function Cart({ setPlacingOrder, cart, setCart, user, invId }) {
  const [discount, setDiscount] = useState('');

  const subTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountValue = Number(discount) || 0;
  const netPayable = Math.max(0, subTotal - discountValue).toFixed(0);

  const getQuantity = (item) => {
    if (item.product.unit == 'kg' || item.product.unit == 'liter') {
      return item.quantity / 1000;
    } else return item.quantity;
  };

  const itemCost = cart.reduce(
    (sum, item) => sum + item.product.purchasePrice * getQuantity(item),
    0
  );

  const profit = (netPayable - itemCost).toFixed(0);

  const [saleId, setSaleId] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (showInvoice) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showInvoice]);

  const handleUpdate = (index, updatedItem) => {
    setCart((prev) =>
      prev.map((item, i) => (i === index ? updatedItem : item))
    );
  };

  const handleDelete = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount('');
  };

  useEffect(() => {
    if (cart.length === 0) {
      setDiscount('');
    }
  }, [cart]);

  async function placeOrder() {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty. Add products to place an order.');
      return;
    }
    if (!user || !invId) {
      return;
    }

    setPlacingOrder(true);
    const id = toast.loading('Placing order...');

    try {
      console.log(user?.cashierId, invId, cart, discount, netPayable);
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          cashierId: user?.cashierId,
          inventoryId: invId,
          items: cart,
          discount: discount || 0,
          netPayable: netPayable,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const data = await response.json();
      setSaleId(data.sale.id);
      setShowInvoice(true);

      console.log('Order placed successfully:', data.sale);
      toast.success('Order placed successfully', { id });
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('There was an error placing the order. Please try again.', {
        id,
      });
    } finally {
      setPlacingOrder(false);
    }
  }

  function formatDateTime(dt) {
    const d = new Date(dt);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div
      className={`bg-gradient-to-r from-gray-700 to-gray-600 shadow-[0_-1px_3px_0_rgba(0,0,0,0.2),0_-1px_2px_-1px_rgba(0,0,0,0.2)] rounded-t-2xl relative md:from-white md:to-white md:shadow-sm md:rounded-xl h-full flex flex-col  `}
    >
      {cart.length > 0 && (
        <div className="absolute border border-gray-600 shadow-[0_-1px_3px_0_rgba(0,0,0,0.2),0_-1px_2px_-1px_rgba(0,0,0,0.2)] flex text-gray-400 justify-center md:hidden -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-gray-300 z-10 w-12 h-[14px]">
          <MdOutlineDragIndicator size={12} className="rotate-90" />
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col">
        {cart.length === 0 ? (
          <div className="flex flex-1 min-h-[41vh] md:min-h-full items-center text-center justify-center text-gray-200 md:text-gray-400 text-sm border border-dashed rounded-xl p-6">
            🛒 Cart is empty – add products to start billing
            <div className="md:hidden w-full h-[100px] bg-gradient-to-r from-gray-700 to-gray-600 fixed bottom-0 left-0 -z-10"></div>
          </div>
        ) : (
          <div className="md:p-2 flex flex-col h-full">
            {/* Header (for desktop only) */}
            <div className="hidden sm:grid w-full sticky top-0 bg-white font-bold text-sm gap-2 grid-cols-[2fr_2fr_0.6fr_0.3fr] pb-2 border-b pr-1">
              <h1>Item</h1>
              <h1 className="">Qty</h1>
              <h1 className="">Price</h1>
              <h1>{''}</h1>
            </div>

            {/* Cart Items */}

            <div className="md:h-[calc(100vh-410px)] pb-[200px] md:pb-0 overflow-y-auto relative space-y-2">
              {cart.map((item, index) => (
                <div key={index}>
                  <CartItem
                    item={item}
                    onUpdate={(updated) => handleUpdate(index, updated)}
                    onDelete={() => handleDelete(index)}
                  />
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className=" w-full flex shadow-[0_-1px_3px_0_rgba(0,0,0,0.2),0_-1px_2px_-1px_rgba(0,0,0,0.2)] md:shadow-none flex-col rounded-t-xl md:rounded-t-none bg-white md:border-t px-4 py-2 md:px-0 md:py-0 gap-4 fixed md:static bottom-0 left-0 md:left-auto md:bottom-auto">
              <div className="flex w-full flex-col gap-1 pt-2 md:pt-4  text-sm md:text-base">
                <div className="grid grid-cols-[2fr_1fr] gap-2">
                  <span className="place-self-end">Total Products</span>
                  <span className="place-self-end">{cart.length}</span>
                </div>
                <div className="grid grid-cols-[2fr_1fr] gap-2">
                  <span className="place-self-end">Subtotal</span>
                  <span className="place-self-end">
                    Rs.{subTotal.toFixed(0)}
                  </span>
                </div>

                <div className="grid grid-cols-[2fr_1fr] gap-2 items-center">
                  <span className="place-self-end">Discount</span>
                  <input
                    type="number"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value) || '')}
                    className="w-20 md:w-24 text-right border rounded px-2 py-1 place-self-end text-sm md:text-base"
                  />
                </div>

                <div className="font-bold grid grid-cols-[2fr_1fr] gap-2">
                  <span className="place-self-end">Net Payable</span>
                  <span className="place-self-end">Rs.{netPayable}</span>
                </div>
                <div className="grid grid-cols-[2fr_1fr] gap-2">
                  <span className="place-self-end">Profit</span>
                  <span className="place-self-end">Rs.{profit}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-row gap-2 md:gap-3 items-center w-full text-white mt-auto">
                <button
                  onClick={clearCart}
                  className="w-full px-3 py-2 md:px-4 rounded-md bg-red-500 hover:bg-red-600 text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={placeOrder}
                  className="w-full px-3 py-2 md:px-4 rounded-md bg-green-500 hover:bg-green-600 text-sm md:text-base"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showInvoice && (
        <ViewSaleInvoice
          saleId={saleId}
          formatDateTime={formatDateTime}
          onClose={() => setShowInvoice(false)}
          user={user}
        />
      )}
    </div>
  );
}
