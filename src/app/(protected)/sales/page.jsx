'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import Header from '@/components/header';
import NotFound from '@/app/not-found';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiTrash2 } from 'react-icons/fi';
import RefreshButton from '../inventory/components/refresh_btn';

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
    currency: 'PKR', // change if needed
    minimumFractionDigits: 0,
  });
}

export default function SalesPage() {
  const { user } = useSelector((s) => s.user);

  const [sales, setSales] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshFailed, setRefreshFailed] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const [viewPopupSaleId, setViewPopupSaleId] = useState(null);
  const [deletePopupSale, setDeletePopupSale] = useState(null);

  const localStorageKey = useMemo(
    () => (user?.id ? `inventoryData_sales_${user.id}` : null),
    [user?.id]
  );

  // --- LocalStorage load ---
  const loadFromLocalStorage = () => {
    try {
      if (typeof window === 'undefined' || !localStorageKey) return false;
      const raw = localStorage.getItem(localStorageKey);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.sales)) return false;
      setSales(parsed.sales);
      setLastUpdated(parsed.lastUpdated);
      return true;
    } catch {
      return false;
    }
  };

  // --- Fetch all sales from server ---
  const fetchAllSales = async () => {
    setRefreshFailed(false);
    try {
      setRefreshing(true);
      const res = await fetch('/api/sales');
      if (!res.ok) throw new Error('Failed to fetch sales');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.sales; // supports either shape
      const timestamp = new Date().toISOString();

      setSales(list || []);
      setLastUpdated(timestamp);

      if (typeof window !== 'undefined' && localStorageKey) {
        localStorage.setItem(
          localStorageKey,
          JSON.stringify({ sales: list || [], lastUpdated: timestamp })
        );
      }
    } catch (e) {
      console.error('fetchAllSales error:', e);
      setRefreshFailed(true);
      toast.error('Failed to refresh. Showing cached data.');
    } finally {
      setRefreshing(false);
      setLoadingData(false);
    }
  };

  // --- Manual refresh button ---
  const handleRefresh = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }
    const t = toast.loading('Refreshing...');
    try {
      await fetchAllSales();
      toast.success('Data refreshed!', { id: t });
    } catch {
      toast.error('Failed to refresh data.', { id: t });
    }
  };

  // --- First load ---
  useEffect(() => {
    if (!user?.id) return;
    const hasLocal = loadFromLocalStorage();
    if (!hasLocal) {
      fetchAllSales();
    } else {
      setLoadingData(false);
    }
  }, [user?.id]);

  // --- Auto refresh hourly when online ---
  useEffect(() => {
    if (!user?.id) return;
    const checkAndAutoFetch = () => {
      if (!navigator.onLine) return;
      const now = Date.now();
      const sixtyMin = 60 * 60 * 1000;
      let last = lastUpdated ? new Date(lastUpdated).getTime() : 0;

      if (!last && typeof window !== 'undefined' && localStorageKey) {
        const raw = localStorage.getItem(localStorageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.lastUpdated)
            last = new Date(parsed.lastUpdated).getTime();
        }
      }

      if (!last || now - last >= sixtyMin) {
        fetchAllSales();
      }
    };

    const interval = setInterval(checkAndAutoFetch, 2 * 60 * 1000);
    checkAndAutoFetch();
    window.addEventListener('online', checkAndAutoFetch);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkAndAutoFetch);
    };
  }, [user?.id, localStorageKey, lastUpdated]);

  // --- Close row menu when clicking outside ---
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

  if (user?.role === 'superadmin') {
    return <NotFound />;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Header />

      <div className="w-full max-w-7xl place-self-center pb-16">
        {/* Sticky header row */}
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-[68px] bg-white z-40">
          <div className="w-full flex justify-center md:justify-start">
            <h2 className="text-lg line-clamp-1 md:text-xl font-bold text-gray-800 text-center md:text-left">
              Sales -{' '}
              <span className="font-normal text-gray-700">
                {user?.invName || ''}
              </span>
            </h2>
          </div>
          <div className="flex w-full items-stretch justify-end gap-3 bg-white">
            {lastUpdated && (
              <span className="text-sm place-content-center hidden sm:block text-gray-500">
                Last Updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
            <RefreshButton
              className="aspect-square md:aspect-auto"
              failedtoRefresh={refreshFailed}
              loading={refreshing}
              onClick={handleRefresh}
            />
          </div>
        </div>

        {/* Table */}
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
                  <th className="px-3 py-3 md:px-6 md:py-4 min-w-[150px]">
                    Cashier
                  </th>
                  <th className="px-3 py-3 md:px-6 md:py-4">Items</th>
                  <th className="px-3 py-3 md:px-6 md:py-4 min-w-[60px]">
                    Total
                  </th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-gray-800">
                {loadingData ? (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-500 py-8">
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

                    const inventoryName = sale?.Inventory?.name ?? '-';

                    return (
                      <tr
                        key={sale.id}
                        className="hover:bg-gray-50 transition cursor-pointer"
                        onClick={(e) => {
                          // avoid row click when clicking action button
                          const isActionBtn = e.target.closest?.(
                            'button[data-row-action]'
                          );
                          if (!isActionBtn) {
                            setViewPopupSaleId(sale.id);
                          }
                        }}
                      >
                        <td className="px-3 py-2 md:px-6 md:py-4 text-gray-500 text-center">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 font-medium">
                          {sale.id}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          {formatDateTime(sale.createdAt)}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          {cashierName || '-'}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          {itemsCount}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 font-semibold">
                          {currency(sale.totalAmount ?? 0)}
                        </td>
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
                        <td>
                          {openMenuId === sale.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-8 md:right-14 mt-3 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-gray-100"
                                onClick={() => {
                                  setDeletePopupSale(sale);
                                  setOpenMenuId(null);
                                }}
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-500 py-8">
                      No sales found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Popup */}
        {viewPopupSaleId != null && (
          <ViewSalePopup
            saleId={viewPopupSaleId}
            onClose={() => setViewPopupSaleId(null)}
          />
        )}

        {/* Delete Popup */}
        {deletePopupSale && (
          <DeleteSalePopup
            sale={deletePopupSale}
            onClose={() => setDeletePopupSale(null)}
            onSuccess={async () => {
              await fetchAllSales(); // refetch after delete
              setDeletePopupSale(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------------- VIEW SALE POPUP ----------------------- */
function ViewSalePopup({ saleId, onClose }) {
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
      <div className=" bg-white rounded-lg p-4 sm:p-6 shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Invoice</h3>
          <button
            className=" text-gray-400 hover:text-gray-600"
            onClick={onClose}
            disabled={loading}
            aria-label="Close edit category form"
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
              <div className="bg-white border rounded p-3 md:p-6 font-mono text-sm">
                {/* Header (shared) */}
                <div className="text-center mb-3 md:mb-6">
                  <div className="font-bold text-base md:text-lg">
                    {sale?.Inventory?.name ?? 'Inventory'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(sale.createdAt)}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Cashier:{' '}
                    {sale?.Cashier?.User
                      ? `${sale.Cashier.User.firstName ?? ''} ${sale.Cashier.User.lastName ?? ''}`.trim() ||
                        sale.Cashier.User.email
                      : '-'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Invoice No: {NormalizeId(sale.id)}
                  </div>
                </div>

                {/* Items */}
                <div className="hidden md:block">
                  {/* Desktop: table */}
                  <table className="w-full border-t border-b border-dashed text-sm">
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

/* ----------------------- DELETE SALE POPUP ----------------------- */
function DeleteSalePopup({ sale, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sale.id }),
      });

      if (res.status === 204) {
        toast.success('Sale deleted successfully');
        onSuccess?.();
        onClose?.();
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || 'Failed to delete sale');
        return;
      }

      toast.success('Sale deleted successfully');
      onSuccess?.();
      onClose?.();
    } catch {
      toast.error('Error deleting sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center px-4 sm:px-6 z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold text-red-700 mb-4">Delete Sale</h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete sale{' '}
          <span className="font-semibold">#{sale?.id}</span>?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-black disabled:hover:bg-gray-300 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 w-28 bg-red-600 hover:bg-red-700 rounded text-white disabled:hover:bg-red-700 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="border-2 border-gray-200 border-t-transparent animate-spin rounded-full w-4 h-4 mx-auto" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
