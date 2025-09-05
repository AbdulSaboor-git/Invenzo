// File: /components/dashboard/TopProducts.jsx
import React from 'react';

export default function TopProducts({ products }) {
  // const getUnit = (unit) => {
  //   if (unit === 'kg') return 'g';
  //   else if (uint === 'liter') return 'ml';
  //   else return unit;
  // };

  const getQuantity = (prod) => {
    if (prod.unit === 'kg' || prod.uint === 'liter')
      return prod.quantity / 1000;
    else return prod.quantity;
  };

  // const getRevenue = (prod) => {
  //   if (prod.unit === 'kg' || prod.uint === 'liter') return prod.revenue / 1000;
  //   else return prod.revenue;
  // };

  if (!products || !products.length) return <div>No data</div>;
  return (
    <ul className="space-y-2">
      {products.map((p) => (
        <li key={p.id} className="flex justify-between">
          <div>
            <div className="font-medium truncate" title={p.name}>
              {p.name}
            </div>
            <div className="text-xs text-gray-500">
              Sold: {getQuantity(p)} {p.unit}
            </div>
          </div>
          <div className="text-sm font-semibold">
            Rs {Number(p.revenue || 0).toFixed(0)}
          </div>
        </li>
      ))}
    </ul>
  );
}
