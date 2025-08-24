import React from 'react';

export default function ProductCard({ product, addToCart }) {
  return (
    <div
      onClick={() => addToCart(product)}
      className="border rounded-xl md:rounded-2xl p-2 md:p-4 flex flex-col items-center justify-center text-center
                          shadow-sm hover:shadow-md hover:scale-[1.02] hover:border-gray-300
                          transition-all duration-200 bg-white cursor-pointer select-none"
    >
      <h3 className="text-sm md:text-base md:font-semibold text-gray-800 line-clamp-3">
        {product.name}
      </h3>
      <p className=" hidden md:block text-xs md:text-sm text-gray-500 mt-1">
        {product.category?.name || 'Uncategorized'}
      </p>
      <p className="text-base md:text-lg font-semibold md:mt-2 text-gray-900">
        <span className="text-xs md:text-sm text-gray-600 font-normal">
          Rs.
        </span>{' '}
        {product.salePrice}
        <span className="text-xs md:text-sm font-normal text-gray-600">
          /{product.unit}
        </span>
      </p>
    </div>
  );
}
