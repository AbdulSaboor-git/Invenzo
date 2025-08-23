import React, { useEffect, useMemo, useState } from 'react';

export default function ViewSaleInvoice({
  formatDateTime,
  currency,
  saleId,
  onClose,
}) {
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getOne', id: saleId }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data?.error || 'Failed to load sale');
          onClose?.();
          return;
        }
        if (mounted) setSale(data?.sale || data); // supports both shapes
      } catch {
        toast.error('Error loading sale');
        onClose?.();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [saleId, onClose]);

  const items = sale?.SaleItem ?? [];
  const lines = Array.isArray(items) ? items : [];
  const grandTotal = useMemo(
    () =>
      lines.reduce(
        (sum, li) => sum + Number(li.quantity) * Number(li.price),
        0
      ),
    [lines]
  );

  function NormalizeId(id) {
    return String(id).padStart(8, '0');
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center px-4 sm:px-6 z-50">
      <div className=" bg-white rounded-lg p-4 sm:p-6  shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Invoice</h3>
          <button
            className=" text-gray-400 hover:text-gray-600"
            onClick={onClose}
            disabled={loading}
            aria-label=""
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : !sale ? (
          <div className="py-12 text-center text-gray-500">
            Invoice not found.
          </div>
        ) : (
          <>
            {/* Line items */}
            <div className="border rounded-lg max-h-[70vh] md:max-h-[90vh] overflow-auto">
              <div className="bg-white p-3 md:p-6 font-mono text-sm">
                {/* Header (shared) */}
                <div className="text-center text-xs text-gray-500 mb-3 md:mb-6">
                  <div className="font-bold text-base md:text-lg">
                    {sale?.Inventory?.name ?? 'Inventory'}
                  </div>
                  <div className="">{formatDateTime(sale.createdAt)}</div>
                  <div className=" mt-1">
                    Cashier:{' '}
                    {sale?.Cashier?.User
                      ? `${sale.Cashier.User.firstName ?? ''} ${sale.Cashier.User.lastName ?? ''}`.trim() ||
                        sale.Cashier.User.email
                      : '-'}
                  </div>
                  <div className="mt-1">Invoice No: {NormalizeId(sale.id)}</div>
                </div>

                {/* Items */}
                <div className="hidden md:block">
                  {/* Desktop: table */}
                  <table className="w-full border-t border-dashed text-sm">
                    <thead>
                      <tr className="text-gray-700 font-semibold">
                        <th className="py-2 text-left">Product</th>
                        <th className="py-2 text-right">Qty</th>
                        <th className="py-2 text-right">Price</th>
                        <th className="py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {lines.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 text-center text-gray-500"
                          >
                            No items.
                          </td>
                        </tr>
                      ) : (
                        lines.map((li) => {
                          const subtotal =
                            Number(li.quantity) * Number(li.price);
                          return (
                            <tr key={li.id}>
                              <td className="py-2">
                                {li?.Product?.name ?? `#${li.productId}`}
                              </td>
                              <td className="py-2 text-right">{li.quantity}</td>
                              <td className="py-2 text-right">
                                {currency(li.price)}
                              </td>
                              <td className="py-2 text-right font-medium">
                                {currency(subtotal)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="block md:hidden">
                  {/* Mobile: stacked list */}
                  <div className="divide-y">
                    {lines.length === 0 ? (
                      <div className="py-4 text-center text-gray-500">
                        No items.
                      </div>
                    ) : (
                      lines.map((li) => {
                        const subtotal = Number(li.quantity) * Number(li.price);
                        return (
                          <div
                            key={li.id}
                            className="flex justify-between py-2"
                          >
                            <div className="flex-1">
                              {li?.Product?.name ?? `#${li.productId}`}
                              <div className="text-xs text-gray-500">
                                {li.quantity} × {currency(li.price)}
                              </div>
                            </div>
                            <div className="font-semibold">
                              {currency(subtotal)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Totals (shared) */}
                {lines.length > 0 && (
                  <div className="border-t border-dashed mt-3 md:mt-4 pt-2 md:pt-3 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{currency(grandTotal)}</span>
                  </div>
                )}

                {/* Debug: mismatch notice (shared) */}
                {Number(sale.totalAmount) !== Number(grandTotal) && (
                  <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                    Note: Calculated total ({currency(grandTotal)}) differs from
                    stored totalAmount ({currency(Number(sale.totalAmount))}).
                  </div>
                )}
              </div>
            </div>

            {/* Mismatch note */}
            {Number(sale.totalAmount) !== Number(grandTotal) && (
              <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                Note: Calculated total ({currency(grandTotal)}) differs from
                stored totalAmount ({currency(Number(sale.totalAmount))}).
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
