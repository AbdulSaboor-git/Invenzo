// File: /components/dashboard/CategorySales.jsx
import React from 'react';

export default function CategorySales({ categories }) {
  if (!categories || !categories.length) return <div>No data</div>;
  return (
    <ul>
      {categories.map((c) => (
        <li key={c.categoryId} className="flex justify-between py-1">
          <div>{c.categoryName}</div>
          <div>Rs. {Number(c.total || 0).toFixed(0)}</div>
        </li>
      ))}
    </ul>
  );
}
