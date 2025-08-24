'use client';
import Header from '@/components/header';
import useAuthUser from '@/hooks/authUser';
import { useEffect, useMemo, useRef, useState } from 'react';
import RefreshButton from '@/app/(protected)/inventory/components/refresh_btn';
import { toast } from 'sonner';
import { MdAdd, MdOutlineAdminPanelSettings } from 'react-icons/md';
import { BsThreeDotsVertical, BsShieldLock } from 'react-icons/bs';
import { FiEdit, FiKey, FiTrash2 } from 'react-icons/fi';
import NotFound from '@/app/not-found';
import usePreferences from '@/hooks/usePreferences';
import { IoLockClosed, IoLockOpen } from 'react-icons/io5';
import { useSelector } from 'react-redux';

/*
  Super Admin Panel (Users Management)
  - Route: app/(protected)/super-admin/page.jsx
  - Mirrors Cashier page layout
  - Features: top stats, filters + search, localStorage cache, offline-friendly, toasts
  - Actions: Add Admin, Edit User (name+status only), Reset Password, Delete User
  - API: /api/users (GET, POST, PUT, PATCH, DELETE)
*/

export default function SuperAdminPage() {
  // const { user, logout } = useAuthUser();
  const { user } = useSelector((state) => state.user);

  // Access control
  if (user && user.role !== 'superadmin') return <NotFound />;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all'); // all | admin | cashier
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [authenticated, setAuthenticated] = useState(false);
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const prefs = usePreferences(user?.id, user?.role);

  const localKey = `inventoryData_users_${user?.id}`;

  useEffect(() => {
    try {
      const cached = localStorage.getItem(localKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setUsers(parsed.data || []);
        setLastUpdated(parsed.lastUpdated || null);
        setLoading(false);
      } else {
        fetchData();
      }
    } catch {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchData = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }
    try {
      setRefreshing(true);
      const res = await fetch('/api/user/user');
      const data = await res.json();
      if (!res.ok) {
        setRefreshFailed(true);
        toast.error(data?.error || 'Failed to fetch users');
        return;
      }
      const list = data?.data || [];
      setUsers(list);
      const timestamp = new Date().toISOString();
      setLastUpdated(timestamp);
      setRefreshFailed(false);
      localStorage.setItem(
        localKey,
        JSON.stringify({ data: list, lastUpdated: timestamp })
      );
    } catch (e) {
      setRefreshFailed(true);
      toast.error('Unable to refresh users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefreshClick = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }
    const id = toast.loading('Refreshing users...');
    try {
      await fetchData();
      toast.success('Users refreshed', { id });
    } catch (error) {
      toast.error('Failed to refresh users.', { id });
    }
  };

  // Derived lists for filters
  const inventories = useMemo(() => {
    const set = new Map();
    users.forEach((u) => {
      if (u.inventory?.id) set.set(u.inventory.id, u.inventory.name);
    });
    return Array.from(set, ([id, name]) => ({ id, name }));
  }, [users]);

  // Filtering + search
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && (u.role || 'unknown') !== roleFilter)
        return false;
      if (statusFilter !== 'all') {
        const active = u.isActive ? 'active' : 'inactive';
        if (statusFilter !== active) return false;
      }
      if (inventoryFilter !== 'all') {
        if (!u.inventory || String(u.inventory.id) !== String(inventoryFilter))
          return false;
      }
      if (term) {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        const inv = (u.inventory?.name || '').toLowerCase();
        if (
          !name.includes(term) &&
          !email.includes(term) &&
          !inv.includes(term)
        )
          return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, inventoryFilter, search]);

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(
      (u) => u.role === 'admin' || u.role === 'superadmin'
    ).length;
    const cashiers = users.filter((u) => u.role === 'cashier').length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    return { total, admins, cashiers, active, inactive };
  }, [users]);

  useEffect(() => {
    if (!user?.id) return;

    const checkAndAutoFetch = () => {
      if (!navigator.onLine) return;

      const now = Date.now();
      const twentyMinutes = 20 * 60 * 1000;

      let last = 0;
      const cached = localStorage.getItem(localKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.lastUpdated) {
          last = new Date(parsed.lastUpdated).getTime();
        }
      }

      if (!last || now - last >= twentyMinutes) {
        fetchData();
      }
    };

    checkAndAutoFetch();

    const interval = setInterval(checkAndAutoFetch, 2 * 60 * 1000);
    window.addEventListener('online', checkAndAutoFetch);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkAndAutoFetch);
    };
  }, [user?.id]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }
    setAuthLoading(true);
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, password: passwordInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Incorrect password');
        return;
      }

      setTimeout(setAuthenticated, 1500, true);
      setPasswordInput('');
      setIsPasswordCorrect(true);
      toast.success('Access granted');
    } catch (err) {
      toast.error('Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  if (prefs.requireSuperAdminPassword && !authenticated) {
    return (
      <div className="flex flex-col items-center">
        <Header className={'shadow'} />
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center p-6">
          <div className="bg-white rounded-xl shadow p-6 md:p-8 w-full min-w-[300px] max-w-md border border-gray-200">
            <div className="w-full text-4xl mb-4 text-gray-500">
              {isPasswordCorrect ? (
                <IoLockOpen className="place-self-center" />
              ) : (
                <IoLockClosed className="place-self-center" />
              )}
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Enter Password to Access <br /> Super-Admin Panel
            </h1>
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={authLoading || isPasswordCorrect}
                className={`px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed ${
                  authLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {authLoading
                  ? 'Checking...'
                  : isPasswordCorrect
                    ? 'Unlocked'
                    : 'Unlock Settings'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full pb-20">
      <Header />

      <div className="w-full">
        {/* Sticky toolbar */}
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-[68px] bg-white z-40">
          <div className="min-w-[250px] flex justify-center md:justify-start">
            <h2 className="text-lg line-clamp-1 md:text-xl font-bold text-gray-800 text-center md:text-left cursor-pointer flex items-center gap-2">
              <MdOutlineAdminPanelSettings className="text-gray-700" /> Super
              Admin
            </h2>
          </div>

          {/* Right controls: last updated, filters, refresh, add */}
          <div className="flex flex-col gap-3">
            <div className="flex w-full items-stretch justify-end gap-2 sm:gap-3 bg-white flex-wrap">
              {lastUpdated && (
                <span className="text-sm place-content-center hidden lg:block text-gray-500">
                  Last Updated: {new Date(lastUpdated).toLocaleString()}
                </span>
              )}

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
                aria-label="Filter by role"
              >
                <option value="all">All roles</option>
                <option value="admin">Admin</option>
                <option value="cashier">Cashier</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
                aria-label="Filter by status"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Inventory filter (shown if any) */}
              {inventories.length > 0 && (
                <select
                  value={inventoryFilter}
                  onChange={(e) => setInventoryFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                  aria-label="Filter by inventory"
                >
                  <option value="all">All inventories</option>
                  {inventories.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-stretch gap-3 w-full justify-end">
              {/* Search */}
              <input
                type="text"
                placeholder="Search name/email/inventory"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm w-full sm:w-56"
              />

              <RefreshButton
                className="aspect-square md:aspect-auto"
                failedtoRefresh={refreshFailed}
                loading={loading || refreshing}
                onClick={onRefreshClick}
              />

              <button
                onClick={() => setShowAddPopup(true)}
                disabled={refreshing || loading}
                className="flex items-center gap-2 px-3 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm transition-colors disabled:hover:bg-green-500 disabled:cursor-not-allowed"
              >
                <MdAdd /> <span className="hidden sm:block">Add Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top stats */}
        <div className="px-3 md:px-6 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total Users" value={stats.total} />
          <StatCard label="Admins" value={stats.admins} />
          <StatCard label="Cashiers" value={stats.cashiers} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Inactive" value={stats.inactive} />
        </div>

        {/* Users table */}
        <UsersTable
          users={filtered}
          allLoading={loading || refreshing}
          onChange={fetchData}
        />
      </div>

      {/* Add Admin Popup */}
      {showAddPopup && (
        <AddAdminPopup
          onClose={() => setShowAddPopup(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

/* ----------------------------- UI Parts ----------------------------- */
function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="text-2xl font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function UsersTable({ users, allLoading, onChange }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'edit' | 'reset' | 'delete'

  const openPopup = (type, u) => {
    setSelected(u);
    setPopupType(type);
    setOpenMenuId(null);
  };
  const closePopup = () => {
    setSelected(null);
    setPopupType(null);
  };

  useEffect(() => {
    function onDocClick(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="bg-white md:p-6">
      <div className="overflow-x-auto md:rounded-xl shadow-md border border-gray-200 ">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold uppercase tracking-wide">
            <tr>
              <th className="px-3 py-3 text-center">#</th>
              <th className="px-3 py-3 min-w-[140px]">Name</th>
              <th className="px-3 py-3 min-w-[160px]">Email</th>
              <th className="px-3 py-3 min-w-[90px]">Role</th>
              <th className="px-3 py-3 min-w-[180px]">Inventory</th>
              <th className="px-3 py-3">Products</th>
              <th className="px-3 py-3 min-w-[80px]">Status</th>
              <th className="px-3 py-3 min-w-[120px]">Date Added</th>
              <th className="px-3 py-3 min-w-[140px]">Last Modified</th>
              <th className="px-3 py-3 min-w-[120px]">Last Login</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {allLoading ? (
              <tr>
                <td colSpan={10} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : users?.length > 0 ? (
              users?.map((u, index) => (
                <tr
                  key={u.id}
                  className={`${!u.isActive && 'bg-red-50 hover:bg-red-50'} hover:bg-gray-50 transition`}
                >
                  <td className="px-3 py-2 text-center">{index + 1}</td>
                  <td className="px-3 py-2 font-medium min-w-[140px]">
                    {u.firstName} {u.lastName || ''}
                  </td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : u.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}
                    >
                      {u?.role === 'superadmin' ? 's-admin' : u.role || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 min-w-[180px]">
                    {u.inventory?.name || '—'}
                  </td>
                  <td className="px-3 py-2">
                    {u.inventory?.productCount || '—'}
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill active={u.isActive} />
                  </td>
                  <td className="px-3 py-2">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {u.updatedAt
                      ? new Date(u.updatedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
                  </td>
                  <td className="px-3 py-2 text-right relative" ref={buttonRef}>
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === u.id ? null : u.id)
                      }
                      className="p-2 rounded"
                    >
                      <BsThreeDotsVertical size={18} />
                    </button>
                  </td>
                  <td className="w-0">
                    {openMenuId === u.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-8 md:right-14 mt-3 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                      >
                        {u.role != 'superadmin' && (
                          <button
                            onClick={() => openPopup('edit', u)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100"
                          >
                            <FiEdit /> Edit
                          </button>
                        )}
                        <button
                          onClick={() => openPopup('reset', u)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100"
                        >
                          <FiKey /> Reset Password
                        </button>
                        {u.role != 'superadmin' && (
                          <button
                            onClick={() => openPopup('delete', u)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-gray-100"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center text-gray-500 py-6">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popups */}
      {popupType === 'edit' && (
        <EditUserPopup
          userObj={selected}
          onClose={closePopup}
          onSuccess={onChange}
        />
      )}
      {popupType === 'reset' && (
        <ResetPasswordPopup userObj={selected} onClose={closePopup} />
      )}
      {popupType === 'delete' && (
        <DeleteUserPopup
          userObj={selected}
          onClose={closePopup}
          onSuccess={onChange}
        />
      )}
    </div>
  );
}

function StatusPill({ active }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

/* ------------------------------ Popups ------------------------------ */
function AddAdminPopup({ onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const isDisabled =
    !email.trim() || !password.trim() || !firstName.trim() || loading;

  const handleAdd = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/user/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          firstName: firstName.trim(),
          lastName: lastName?.trim(),
          isActive,
        }),
      });

      const data = await res.json();

      // console.log(data?.id);
      try {
        const response = await fetch(`/api/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId: data?.data?.id }),
        });
      } catch {}

      if (!res.ok) {
        toast.error(data?.error || 'Failed to create admin');
        return;
      }
      toast.success('Admin created');
      onSuccess?.();
      onClose?.();
    } catch {
      toast.error('Error creating admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 text-sm bg-black/30 flex items-center justify-center z-50 px-4 sm:px-6 transition ease-in-out backdrop-blur-[2px]">
      <div
        className="bg-white max-h-[96%] hidden_scroll_bar overflow-auto rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg py-8 px-6 sm:py-8 sm:px-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          disabled={loading}
          aria-label="Close add admin form"
        >
          ✕
        </button>
        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Add Admin
        </h3>

        <div className="space-y-4 pb-6">
          <div>
            <label htmlFor="fn" className="block font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fn"
              type="text"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label htmlFor="ln" className="block font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="ln"
              type="text"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="pwd" className="block font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="pwd"
              type="password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 5 characters"
            />
          </div>
          <div>
            <label htmlFor="status" className="block font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={isDisabled}
            className="px-6 py-3 w-28 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition disabled:hover:bg-green-500 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="border-2 border-green-200 border-t-transparent animate-spin rounded-full w-5 h-5 mx-auto" />
            ) : (
              'Create'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditUserPopup({ userObj, onClose, onSuccess }) {
  const [firstName, setFirstName] = useState(userObj?.firstName || '');
  const [lastName, setLastName] = useState(userObj?.lastName || '');
  const [isActive, setIsActive] = useState(Boolean(userObj?.isActive));
  const [loading, setLoading] = useState(false);

  const isDisabled = !firstName.trim() || loading;

  const handleSave = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }

    const normalize = (v) =>
      v === null || v === undefined ? '' : String(v).trim();
    const normalizeBool = (v) => Boolean(v === 'true' || v === true);
    const noChanges =
      normalize(firstName) === normalize(userObj.firstName) &&
      normalize(lastName) === normalize(userObj.lastName) &&
      normalizeBool(isActive) === normalizeBool(userObj.isActive);

    if (noChanges) {
      onClose?.();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/user/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userObj.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'Failed to update user');
        return;
      }
      toast.success('User updated');
      onSuccess?.();
      onClose?.();
    } catch (e) {
      toast.error('Error updating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 text-sm bg-black/30 flex items-center justify-center z-50 px-4 sm:px-6 transition ease-in-out backdrop-blur-[2px]">
      <div
        className="bg-white max-h-[96%] hidden_scroll_bar overflow-auto rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg py-8 px-6 sm:py-8 sm:px-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          disabled={loading}
          aria-label="Close edit user form"
        >
          ✕
        </button>
        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Edit User
        </h3>

        <div className="space-y-4 pb-6">
          <div>
            <label
              htmlFor="first-name"
              className="block font-medium text-gray-700"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="first-name"
              type="text"
              placeholder="Enter first name"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="last-name"
              className="block font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              placeholder="Enter last name"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="user-status"
              className="block font-medium text-gray-700"
            >
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="user-status"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isDisabled}
            className="px-6 py-3 w-24 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition disabled:hover:bg-green-500 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="border-2 border-green-200 border-t-transparent animate-spin rounded-full w-5 h-5 mx-auto" />
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordPopup({ userObj, onClose }) {
  const [loading, setLoading] = useState(false);
  const [newPwd, setNewPwd] = useState('');

  const handleReset = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/user/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userObj.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'Failed to reset password');
        return;
      }
      const pwd = data?.newPassword || '';
      setNewPwd(pwd);
      toast.success('Password reset');
    } catch {
      toast.error('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const copyPwd = async () => {
    try {
      await navigator.clipboard.writeText(newPwd);
      toast.success('Password copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="fixed inset-0 text-sm bg-black/30 flex items-center justify-center z-50 px-4 sm:px-6 transition ease-in-out backdrop-blur-[2px]">
      <div
        className="bg-white max-h-[96%] hidden_scroll_bar overflow-auto rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg py-8 px-6 sm:py-8 sm:px-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          disabled={loading}
          aria-label="Close reset password"
        >
          ✕
        </button>
        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800 flex items-center gap-2 justify-center">
          <BsShieldLock /> Reset Password
        </h3>

        <p className="text-gray-700 mb-4">
          This will reset the password for{' '}
          <span className="font-semibold">
            {userObj?.firstName} {userObj?.lastName}
          </span>
          .
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          {newPwd && (
            <button
              onClick={copyPwd}
              className="px-4 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Copy New Password
            </button>
          )}
        </div>

        {newPwd && (
          <div className="mt-4 p-3 border rounded-lg bg-gray-50">
            <div className="text-xs text-gray-500 mb-1">New Password</div>
            <div className="font-mono text-base select-all break-all">
              {newPwd}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeleteUserPopup({ userObj, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/user/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userObj.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'Failed to delete user');
        return;
      }
      toast.success('User deleted');
      onSuccess?.();
      onClose?.();
    } catch {
      toast.error('Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 text-sm bg-black/30 flex items-center justify-center z-50 px-4 sm:px-6 transition ease-in-out backdrop-blur-[2px]">
      <div
        className="bg-white max-h-[96%] hidden_scroll_bar overflow-auto rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg py-8 px-6 sm:py-8 sm:px-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          disabled={loading}
          aria-label="Close delete user"
        >
          ✕
        </button>
        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Delete User
        </h3>
        <p className="text-gray-700">
          Are you sure you want to delete{' '}
          <span className="font-semibold">
            {userObj?.firstName} {userObj?.lastName}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
