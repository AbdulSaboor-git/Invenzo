// File: /components/dashboard/CashierList.jsx
import React from 'react';

export default function CashierList({ cashiers }) {
  if (!cashiers || !cashiers.length) return <div>No data</div>;
  return (
    <ul className="space-y-2">
      {cashiers.map((c) => (
        <li key={c.cashierId} className="flex justify-between">
          <div className="truncate">
            <div className="font-medium">
              {c.cashierName || `Cashier #${c.cashierId}`}
            </div>
            <div className="text-xs text-gray-500">Sales: {c.count}</div>
          </div>
          <div className="text-sm font-semibold">
            Rs {Number(c.total || 0).toFixed(0)}
          </div>
        </li>
      ))}
    </ul>
  );
}
