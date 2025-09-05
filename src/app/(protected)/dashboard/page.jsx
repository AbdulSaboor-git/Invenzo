'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StatCard from './components/StatCard';
import SalesTrendChart from './components/SalesTrendChart';
import PaymentPie from './components/PaymentPie';
import TopProducts from './components/TopProducts';
import CashierList from './components/CashierList';
import RecentSalesTable from './components/RecentSalesTable';
import CategorySales from './components/CategorySales';
import Header from '@/components/header';
import Loading from '@/app/loading';
import Footer from '@/components/footer';

export default function DashboardPage() {
  const { user } = useSelector((state) => state.user);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchMetrics();
    const t = setInterval(fetchMetrics, 1000 * 60 * 2);
    return () => clearInterval(t);
  }, [user]);

  async function fetchMetrics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: user.role,
          inventoryId: user.invId ?? null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  if (!user)
    return <div className="p-6">Please login to see the dashboard.</div>;

  return loading && !metrics ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-[68px] bg-white z-40">
        <div className="w-full flex justify-center md:justify-start">
          <h2 className="text-lg flex items-center gap-1 line-clamp-1 md:text-xl font-bold text-gray-800 text-center md:text-left">
            Dashboard
            {user?.role !== 'superadmin' && (
              <span className="hidden md:block font-normal text-gray-700">
                {' - ' + user?.invName || ''}
              </span>
            )}
          </h2>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total Revenue"
            value={
              metrics
                ? `Rs ${Number(metrics.totalSalesAmount).toFixed(0)}`
                : '—'
            }
            subtitle="Sum of all sale revenues "
          />
          <StatCard
            title="Total Transactions"
            value={metrics ? metrics.totalSalesCount : '—'}
            subtitle="Number of sales"
          />
          <StatCard
            title="Avg Sale Value"
            value={
              metrics ? `Rs ${Number(metrics.avgSaleValue).toFixed(0)}` : '—'
            }
            subtitle="Average per sale"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/60 p-4 rounded-2xl shadow-sm">
            <h2 className="font-semibold mb-3">Sales Trend (Last 7 Days) </h2>
            <SalesTrendChart data={metrics?.salesTrend} />
          </div>

          <div className="bg-white/60 p-4 rounded-2xl shadow-sm w-full md:w-auto">
            <h2 className="font-semibold mb-3">Payment Method Breakdown</h2>
            <PaymentPie data={metrics?.paymentBreakdown} />
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-3">
              Top Selling Products by Weight
            </h3>
            <TopProducts products={metrics?.topProductsByWeight} />
          </div>

          <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-3">
              Top Selling Products by Number of Pieces
            </h3>
            <TopProducts products={metrics?.topProductsByNumber} />
          </div>

          <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-3">Cashier Performance</h3>
            <CashierList cashiers={metrics?.cashierPerformance} />
          </div>
        </section>

        <section className="mt-6 bg-white/60 p-4 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-3">Recent Sales</h3>
          <RecentSalesTable sales={metrics?.recentSales} user={user} />
        </section>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-3">Category-wise Sales</h3>
            <CategorySales categories={metrics?.categorySales} />
          </div>

          {/* {user.role === 'superadmin' && (
            <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
              <h3 className="font-semibold mb-3">Misc Stats</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-gray-600">Total Discounts</div>
                <div className="font-medium">
                  Rs {metrics ? Number(metrics.totalDiscounts).toFixed(0) : '0'}
                </div>
                <div className="text-sm text-gray-600">Total Inventories</div>
                <div className="font-medium">
                  {metrics?.inventoryCount ?? '-'}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="font-medium">{metrics?.userCount ?? '-'}</div>
              </div>
            </div>
          )} */}
        </section>
      </div>

      <Footer />
    </div>
  );
}
