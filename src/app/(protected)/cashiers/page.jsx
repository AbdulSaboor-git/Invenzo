'use client';
import Header from '@/components/header';
import { useEffect, useState, useCallback } from 'react';
import CashierTable from './components/cashier_table';
import RefreshButton from '../inventory/components/refresh_btn';
import AddCashierPopup from './components/add_cashier';
import { toast } from 'sonner';
import { MdAdd } from 'react-icons/md';
import NotFound from '@/app/not-found';
import { useSelector } from 'react-redux';
import Footer from '@/components/footer';
import { apiFetch } from '@/utils/apiFetch';

export default function CashiersPage() {
  const { user } = useSelector((state) => state.user);

  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);

  const localKey = `inventoryData_cashiers_${user?.id}`;

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await apiFetch(`/api/cashiers?userId=${user?.adminId}`);
      const data = await res.json();
      if (res.ok) {
        setCashiers(data.data);
        const timestamp = new Date().toISOString();
        setLastUpdated(timestamp);
        setRefreshFailed(false);
        localStorage.setItem(
          localKey,
          JSON.stringify({ data: data.data, lastUpdated: timestamp })
        );
      } else {
        setRefreshFailed(true);
        toast.error('Refresh failed');
      }
    } catch {
      setRefreshFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.adminId, localKey]);

  // Load from cache on mount, fallback to network
  useEffect(() => {
    const cachedData = localStorage.getItem(localKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      setCashiers(parsed.data);
      setLastUpdated(parsed.lastUpdated);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [localKey, fetchData]);

  // Polling: auto-refresh if data is stale (> 20 min)
  useEffect(() => {
    if (!user?.id) return;

    const checkAndAutoFetch = () => {
      if (!navigator.onLine) return;

      const now = Date.now();
      const twentyMinutes = 20 * 60 * 1000;

      let last = lastUpdated ? new Date(lastUpdated).getTime() : 0;

      if (!last) {
        const cached = localStorage.getItem(localKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.lastUpdated) {
            last = new Date(parsed.lastUpdated).getTime();
          }
        }
      }

      if (!last || now - last >= twentyMinutes) {
        fetchData();
      }
    };

    const interval = setInterval(checkAndAutoFetch, 2 * 60 * 1000);
    checkAndAutoFetch();
    window.addEventListener('online', checkAndAutoFetch);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkAndAutoFetch);
    };
  }, [user?.id, localKey, lastUpdated, fetchData]);

  const RefreshData = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }
    const loadingToastId = toast.loading('Refreshing...');
    try {
      await fetchData();
      toast.success('Data refreshed!', { id: loadingToastId });
    } catch (error) {
      toast.error('Failed to refresh data.', { id: loadingToastId });
    }
  };

  // All hooks above — role guard comes last
  if (user?.role === 'superadmin' || user?.role === 'cashier') {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Header />
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-[68px] bg-white z-40">
          <div className="w-full flex justify-center md:justify-start">
            <h2 className="text-lg flex items-center gap-1 line-clamp-1 md:text-xl font-bold text-gray-800 text-center md:text-left">
              Cashiers
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
              loading={loading || refreshing}
              onClick={RefreshData}
            />
            <button
              onClick={() => setShowAddPopup(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-3 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm transition-colors disabled:hover:bg-green-500 disabled:cursor-not-allowed"
            >
              <MdAdd /> <span className="hidden sm:block"> Add Cashier</span>
            </button>
          </div>
        </div>

        <CashierTable
          cashiers={cashiers}
          loading={refreshing}
          onChange={fetchData}
          adminId={user?.adminId}
        />
      </div>

      {showAddPopup && (
        <AddCashierPopup
          adminId={user?.adminId}
          onClose={() => setShowAddPopup(false)}
          onSuccess={fetchData}
        />
      )}
      <Footer />
    </div>
  );
}
