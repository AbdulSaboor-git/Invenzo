// File: /components/dashboard/TopProducts.jsx
import React from 'react';

export default function TopProducts({ products }) {
  // const getUnit = (unit) => {
  //   if (unit === 'kg') return 'g';
  //   else if (uint === 'litre') return 'ml';
  //   else return unit;
  // };

  const getQuantity = (prod) => {
    if ((prod.unit === 'kg' || prod.uint === 'litre') && prod.quantity >= 1000)
      return prod.quantity / 1000;
    else return prod.quantity;
  };

  const getUnit = (prod) => {
    if (prod.quantity < 1000) {
      if (prod.unit === 'kg') {
        return 'g';
      } else if (prod.unit == 'litre') {
        return 'ml';
      } else {
        return prod.unit;
      }
    } else return prod.unit;
  };

  // const getRevenue = (prod) => {
  //   if (prod.unit === 'kg' || prod.uint === 'litre') return prod.revenue / 1000;
  //   else return prod.revenue;
  // };

  if (!products || !products.length) return <div>No data</div>;
  return (
    <div className="space-y-2">
      {products.map((p) => (
        <div key={p.id} className="grid grid-cols-[3fr_1fr] gap-3">
          <div className="flex flex-col">
            <div className="font-medium line-clamp-2 ">{p.name}</div>
            <div className="text-xs text-gray-500">
              Sold: {getQuantity(p)} {getUnit(p)}
            </div>
          </div>
          <div className="text-sm font-semibold min-w-[50px] text-right">
            Rs. {Number(p.revenue || 0).toFixed(0)}
          </div>
        </div>
      ))}
    </div>
  );
}
