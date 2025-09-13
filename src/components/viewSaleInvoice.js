import React, { use, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function ViewSaleInvoice({ saleId, onClose, user }) {
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState(null);

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

  const grandTotal = lines.reduce((sum, li) => sum + Number(li.price), 0);

  useEffect(() => {
    if (saleId) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [saleId]);

  const discount = sale?.discount ?? 0;
  const netPayable = grandTotal - discount;

  function NormalizeId(id) {
    return String(id).padStart(8, '0');
  }

  return (
    <div className="fixed h-full top-0 inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center px-4 py-4 sm:px-6 z-50">
      <div className=" bg-white rounded-lg p-4 sm:p-6 shadow-xl w-full max-w-2xl ">
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
          <div
            className={`border bg-white rounded-lg border-dotted ${sale.deactivated && 'border-red-300'} max-h-[75vh] overflow-y-auto`}
          >
            {/* Line items */}
            <div className={``}>
              <div className=" p-3 md:p-6 font-mono text-sm ">
                {/* Header (shared) */}
                <div className="text-center text-xs text-gray-700 mb-3 md:mb-6">
                  <div className="font-bold text-base md:text-lg">
                    {sale?.Inventory?.name ?? 'Inventory'}
                  </div>
                  <div className="mt-1">Invoice No: {NormalizeId(sale.id)}</div>
                  <div className="">{formatDateTime(sale.createdAt)}</div>
                  <div className=" mt-1">
                    Cashier:{' '}
                    {sale?.Cashier?.User
                      ? `${sale.Cashier.User.firstName ?? ''} ${sale.Cashier.User.lastName ?? ''}`.trim() ||
                        sale.Cashier.User.email
                      : '-'}
                  </div>
                  <div className="mt-1">Payment Mode: {sale.paymentMode}</div>
                  {sale.deactivated && (
                    <div className="mt-1 text-red-500 uppercase">
                      sale voided
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="hidden md:block">
                  {/* Desktop: table */}
                  <table className="w-full border-t border-dashed text-sm">
                    <thead>
                      <tr className="text-gray-700 font-bold">
                        <th className=" py-2 px-1 text-left">#</th>
                        <th className=" py-2 pr-3 text-left">Product</th>
                        <th className=" py-2 pl-3 text-right">Qty</th>
                        <th className=" py-2 pl-3 text-right min-w-24">
                          Unit-Price
                        </th>
                        {user.role != 'cashier' && (
                          <th className=" py-2 pl-3 text-right">Profit</th>
                        )}
                        <th className=" py-2 pl-3 text-right">Subtotal</th>
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
                        lines.map((li, i) => {
                          function getUnitLabel() {
                            if (li.Product?.unit === 'kg' && li.quantity < 1000)
                              return 'g';
                            if (
                              li.Product?.unit === 'liter' &&
                              li.quantity < 1000
                            )
                              return 'ml';
                            return li.Product?.unit || '';
                          }

                          const getQuantity = (li) => {
                            if (
                              li.Product?.unit === 'kg' &&
                              li.quantity >= 1000
                            )
                              return Number(li.quantity) / 1000;
                            if (
                              li.Product?.unit === 'liter' &&
                              li.quantity >= 1000
                            )
                              return Number(li.quantity) / 1000;
                            return Number(li.quantity);
                          };

                          const getQuantityinBaseUnit = (li) => {
                            if (li.Product?.unit === 'kg')
                              return Number(li.quantity) / 1000;
                            if (li.Product?.unit === 'liter')
                              return Number(li.quantity) / 1000;
                            return Number(li.quantity);
                          };

                          const salePrice = (
                            li.price / getQuantityinBaseUnit(li)
                          ).toFixed(0);

                          const profit = (
                            (salePrice - li.Product.purchasePrice) *
                            getQuantityinBaseUnit(li)
                          ).toFixed(0);

                          return (
                            <tr key={li.id}>
                              <td className="py-2 px-1">{i + 1}.</td>
                              <td className="py-2">
                                {li?.Product?.name ?? `#${li.productId}`}
                              </td>
                              <td className="py-2 text-right">
                                {getQuantity(li) + '' + getUnitLabel()}
                              </td>
                              <td className="py-2 text-right">
                                {salePrice}/{li.Product.unit}
                              </td>
                              {user.role != 'cashier' && (
                                <td className="py-2 text-right">{profit}</td>
                              )}
                              <td className="py-2 text-right font-bold">
                                {li.price}
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
                    <div className="flex justify-between gap-3 text-gray-700 py-2 font-bold border-b">
                      <div className="">#</div>
                      <div className="flex-1">Product</div>
                      {user.role != 'cashier' && <div>Prof</div>}
                      <div>Price</div>
                    </div>
                    {lines.length === 0 ? (
                      <div className="py-4 text-center text-gray-500">
                        No items.
                      </div>
                    ) : (
                      lines.map((li, i) => {
                        function getUnitLabel() {
                          if (li.Product?.unit === 'kg' && li.quantity < 1000)
                            return 'g';
                          if (
                            li.Product?.unit === 'liter' &&
                            li.quantity < 1000
                          )
                            return 'ml';
                          return li.Product?.unit || '';
                        }

                        const getQuantity = (li) => {
                          if (li.Product?.unit === 'kg' && li.quantity >= 1000)
                            return Number(li.quantity) / 1000;
                          if (
                            li.Product?.unit === 'liter' &&
                            li.quantity >= 1000
                          )
                            return Number(li.quantity) / 1000;
                          return Number(li.quantity);
                        };

                        const getQuantityinBaseUnit = (li) => {
                          if (li.Product?.unit === 'kg')
                            return Number(li.quantity) / 1000;
                          if (li.Product?.unit === 'liter')
                            return Number(li.quantity) / 1000;
                          return Number(li.quantity);
                        };

                        const salePrice = (
                          li.price / getQuantityinBaseUnit(li)
                        ).toFixed(0);

                        const profit = (
                          (salePrice - li.Product.purchasePrice) *
                          getQuantityinBaseUnit(li)
                        ).toFixed(0);

                        return (
                          <div
                            key={li.id}
                            className="flex justify-between py-2 gap-3"
                          >
                            <div>{i + 1}.</div>
                            <div className="flex-1 flex flex-col text-[13px]">
                              {li?.Product?.name ??
                                `Product Id: ${li.productId}`}
                              <div className="text-xs text-gray-500">
                                {getQuantity(li) + '' + getUnitLabel()} × Rs.
                                {salePrice}/{li.Product.unit}
                              </div>
                            </div>
                            {user.role != 'cashier' && (
                              <div className="">{profit}</div>
                            )}
                            <div className="font-semibold text-end min-w-10">
                              {li.price}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Totals (shared) */}
                {lines.length > 0 && (
                  <div className="flex border-t border-dashed  mt-3 md:mt-4 pt-2 md:pt-3  flex-col">
                    <div className="grid w-auto grid-cols-[3fr_2fr] md:grid-cols-[3fr_1fr] gap-2">
                      <span className="place-self-end">Items:</span>
                      <span className="place-self-end">{lines.length}</span>
                    </div>
                    <div className="grid w-auto grid-cols-[3fr_2fr] md:grid-cols-[3fr_1fr] gap-2">
                      <span className="place-self-end">Total:</span>
                      <span className="place-self-end">{grandTotal}</span>
                    </div>
                    <div className="grid w-auto grid-cols-[3fr_2fr] md:grid-cols-[3fr_1fr] gap-2">
                      <span className="place-self-end">Discount:</span>
                      <span className="place-self-end">{discount}</span>
                    </div>
                    <div className="font-bold border-t border-dashed mt-2 pt-2 grid w-auto grid-cols-[3fr_2fr] md:grid-cols-[3fr_1fr] gap-2">
                      <span className="place-self-end">Net Payable:</span>
                      <span className="place-self-end">Rs.{netPayable}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mismatch note */}
            {Number(sale.totalAmount) !== Number(netPayable) && (
              <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                Note: Calculated total (Rs.{netPayable}) differs from stored
                totalAmount (Rs.{Number(sale.totalAmount)}).
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
