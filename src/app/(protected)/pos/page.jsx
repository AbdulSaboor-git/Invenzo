'use client';
import Header from '@/components/header';
import React, { useEffect, useState } from 'react';
import { MdClose, MdDelete, MdSearch } from 'react-icons/md';
import { useSelector } from 'react-redux';
import RefreshButton from '../inventory/components/refresh_btn';
import { toast } from 'sonner';
import SearchBar from '@/components/search_bar';
import Cart from './components/cart';
import Loading from '@/app/loading';
import ProductCard from './components/product_card';

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
  const [placingOrder, setPlacingOrder] = useState(false);

  function createCartItem(product) {
    const unitPricePerBase =
      product.unit === 'kg'
        ? product.salePrice / 1000
        : product.unit === 'liter'
          ? product.salePrice / 1000
          : product.salePrice;

    let quantity = 1; // base unit
    product.unit === 'kg' && (quantity = 1000); // default 1000g for kg
    product.unit === 'liter' && (quantity = 1000); // default 1000ml for liter

    const price = Number((quantity * unitPricePerBase).toFixed(2));

    return {
      product,
      quantity,
      price,
    };
  }

  useEffect(() => {
    fetchInventory();
    fetchAndStoreData();
  }, []);

  function addToCart(product) {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        toast.error('Product already in cart');
        return prevCart;
      } else {
        return [createCartItem(product), ...prevCart];
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
    if (loadingData || refreshing || loadingInventory) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [loadingData, refreshing, loadingInventory]);

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

  if (user?.role === 'superadmin') {
    return <NotFound />;
  }

  return (
    <div className="flex w-full flex-col bg-gray-50">
      <Header className={'shadow'} />

      {/* Main Grid Layout */}
      <div
        className={`grid grid-cols-1 md:grid-cols-[2fr_1.6fr] max-w-7xl mx-auto w-full md:my-4 md:px-2 md:gap-4 ${(placingOrder || loadingData || refreshing || loadingInventory) && 'opacity-70 pointer-events-none'}`}
      >
        {/* Products Section */}
        <div className="md:h-[calc(100vh-140px)] h-[40vh] border-none overflow-y-auto bg-gray-100 shadow-sm md:rounded-xl">
          <div className="  relative">
            <div className="flex px-3 md:pl-5 md:pr-2 items-stretch  bg-gray-50 z-10 justify-between gap-2 md:gap-4 py-3 sticky top-0">
              <h2 className="hidden md:block place-self-center text-base md:text-lg font-semibold text-gray-800">
                Products
              </h2>
              <SearchBar
                className={'bg-white'}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <RefreshButton
                className="aspect-square md:aspect-auto"
                failedtoRefresh={refreshFailed}
                loading={loadingInventory || refreshing}
                onClick={RefreshData}
              />
            </div>
            <div className="px-3 md:pl-5 md:pr-2 py-2 grid grid-cols-2 bg-gray-100 sm:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-3">
              {products
                .filter((product) => {
                  const query = searchQuery.toLowerCase().trim();
                  return (
                    product.name.toLowerCase().includes(query) ||
                    (product.category &&
                      product.category.name.toLowerCase().includes(query)) ||
                    (product.tags && product.tags.toLowerCase().includes(query))
                  );
                })
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    addToCart={addToCart}
                    product={product}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <Cart
          cart={cart}
          setCart={setCart}
          user={user}
          invId={inventory?.id}
          setPlacingOrder={setPlacingOrder}
        />
      </div>
    </div>
  );
}
