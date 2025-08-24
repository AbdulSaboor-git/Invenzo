import React from 'react';
import { MdRemove } from 'react-icons/md';

export default function CartItem({ item, onUpdate, onDelete }) {
  // --- base unit price ---
  const unitPricePerBase =
    item.product.unit === 'kg'
      ? item.product.salePrice / 1000 // per gram
      : item.product.unit === 'liter'
        ? item.product.salePrice / 1000 // per ml
        : item.product.salePrice; // per piece

  // when quantity changes
  const handleQtyChange = (val) => {
    let newQty = Math.max(0, Number(val) || 0); // in base units
    const newPrice = Number((newQty * unitPricePerBase).toFixed(0));
    onUpdate({ ...item, quantity: newQty, totalPrice: newPrice });
  };

  // when price changes
  const handlePriceChange = (val) => {
    const newPrice = Math.max(0, Number(val) || 0);
    const newQty = Number((newPrice / unitPricePerBase).toFixed(0)); // base units
    onUpdate({ ...item, quantity: newQty, totalPrice: newPrice });
  };

  // auto format unit label
  const getUnitLabel = () => {
    if (item.product.unit === 'kg' || item.product.unit === 'g') return 'g';
    if (item.product.unit === 'liter' || item.product.unit === 'ml')
      return 'ml';
    return item.product.unit;
  };

  return (
    <div className="border rounded-lg md:rounded-none md:border-0 md:p-0 p-3 bg-white">
      {/* Desktop / Tablet layout */}
      <div className="hidden sm:grid w-full gap-2 text-sm grid-cols-[2fr_2fr_0.6fr_0.3fr] pr-1 border-b py-2 items-center">
        {/* Name */}
        <h3 className="font-medium text-gray-800 line-clamp-2">
          {item.product.name}{' '}
          <span className="font-normal text-xs text-gray-500">
            (Rs.{item.product.salePrice}/{item.product.unit})
          </span>
        </h3>

        {/* Quantity input */}
        <div className="flex items-stretch justify-start gap-1">
          <button
            onClick={() => handleQtyChange(item.quantity - 1)}
            className="px-2 py-1 border rounded hover:bg-gray-100"
          >
            -
          </button>
          <input
            type="number"
            step="0.1"
            value={item.quantity}
            onChange={(e) => handleQtyChange(e.target.value)}
            className="w-16 text-center border rounded"
          />
          <button
            onClick={() => handleQtyChange(item.quantity + 1)}
            className="px-2 py-1 border rounded hover:bg-gray-100"
          >
            +
          </button>
          <span className="ml-1 text-gray-500 place-self-center">
            {getUnitLabel()}
          </span>
        </div>

        {/* Price input */}
        <input
          type="number"
          value={item.totalPrice}
          disabled={
            item.product.unit === 'pc' ||
            item.product.unit === 'dozen' ||
            item.product.unit === 'box' ||
            item.product.unit === 'pack'
          }
          onChange={(e) => handlePriceChange(e.target.value)}
          className="w-20 text-right border rounded px-2 py-1"
        />

        {/* Delete */}
        <button
          onClick={onDelete}
          className="text-red-500 place-self-center hover:text-red-700"
        >
          <MdRemove size={18} />
        </button>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden text-sm flex flex-col gap-2">
        {/* Top row: name + delete */}
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-800">
            {item.product.name}{' '}
            <span className="font-normal text-xs text-gray-500">
              (Rs.{item.product.salePrice}/{item.product.unit})
            </span>
          </h3>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            <MdRemove size={18} />
          </button>
        </div>

        {/* Qty + Price row */}
        <div className="flex justify-between gap-3">
          {/* Qty */}
          <div className="flex items-stretch gap-1">
            <button
              onClick={() => handleQtyChange(item.quantity - 1)}
              className="px-2 py-1 border rounded hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              step="0.1"
              value={item.quantity}
              onChange={(e) => handleQtyChange(e.target.value)}
              className="w-20 text-center border rounded"
            />
            <button
              onClick={() => handleQtyChange(item.quantity + 1)}
              className="px-2 py-1 border rounded hover:bg-gray-100"
            >
              +
            </button>
            <span className="ml-1 text-gray-500 place-self-center ">
              {getUnitLabel()}
            </span>
          </div>
          {/* Price */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={item.totalPrice}
              disabled={
                item.product.unit === 'pc' ||
                item.product.unit === 'dozen' ||
                item.product.unit === 'box' ||
                item.product.unit === 'pack'
              }
              onChange={(e) => handlePriceChange(e.target.value)}
              className="w-24 text-right border rounded px-2 py-1"
            />
            <span className="text-gray-500">Rs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
