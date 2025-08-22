'use client';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ScrollToTop from '@/components/scroll_to_top';
import Header from '@/components/header';
import usePreferences from '@/hooks/usePreferences';
import { useSelector } from 'react-redux';
import RefreshButton from '../inventory/components/refresh_btn';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { MdAdd } from 'react-icons/md';
import AddCategoryPopup from './components/add_category';
import EditCategoryPopup from './components/edit_category';
import DeleteCategoryPopup from './components/delete_category';

export default function Inventory() {
  // const { user, logout } = useAuthUser();
  const { user } = useSelector((state) => state.user);
  const [inventory, setInventory] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [fetchedInv, setFetchedInv] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshFailed, setRefreshFailed] = useState(false);

  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [addPopUp, setAddPopup] = useState(false);
  const [editPopUp, setEditPopup] = useState(false);
  const [deletePopUp, setDeletePopup] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const localStorageKey = user?.id ? `inventoryData_${user.id}` : null;

  const fetchInventory = async () => {
    if (!user) return;
    try {
      setLoadingInventory(true);

      let response = await fetch(`/api/inventory?adminId=${user?.adminId}`);

      if (!response.ok) throw new Error('Failed to fetch inventory');

      const data = await response.json();
      setInventory(data.inventory);
      console.log(data.inventory);

      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(localStorageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          localStorage.setItem(
            localStorageKey,
            JSON.stringify({ ...parsed, inventory: data.inventory })
          );
        }
      }
    } catch (error) {
      console.error('Error fetching inventories:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  const fetchAndStoreData = async () => {
    if (!user?.id || !inventory || loadingInventory) {
      return;
    }
    try {
      setRefreshFailed(false);
      setLoadingData(true);
      setRefreshing(true);
      const response = await fetch(`/api/inventory/${inventory?.id}/category`);
      if (!response.ok) throw new Error('Failed to fetch from server');

      const data = await response.json();
      const categories = data;
      const timestamp = new Date().toISOString();
      setLastUpdated(timestamp);
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(localStorageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          localStorage.setItem(
            localStorageKey,
            JSON.stringify({
              ...parsed,
              categories: categories,
              lastUpdated: timestamp,
            })
          );
        }
      }
      setCategories(categories);
    } catch (err) {
      setRefreshFailed(true);
      console.error('Fetch error:', err);
      toast.error('Failed to refresh. Showing cached data.');
    } finally {
      setLoadingData(false);
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
      await fetchInventory();
      await fetchAndStoreData();
      toast.success('Data refreshed!', { id: loadingToastId });
    } catch (error) {
      toast.error('Failed to refresh data.', { id: loadingToastId });
    }
  };

  const loadFromLocalStorage = () => {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(localStorageKey);
        if (!cached) {
          return false;
        }

        const parsed = JSON.parse(cached);
        if (
          !parsed ||
          !Array.isArray(parsed.products) ||
          !Array.isArray(parsed.categories) ||
          typeof parsed.inventory !== 'object' ||
          parsed.inventory == null
        ) {
          if (parsed.inventory == null) {
            console.log(parsed.inventory);
          } else if (typeof parsed.inventory !== 'object')
            console.log('inv not obj');
          return false;
        }
        setCategories(parsed.categories);
        setInventory(parsed.inventory);
        setLastUpdated(parsed.lastUpdated);
        return true;
      }
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const hasLocal = loadFromLocalStorage();
    if (!hasLocal) {
      setFetchedInv(true);
      fetchInventory();
    } else {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (inventory && !loadingInventory && fetchedInv) fetchAndStoreData();
  }, [inventory, loadingInventory, fetchedInv]);

  useEffect(() => {
    if (!loadingInventory && !inventory) {
      setLoadingData(false);
    }
  }, [loadingInventory, inventory]);

  useEffect(() => {
    if (addPopUp || editPopUp || deletePopUp) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [addPopUp || editPopUp || deletePopUp]);

  useEffect(() => {
    if (!user?.id || !inventory) return;

    const checkAndAutoFetch = () => {
      if (!navigator.onLine) return; // skip offline

      const now = Date.now();
      const sixtyMinutes = 60 * 60 * 1000;

      // always re-read latest "lastUpdated"
      let last = lastUpdated ? new Date(lastUpdated).getTime() : 0;

      // fallback to localStorage if state is empty
      if (!last) {
        const cached = localStorage.getItem(localStorageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.lastUpdated) {
            last = new Date(parsed.lastUpdated).getTime();
          }
        }
      }

      if (!last || now - last >= sixtyMinutes) {
        fetchAndStoreData();
      }
    };

    // run every 2 minutes
    const interval = setInterval(checkAndAutoFetch, 2 * 60 * 1000);

    // run immediately once on mount
    checkAndAutoFetch();

    // also run when coming back online
    window.addEventListener('online', checkAndAutoFetch);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkAndAutoFetch);
    };
  }, [user?.id, inventory, localStorageKey, fetchAndStoreData]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

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
    <div className="flex w-full flex-col items-center justify-center ">
      <Header />
      <div className="w-full max-w-7xl place-self-center pb-16">
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-[68px] bg-white z-40">
          <div className="w-full flex justify-center md:justify-start">
            <h2 className="text-lg line-clamp-1 md:text-xl font-bold text-gray-800 text-center md:text-left ">
              Categories
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
              loading={loadingInventory || refreshing}
              onClick={RefreshData}
            />
            <button
              onClick={() => setAddPopup(true)}
              disabled={refreshing || loadingData}
              className="flex items-center gap-2 px-3 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm transition-colors disabled:hover:bg-green-500 disabled:cursor-not-allowed"
            >
              <MdAdd /> <span className="hidden sm:block"> Add Category</span>
            </button>
          </div>
        </div>
        <div className="bg-white  md:p-6">
          <div className="overflow-x-auto md:rounded-xl shadow-md border border-gray-200 ">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-3 md:px-6 md:py-4 text-center">#</th>
                  <th className=" px-3 py-3 min-w-[140px] md:px-6 md:py-4 cursor-pointer">
                    Name
                  </th>
                  <th className=" px-3 py-3 md:px-6 md:py-4 cursor-pointer">
                    Products
                  </th>
                  <th className="px-3 py-3 min-w-[140px] md:min-w-[160px] md:px-6 md:py-4 cursor-pointer">
                    Last Modified
                  </th>
                  <th className="px-3 py-3 min-w-[120px] md:min-w-[140px] md:px-6 md:py-4 cursor-pointer">
                    Date Added
                  </th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {loadingData || loadingInventory || !inventory ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-8">
                      Loading...
                    </td>
                  </tr>
                ) : categories.length > 0 && user ? (
                  categories.map((category, index) => {
                    return (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-50 transition cursor-pointer "
                      >
                        <td className="px-3 py-2 md:px-6 md:py-4 text-gray-500 text-center">
                          {index + 1}
                        </td>
                        <td className="px-3 min-w-[140px] py-2 md:px-6 md:py-4 font-medium cursor-pointer">
                          {category.name}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 font-medium cursor-pointer">
                          {category._count?.products}
                        </td>
                        <td className="px-3 py-2 min-w-[140px] md:min-w-[160px] md:px-6 md:py-4">
                          {formatDate(category.updatedAt)}
                        </td>
                        <td className="px-3 py-2 min-w-[120px] md:min-w-[140px] md:px-6 md:py-4">
                          {formatDate(category.createdAt)}
                        </td>
                        <td
                          className="px-3 py-2 text-right relative cursor-pointer"
                          ref={buttonRef}
                        >
                          <button
                            className="pt-[3px] pr-2"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === category.id ? null : category.id
                              )
                            }
                          >
                            <BsThreeDotsVertical size={18} />
                          </button>
                        </td>
                        <td className={`w-0`}>
                          {openMenuId === category.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-8 md:right-14 mt-3 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                            >
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100"
                                onClick={() => {
                                  setEditPopup(true);
                                  setCategoryToEdit(category);
                                }}
                              >
                                <FiEdit /> Edit
                              </button>
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-gray-100"
                                onClick={() => {
                                  setDeletePopup(true);
                                  setCategoryToDelete(category);
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
                    <td colSpan="6" className="text-center text-gray-500 py-8">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {addPopUp && (
          <AddCategoryPopup
            invId={inventory?.id}
            onClose={() => setAddPopup(false)}
            onSuccess={() => {
              fetchAndStoreData();
              setAddPopup(false);
            }}
          />
        )}

        {editPopUp && (
          <EditCategoryPopup
            invId={inventory?.id}
            category={categoryToEdit}
            onClose={() => setEditPopup(false)}
            onSuccess={() => {
              fetchAndStoreData();
              setEditPopup(false);
            }}
          />
        )}

        {deletePopUp && (
          <DeleteCategoryPopup
            invId={inventory?.id}
            category={categoryToDelete}
            onClose={() => setDeletePopup(false)}
            onSuccess={() => {
              fetchAndStoreData();
              setDeletePopup(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
