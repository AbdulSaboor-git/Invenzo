'use client';
import Header from '@/components/header';
import useAuthUser from '@/hooks/authUser';
import { useEffect, useState } from 'react';
import CashierTable from './components/cashier_table';
import RefreshButton from '../inventory/components/refresh_btn';
import AddCashierPopup from './components/add_cashier';
import { toast } from 'sonner';
import { MdAdd } from 'react-icons/md';
import NotFound from '@/app/not-found';

export default function CashiersPage() {
  const { user, logout } = useAuthUser();
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);

  const [showAddPopup, setShowAddPopup] = useState(false);

  const localKey = `inventoryData_cashiers_${user?.id}`;

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
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/cashiers?userId=${user?.adminId}`);
      const data = await res.json();
      if (res.ok) {
        setCashiers(data.cashiers);
        const timestamp = new Date().toISOString();
        setLastUpdated(timestamp);
        setRefreshFailed(false);
        localStorage.setItem(
          localKey,
          JSON.stringify({ data: data.cashiers, lastUpdated: timestamp })
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
  };

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

  if (user?.role == 'cashier') {
    return <NotFound />;
  }

  useEffect(() => {
    if (!user?.id) return;

    const checkAndAutoFetch = () => {
      if (!navigator.onLine) return; // skip offline

      const now = Date.now();
      const twentyMinutes = 20 * 60 * 1000;

      // always read the freshest "lastUpdated"
      let last = lastUpdated ? new Date(lastUpdated).getTime() : 0;

      // fallback to localStorage if state is empty
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

    // check every 2 minutes
    const interval = setInterval(checkAndAutoFetch, 2 * 60 * 1000);

    // also check immediately on mount
    checkAndAutoFetch();

    // check when back online
    window.addEventListener('online', checkAndAutoFetch);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkAndAutoFetch);
    };
  }, [user?.id, localKey, fetchData]);

  return (
    <div className="flex flex-col items-center w-full">
      <Header user={user} logout={logout} />
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-[68px] bg-white z-40">
          <div className="w-full flex justify-center md:justify-start">
            <h2 className="text-lg line-clamp-1 md:text-xl font-bold text-gray-800 text-center md:text-left cursor-pointer">
              Cashiers
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

      {/* Add Cashier Popup */}
      {showAddPopup && (
        <AddCashierPopup
          adminId={user?.adminId}
          onClose={() => setShowAddPopup(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
