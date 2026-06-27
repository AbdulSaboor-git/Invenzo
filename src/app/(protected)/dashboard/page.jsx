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
import NotFound from '@/app/not-found';
import { apiFetch } from '@/utils/apiFetch';

export default function DashboardPage() {
  const { user } = useSelector((state) => state.user);

  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // yyyy-mm-dd
  }

  const today = new Date();
  const [fromDate, setFromDate] = useState(formatDateForInput(today));
  const [toDate, setToDate] = useState(formatDateForInput(today));

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
    if (!navigator.onLine) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/dashboard', {
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

  if (user?.role === 'cashier') {
    return <NotFound />;
  }

  return loading && !metrics ? (
    <Loading />
  ) : (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100">
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
            title="Gross Sales Revenue"
            value={
              metrics
                ? `Rs. ${Number(metrics.totalSalesAmount).toFixed(0)}`
                : '—'
            }
            subtitle="Total billed sales (before discounts)"
          />

          {user.role === 'admin' && (
            <StatCard
              title="Net Profit (After COGS)"
              value={
                metrics ? `Rs. ${Number(metrics.totalProfit).toFixed(0)}` : '—'
              }
              subtitle="Gross revenue minus cost of goods"
            />
          )}

          <StatCard
            title="Completed Sales Orders"
            value={metrics ? metrics.totalSalesCount : '—'}
            subtitle="Number of finalized transactions"
          />

          <StatCard
            title="Average Transaction Value (ATV)"
            value={
              metrics ? `Rs. ${Number(metrics.avgSaleValue).toFixed(0)}` : '—'
            }
            subtitle="Mean revenue per sale"
          />

          <StatCard
            title="Average Profit Margin per Sale"
            value={
              metrics
                ? `Rs. ${Number(metrics.avgProfitPerSale).toFixed(0)}`
                : '—'
            }
            subtitle="Net profit per completed sale"
          />

          {user.role === 'admin' && (
            <StatCard
              title="Cumulative Discounts Issued"
              value={
                metrics
                  ? `Rs. ${Number(metrics.totalDiscounts).toFixed(0)}`
                  : '—'
              }
              subtitle="Total discounts across all sales"
            />
          )}

          <StatCard
            title="Active Cashiers"
            value={metrics ? metrics.cashierCount - 1 : '—'}
            subtitle="Cashiers who processed sales"
          />

          {user.role === 'superadmin' && (
            <>
              <StatCard
                title="Active Inventories"
                value={metrics ? metrics.inventoryCount : '—'}
                subtitle="Inventories currently in use"
              />
              <StatCard
                title="Registered Users"
                value={metrics ? metrics.userCount : '—'}
                subtitle="All user accounts"
              />
              <StatCard
                title="New User Signups (30 Days)"
                value={metrics ? metrics.newUsersRegisteredLast30Days : '—'}
                subtitle="Recent account registrations"
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
