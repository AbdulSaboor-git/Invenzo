'use client';
import Header from '@/components/header';
import useAuthUser from '@/hooks/authUser';
import { useEffect, useState } from 'react';
import CashierTable from './components/cashier_table';
import RefreshButton from '../inventory/components/refresh_btn';
import { toast } from 'sonner';

export default function CashiersPage() {
  const { user } = useAuthUser();
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);

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
      const res = await fetch(`/api/cashiers?userId=${user?.id}`);
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

  return (
    <div className="flex flex-col items-center w-full">
      <Header className={'shadow'} />
      <div className="px-5 py-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Cashiers</h1>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last Updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
            <RefreshButton
              failedtoRefresh={refreshFailed}
              loading={loading || refreshing}
              onClick={RefreshData}
            />
          </div>
        </div>
        <CashierTable
          cashiers={cashiers}
          loading={refreshing}
          onChange={fetchData}
          adminId={user?.id}
        />
      </div>
    </div>
  );
}
