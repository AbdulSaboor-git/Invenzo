'use client';
import Header from '@/components/header';
import React, { useEffect, useState } from 'react';
import { MdClose, MdDelete, MdSearch } from 'react-icons/md';
import { useSelector } from 'react-redux';
import RefreshButton from '../inventory/components/refresh_btn';
import { toast } from 'sonner';
import SearchBar from '@/components/search_bar';
import Cart from './components/cart';

export default function POSPage() {
  const { user } = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [inventory, setInventory] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [fetchedInv, setFetchedInv] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const localStorageKey = user?.id ? `inventoryData_${user.id}` : null;

  function createCartItem(product) {
    const unitPricePerBase =
      product.unit === 'kg'
        ? product.salePrice / 1000
        : product.unit === 'liter'
          ? product.salePrice / 1000
          : product.salePrice;

    const quantity = 1; // base unit
    const totalPrice = Number((quantity * unitPricePerBase).toFixed(2));

    return {
      product,
      quantity,
      totalPrice,
    };
  }

  function addToCart(product) {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        toast.error('Product already in cart');
        return prevCart;
      } else {
        return [...prevCart, createCartItem(product)];
      }
    });
  }

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
      const response = await fetch(
        `/api/inventory/${inventory?.id}?userId=${user?.id}`
      );
      if (!response.ok) throw new Error('Failed to fetch from server');

      const data = await response.json();
      const { products, categories } = data;
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
              products: products,
              categories: categories,
              lastUpdated: timestamp,
            })
          );
        } else {
          localStorage.setItem(
            localStorageKey,
            JSON.stringify({ products, categories, inventory })
          );
        }
      }
      setProducts(products);
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
        console.log(parsed.products);
        setProducts(parsed.products);
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
    if (loadingData) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [loadingData]);

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

  if (user?.role === 'superadmin') {
    return <NotFound />;
  }

  return (
    <div className="flex w-full flex-col bg-gray-50">
      <Header />

      {/* Sticky Controls */}
      <div
        className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between items-center 
                    shadow-sm px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-[68px] bg-white z-40 "
      >
        <div className="flex w-full items-stretch justify-end gap-3 bg-white">
          {/* Last updated */}
          {lastUpdated && (
            <span className="text-sm place-content-center block text-gray-500">
              Last Updated: {new Date(lastUpdated).toLocaleString()}
            </span>
          )}

          {/* Refresh Button */}
          <RefreshButton
            className="aspect-square md:aspect-auto"
            failedtoRefresh={refreshFailed}
            loading={loadingInventory || refreshing}
            onClick={RefreshData}
          />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1.6fr] max-w-7xl mx-auto w-full md:mt-4 gap-3 md:gap-4">
        {/* Products Section */}
        <div className="border-r md:h-[calc(100vh-200px)] h-[30vh] overflow-y-auto bg-white shadow-sm md:rounded-xl">
          <div className="px-3 md:pl-5 md:pr-2 relative">
            <div className="flex items-center bg-white z-10 py-2 justify-between gap-3 md:gap-4 mt-2 mb-2 md:mt-0 md:mb-6 sticky top-0">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">
                Products
              </h2>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
            {loadingData ? (
              <div className="flex items-center justify-center h-40 md:h-64">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12 md:h-16 md:w-16"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                {products
                  .filter((product) => {
                    const query = searchQuery.toLowerCase();
                    return (
                      product.name.toLowerCase().includes(query) ||
                      (product.category &&
                        product.category.name.toLowerCase().includes(query)) ||
                      (product.tags &&
                        product.tags.toLowerCase().includes(query))
                    );
                  })
                  .map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="border rounded-xl md:rounded-2xl p-2 md:p-4 flex flex-col items-center justify-center text-center
                          shadow-sm hover:shadow-md hover:scale-[1.02] hover:border-gray-300
                          transition-all duration-200 bg-white cursor-pointer select-none"
                    >
                      <h3 className="text-sm md:text-base font-semibold text-gray-800 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        {product.category?.name || 'Uncategorized'}
                      </p>
                      <p className="text-base md:text-lg font-bold mt-2 text-gray-900">
                        <span className="text-xs md:text-sm text-gray-600 font-normal">
                          Rs.
                        </span>{' '}
                        {product.salePrice}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="h-[45vh] md:h-auto">
          <Cart cart={cart} setCart={setCart} />
        </div>
      </div>
    </div>
  );
}
