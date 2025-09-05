// File: /components/dashboard/RecentSalesTable.jsx
import React from 'react';

export default function RecentSalesTable({ sales }) {
  if (!sales || !sales.length)
    return <div className="py-4">No recent sales</div>;
  return (
    <div className="overflow-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-gray-600">
            <th className="py-2">Date</th>
            <th>Inventory</th>
            <th>Cashier</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="py-2">{new Date(s.createdAt).toLocaleString()}</td>
              <td>{s.inventoryName ?? s.inventoryId}</td>
              <td>{s.cashierName ?? s.cashierId}</td>
              <td className="text-right font-semibold">
                Rs {Number(s.totalAmount).toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
