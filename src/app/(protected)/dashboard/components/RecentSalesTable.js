// File: /components/dashboard/RecentSalesTable.jsx
import ViewSaleInvoice from '@/components/viewSaleInvoice';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function RecentSalesTable({ sales, user }) {
  const [invoiceId, setInvoiceId] = useState(null);
  const router = useRouter();
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

  if (!sales || !sales.length)
    return <div className="py-4">No recent sales</div>;

  return (
    <div className="overflow-auto space-y-4">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-gray-600">
            <th className="py-2 pr-2  max-w-[70px] md:max-w-auto">Date</th>
            {user.role === 'superadmin' && <th className=" px-2">Inventory</th>}
            <th className=" px-2">Cashier</th>
            <th className="text-right pl-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr
              key={s.id}
              className="border-t cursor-pointer hover:bg-gray-100 transition"
              onClick={() => setInvoiceId(s.id)}
            >
              <td className="py-2 pr-2  max-w-[70px] md:max-w-auto">
                {new Date(s.createdAt).toLocaleString()}
              </td>
              {user.role === 'superadmin' && (
                <td className="px-2">{s.inventoryName ?? s.inventoryId}</td>
              )}
              <td className="px-2">{s.cashierName ?? s.cashierId}</td>
              <td className="text-right font-semibold pl-2">
                Rs. {Number(s.totalAmount).toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invoiceId && (
        <ViewSaleInvoice
          saleId={invoiceId}
          formatDateTime={formatDateTime}
          onClose={() => setInvoiceId(null)}
          user={user}
        />
      )}
      <div className="w-full flex justify-center">
        <button
          onClick={() => {
            router.push('sales');
          }}
          className="bg-green-500 hover:bg-green-600 transition text-white px-6 py-2 place-self-center rounded-lg"
        >
          See All
        </button>
      </div>
    </div>
  );
}
