import React, { useEffect, useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiTrash2 } from 'react-icons/fi';
import VoidSalePopup from './voidPopup';
import ViewSaleInvoice from '@/components/viewSaleInvoice';

export default function SalesTable({
  user,
  loadingData,
  sales,
  fetchAllSales,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const [showSaleInvoiceId, setShowSaleInvoiceId] = useState(null);
  const [showVoidSalePopup, setShowVoidSalePopup] = useState(null);

  useEffect(() => {
    if (showVoidSalePopup) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showVoidSalePopup]);

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

  function currency(n) {
    if (typeof n !== 'number') return n;
    return n.toLocaleString(undefined, {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    });
  }

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function NormalizeId(id) {
    return String(id).padStart(8, '0');
  }

  const colSpan = user?.role === 'cashier' ? 7 : 9;

  return (
    <div className="bg-white md:p-6">
      <div className="overflow-x-auto md:rounded-xl shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left ">
          <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide">
            <tr>
              <th className="px-3 py-3 md:px-6 md:py-4 text-center">#</th>
              <th className="px-3 py-3 md:px-6 md:py-4 min-w-[80px]">
                Sale ID
              </th>
              <th className="px-3 py-3 md:px-6 md:py-4 min-w-[200px]">
                Date / Time
              </th>
              {user?.role === 'superadmin' && (
                <th className="px-3 py-3 md:px-6 md:py-4 min-w-[170px]">
                  Inventory
                </th>
              )}
              <th className="px-3 py-3 md:px-6 md:py-4 min-w-[150px]">
                Cashier
              </th>
              <th className="px-3 py-3 md:px-6 md:py-4 min-w-[150px]">Email</th>
              {user?.role != 'cashier' && (
                <th className="px-3 py-3 md:px-6 md:py-4">Role</th>
              )}
              <th className="px-3 py-3 md:px-6 md:py-4">Items</th>
              <th className="px-3 py-3 md:px-6 md:py-4 min-w-[60px]">
                Revenue
              </th>
              {user?.role != 'cashier' && (
                <th className="px-3 py-3 md:px-6 md:py-4 min-w-[60px]">
                  Profit
                </th>
              )}
              {user.role === 'admin' && (
                <th className="px-3 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-gray-800">
            {loadingData ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="text-center text-gray-500 py-8"
                >
                  Loading...
                </td>
              </tr>
            ) : sales?.length > 0 ? (
              sales.map((sale, idx) => {
                const itemsCount = Array.isArray(sale.SaleItem)
                  ? sale.SaleItem.length
                  : (sale.itemsCount ?? 0);

                const cashierName = sale?.Cashier?.User
                  ? `${sale.Cashier.User.firstName ?? ''} ${sale.Cashier.User.lastName ?? ''}`.trim()
                  : (sale?.Cashier?.User?.email ??
                    sale?.Cashier?.User?.id ??
                    '-');

                const cashierEmail = sale?.Cashier?.User.email;
                const cashierRole = sale?.Cashier?.User.role;
                const inventoryName = sale?.Inventory?.name ?? '-';

                const isVoided = sale?.deactivated;

                return (
                  <tr
                    key={sale.id}
                    className={`hover:bg-gray-50 transition cursor-pointer ${isVoided ? 'bg-red-50 text-gray-400' : ''}`}
                    onClick={(e) => {
                      const isActionBtn = e.target.closest?.(
                        'button[data-row-action]'
                      );
                      if (!isActionBtn) {
                        setShowSaleInvoiceId(sale.id);
                      }
                    }}
                  >
                    <td className="px-3 py-2 md:px-6 md:py-4 text-gray-500 text-center">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 font-medium flex items-center gap-2">
                      {NormalizeId(sale.id)}
                      {isVoided && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-600">
                          Voided
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4">
                      {formatDateTime(sale.createdAt)}
                    </td>
                    {user?.role === 'superadmin' && (
                      <td className="px-3 py-2 md:px-6 md:py-4">
                        {inventoryName}
                      </td>
                    )}
                    <td className="px-3 py-2 md:px-6 md:py-4">
                      {cashierName || '-'}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4">
                      {cashierEmail || '-'}
                    </td>
                    {user.role != 'cashier' && (
                      <td className="px-3 py-2 md:px-6 md:py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${cashierRole === 'admin' ? 'bg-blue-100 text-blue-700' : cashierRole === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                          {cashierRole === 'superadmin'
                            ? 's-admin'
                            : cashierRole || '—'}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-2 md:px-6 md:py-4">{itemsCount}</td>
                    <td className="px-3 py-2 md:px-6 md:py-4 font-semibold">
                      Rs.{sale.totalAmount ?? 0}
                    </td>
                    {user?.role != 'cashier' && (
                      <td className="px-3 py-2 md:px-6 md:py-4 font-semibold">
                        Rs.{sale.profit ?? 0}
                      </td>
                    )}
                    {user.role === 'admin' && !isVoided && (
                      <td className="px-3 py-2 text-right relative">
                        <button
                          data-row-action
                          className="pt-[3px] pr-2"
                          ref={buttonRef}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === sale.id ? null : sale.id
                            );
                          }}
                        >
                          <BsThreeDotsVertical size={18} />
                        </button>
                      </td>
                    )}
                    <td>
                      {openMenuId === sale.id && user?.role != 'cashier' && (
                        <div
                          ref={menuRef}
                          className="absolute right-8 md:right-14 mt-3 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-gray-100"
                            onClick={() => {
                              setShowVoidSalePopup(sale);
                              setOpenMenuId(null);
                            }}
                          >
                            <FiTrash2 /> Void
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={colSpan}
                  className="text-center text-gray-500 py-8"
                >
                  No sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Popup */}
      {showSaleInvoiceId != null && (
        <ViewSaleInvoice
          saleId={showSaleInvoiceId}
          onClose={() => setShowSaleInvoiceId(null)}
          user={user}
        />
      )}

      {/* Void Popup */}
      {showVoidSalePopup && user?.role != 'cashier' && (
        <VoidSalePopup
          sale={showVoidSalePopup}
          onClose={() => setShowVoidSalePopup(null)}
          onSuccess={async () => {
            await fetchAllSales();
            setShowVoidSalePopup(null);
          }}
        />
      )}
    </div>
  );
}
