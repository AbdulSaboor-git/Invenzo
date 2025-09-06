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
  const today = new Date().toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchMetrics();
    const t = setInterval(fetchMetrics, 1000 * 60 * 2);
    return () => clearInterval(t);
  }, [user, fromDate, toDate]);

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
          fromDate,
          toDate,
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

      {/* Top bar */}
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

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <div>
            <label className="text-xs block text-gray-600">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs block text-gray-600">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {error && <div className="mb-4 text-red-600">{error}</div>}

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Revenue"
            value={
              metrics
                ? `Rs. ${Number(metrics.totalSalesAmount).toFixed(0)}`
                : '—'
            }
            subtitle="Sum of all sale revenues"
          />
          <StatCard
            title="Total Transactions"
            value={metrics ? metrics.totalSalesCount : '—'}
            subtitle="Number of sales"
          />
          <StatCard
            title="Avg Sale Value"
            value={
              metrics ? `Rs. ${Number(metrics.avgSaleValue).toFixed(0)}` : '—'
            }
            subtitle="Average per sale"
          />

          {/* Admin-only */}
          {user.role === 'admin' && (
            <StatCard
              title="Total Discounts"
              value={
                metrics
                  ? `Rs. ${Number(metrics.totalDiscounts).toFixed(0)}`
                  : '—'
              }
              subtitle="Discounts given"
            />
          )}

          {/* Everyone */}
          <StatCard
            title="Cashier Count"
            value={metrics ? metrics.cashierCount - 1 : '—'}
            subtitle="Number of cashiers"
          />

          {/* Superadmin-only */}
          {user.role === 'superadmin' && (
            <>
              <StatCard
                title="Inventory Count"
                value={metrics ? metrics.inventoryCount : '—'}
                subtitle="Number of inventories"
              />
              <StatCard
                title="User Count"
                value={metrics ? metrics.userCount : '—'}
                subtitle="All users"
              />
              <StatCard
                title="New Users (30d)"
                value={metrics ? metrics.newUsersRegisteredLast30Days : '—'}
                subtitle="Registered recently"
              />
            </>
          )}
        </section>

        {/* Sales Trend & Payment */}
        <section
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${fromDate === toDate && 'lg:grid-cols-2'} `}
        >
          {fromDate != toDate && (
            <div className="md:col-span-2 bg-white/60 p-4 rounded-2xl shadow-sm">
              <h2 className="font-semibold mb-3">Sales Trend</h2>
              <SalesTrendChart data={metrics?.salesTrend} />
            </div>
          )}

          <div className="bg-white/60 p-4 rounded-2xl shadow-sm w-full md:w-auto">
            <h2 className="font-semibold mb-3">Payment Method Breakdown</h2>
            <PaymentPie data={metrics?.paymentBreakdown} />
          </div>
        </section>

        {/* Products & Cashiers */}
        <section
          className={`mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 ${user.role === 'admin' && 'lg:grid-cols-3'} `}
        >
          <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-3">
              Top Selling Products by Weight
            </h3>
            <TopProducts products={metrics?.topProductsByWeight} />
          </div>

          <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-3">
              Top Selling Products by Pieces
            </h3>
            <TopProducts products={metrics?.topProductsByNumber} />
          </div>

          {user.role === 'admin' && (
            <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
              <h3 className="font-semibold mb-3">Cashiers Performance</h3>
              <CashierList cashiers={metrics?.cashierPerformance} />
            </div>
          )}
        </section>

        {/* Recent Sales */}
        <section className="mt-6 bg-white/60 p-4 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-3">Recent Sales</h3>
          <RecentSalesTable sales={metrics?.recentSales} user={user} />
        </section>

        {/* Category Sales */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-3">Category-wise Sales</h3>
            <CategorySales categories={metrics?.categorySales} />
          </div>
        </section>

        {/* Superadmin-only extra sections */}
        {user.role === 'superadmin' && (
          <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
              <h3 className="font-semibold mb-3">Top Inventories by Sales</h3>
              <ul className="text-sm list-disc ml-5">
                {metrics?.inventorySales?.map((inv) => (
                  <li key={inv.inventoryId}>
                    {inv.inventoryName}: Rs. {Number(inv.total).toFixed(0)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl shadow-sm">
              <h3 className="font-semibold mb-3">Inactive Inventories (30d)</h3>
              <ul className="text-sm list-disc ml-5">
                {metrics?.inactiveInventories?.map((inv) => (
                  <li key={inv.id}>{inv.name}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
