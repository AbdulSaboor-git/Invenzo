'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import Header from '@/components/header';
import NotFound from '@/app/not-found';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiTrash2 } from 'react-icons/fi';
import RefreshButton from '../inventory/components/refresh_btn';
import ViewSaleInvoice from './components/viewSaleInvoice';
import DeleteSalePopup from './components/voidPopup';
import SalesTable from './components/salesTable';

export default function SalesPage() {
  const { user } = useSelector((s) => s.user);

  const [sales, setSales] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshFailed, setRefreshFailed] = useState(false);

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

      let url = `/api/sales`;
      if (user?.role === 'admin') {
        url += `?inventoryId=${user?.invId}`;
      }
      if (user?.role === 'cashier') {
        url += `?inventoryId=${user?.invId}&cashierId=${user?.cashierId}`;
      }

      setLoadingData(true);

      const res = await fetch(url);

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

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Header />

      <div className="w-full max-w-7xl place-self-center pb-16">
        {/* Sticky header row */}
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-[68px] bg-white z-40">
          <div className="w-full flex justify-center md:justify-start">
            <h2 className="text-lg flex items-center gap-1 line-clamp-1 md:text-xl font-bold text-gray-800 text-center md:text-left">
              Sales Record
              {user?.role !== 'superadmin' && (
                <span className="hidden md:block font-normal text-gray-700">
                  {' - ' + user?.invName || ''}
                </span>
              )}
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
        <SalesTable
          user={user}
          sales={sales}
          loadingData={loadingData}
          fetchAllSales={fetchAllSales}
        />
      </div>
    </div>
  );
}
