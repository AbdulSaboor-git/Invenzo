'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import Header from '@/components/header';
import RefreshButton from '../inventory/components/refresh_btn';
import SalesTable from './components/salesTable';
import Footer from '@/components/footer';

export default function SalesPage() {
  const { user } = useSelector((s) => s.user);

  const [sales, setSales] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshFailed, setRefreshFailed] = useState(false);

  // --- Filters ---
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [showAll, setShowAll] = useState(false);

  const localStorageKey = useMemo(
    () => (user?.id ? `inventoryData_sales_${user.id}` : null),
    [user?.id]
  );

  useEffect(() => {
    if (!user?.id) return;
    const t = setTimeout(fetchAllSales, 300);
    return () => clearTimeout(t);
  }, [user, fromDate, toDate, showAll]);

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
    if (!user?.id) return;

    setRefreshFailed(false);
    try {
      setRefreshing(true);
      setLoadingData(true);

      let url = `/api/sales?from=${fromDate}&to=${toDate}&showAll=${showAll}`;
      if (user?.role === 'admin') {
        url += `&inventoryId=${user?.invId}`;
      }
      if (user?.role === 'cashier') {
        url += `&inventoryId=${user?.invId}&cashierId=${user?.cashierId}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch sales');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.sales;
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

  // --- Auto refresh every 20 min ---
  useEffect(() => {
    if (!user?.id) return;
    const checkAndAutoFetch = () => {
      if (!navigator.onLine) return;
      const now = Date.now();
      const twentyMin = 20 * 60 * 1000;
      let last = lastUpdated ? new Date(lastUpdated).getTime() : 0;

      if (!last && typeof window !== 'undefined' && localStorageKey) {
        const raw = localStorage.getItem(localStorageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.lastUpdated)
            last = new Date(parsed.lastUpdated).getTime();
        }
      }

      if (!last || now - last >= twentyMin) {
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
  }, [user?.id, localStorageKey, lastUpdated, fromDate, toDate, showAll]);

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Header />

      <div className="w-full max-w-7xl place-self-center pb-16">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-[68px] bg-white z-40">
          <div className="w-full flex justify-center md:justify-start">
            <h2 className="text-lg flex items-center gap-1 line-clamp-1 md:text-xl font-bold text-gray-800 text-center md:text-left">
              Sales Record
              {user?.role !== 'superadmin' && (
                <span className="hidden md:block font-normal text-gray-700">
                  {' - ' + (user?.invName || '')}
                </span>
              )}
            </h2>
          </div>

          <div className="flex flex-wrap justify-end items-center gap-2 bg-white">
            <label className="flex items-center gap-1 text-sm text-gray-600">
              From:
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                }}
                disabled={refreshing}
                className="border rounded-md px-2 py-1 text-sm"
              />
            </label>
            <label className="flex items-center gap-1 text-sm text-gray-600">
              To:
              <input
                disabled={refreshing}
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                }}
                className="border rounded-md px-2 py-1 text-sm"
              />
            </label>

            <label className="flex items-center gap-1 text-sm text-gray-600">
              <input
                disabled={refreshing}
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
              />
              Show all
            </label>

            {lastUpdated && (
              <span className="text-xs sm:text-sm hidden sm:block text-gray-500">
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

        <SalesTable
          user={user}
          sales={sales}
          loadingData={loadingData || refreshing}
          fetchAllSales={fetchAllSales}
        />
      </div>

      <Footer />
    </div>
  );
}
