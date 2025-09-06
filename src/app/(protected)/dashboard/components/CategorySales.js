// File: /components/dashboard/CategorySales.jsx
import React from 'react';

export default function CategorySales({ categories }) {
  if (!categories || !categories.length) return <div>No data</div>;
  return (
    <ul className="space-y-2">
      {categories.map((c) => (
        <li key={c.categoryId} className="grid grid-cols-[3fr_1fr]">
          <div className="truncate">{c.categoryName}</div>
          <div className="text-right min-w-[80px]">
            Rs. {Number(c.total || 0).toFixed(0)}
          </div>
        </li>
      ))}
    </ul>
  );
}
