'use client';
import React, { useEffect, useState } from 'react';
import { HiOutlineSwitchVertical } from 'react-icons/hi';

import { IoSync } from 'react-icons/io5';
import { MdClose, MdEdit } from 'react-icons/md';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { toast } from 'sonner';
import ScrollToTop from '@/components/scroll_to_top';
import useAuthUser from '@/hooks/authUser';
import InvLoader from './components/inv_loader';
import ViewProduct from './components/view_product';
import EditProduct from './components/edit_product';
import DeleteProduct from './components/delete_product';
import Header from '@/components/header';
import usePreferences from '@/hooks/usePreferences';
import RefreshButton from './components/refresh_btn';

export default function Inventory() {
  const { user } = useAuthUser();
  const prefs = usePreferences(user?.id);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [inventory, setInventory] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [fetchedInv, setFetchedInv] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState(null);
  const [showDeleteConfirmationDialogue, setShowDeleteConfirmationDialogue] =
    useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [isEditingInventoryName, setIsEditingInventoryName] = useState(false);
  const [loadingNameChange, setLoadingNameChange] = useState(false);
  const [inventoryNameInput, setInventoryNameInput] = useState(
    inventory?.name || ''
  );

  const localStorageKey = user?.id ? `inventoryData_${user.id}` : null;

  const updateInventoryName = async (newName) => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }

    if (!inventory?.id || !user?.id) return;

    try {
      setLoadingNameChange(true);
      if (inventory.name == newName.trim()) return;
      const response = await fetch(`/api/inventory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inventory.id, name: newName.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update inventory name');

      const data = await response.json();
      setInventory(data.inventory);
      setInventoryNameInput(data.inventory.name);
      toast.success('Inventory name updated successfully!');

      // Update local storage
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
      console.error('Error updating inventory name:', error);
      setInventoryNameInput(inventory?.name);
      toast.error('Failed to update inventory name.');
    } finally {
      setIsEditingInventoryName(false);
      setLoadingNameChange(false);
    }
  };

  useEffect(() => {
    if (inventory?.name) {
      setInventoryNameInput(inventory.name);
    }
  }, [inventory]);

  const fetchInventory = async () => {
    if (!user) return;
    try {
      setLoadingInventory(true);
      const response = await fetch(`/api/inventory?adminId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch from server');
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
    setIsEditingInventoryName(false);
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

  const toggleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  useEffect(() => {
    setSortConfig({
      key: prefs.defaultSortOrder,
      direction: `${prefs.defaultSortOrder == 'createdAt' || prefs.defaultSortOrder == 'updatedAt' ? 'desc' : 'asc'}`,
    });
  }, [prefs]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <HiOutlineSwitchVertical size={14} className="inline ml-1" />;
    return sortConfig.direction === 'asc' ? (
      <FiArrowUp size={14} className="inline ml-1" />
    ) : (
      <FiArrowDown size={14} className="inline ml-1" />
    );
  };

  const [editForm, setEditForm] = useState({
    name: '',
    categoryId: '',
    purchasePrice: '',
    salePrice: '',
    govtSalePrice: '',
    unit: '',
    tags: '',
  });

  const handleEdit = (product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      categoryId: product.categoryId.toString(),
      purchasePrice: product.purchasePrice.toString(),
      salePrice: product.salePrice.toString(),
      govtSalePrice: product.govtSalePrice?.toString() || '',
      unit: product.unit || '',
      tags: product.tags || '',
    });
  };

  const sortedProducts = [...products]
    .filter((product) => {
      const category =
        categories.find((cat) => cat.id === product.categoryId)?.name || '';
      return (
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  useEffect(() => {
    if (editProduct || showDeleteConfirmationDialogue || selectedProduct) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [editProduct, showDeleteConfirmationDialogue, selectedProduct]);

  function prodViewClick(product) {
    setSelectedProduct(product);
  }

  useEffect(() => {
    if (selectedProduct) {
      const updated = products.find((p) => p.id === selectedProduct.id);
      if (updated) {
        setSelectedProduct(updated);
      }
    }
  }, [products]);

  return (
    <div className="flex w-full flex-col items-center justify-center ">
      <Header />
      <ScrollToTop />
      <div className="w-full max-w-7xl place-self-center">
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-[68px] bg-white z-40">
          <div className="w-full flex justify-center md:justify-start">
            {loadingInventory || !inventory ? (
              <div className="h-7 bg-gray-200 rounded w-52 place-self-center md:place-self-auto animate-pulse"></div>
            ) : isEditingInventoryName && prefs.renamingInventory ? (
              <div className="flex items-center gap-2 w-full max-w-md text-sm">
                <input
                  type="text"
                  value={inventoryNameInput}
                  onChange={(e) => setInventoryNameInput(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm outline-none focus:border-green-300"
                  autoFocus
                />
                <button
                  disabled={
                    loadingNameChange || loadingData || loadingInventory
                  }
                  onClick={() => updateInventoryName(inventoryNameInput)}
                  className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold px-3 py-2 rounded-md border border-green-300 transition"
                >
                  {loadingNameChange ? (
                    <div className="border-2 border-green-800 border-t-transparent animate-spin rounded-full w-4 h-4 mx-auto" />
                  ) : (
                    'Save'
                  )}
                </button>
                <button
                  disabled={
                    loadingNameChange || loadingData || loadingInventory
                  }
                  onClick={() => {
                    setIsEditingInventoryName(false);
                    setInventoryNameInput(inventory.name);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3 py-2 rounded-md border border-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2
                  disabled={
                    loadingNameChange || loadingData || loadingInventory
                  }
                  className="text-lg line-clamp-1 md:text-xl font-bold text-gray-800 text-center md:text-left cursor-pointer"
                  onClick={() => setIsEditingInventoryName(true)}
                >
                  {inventory?.name}
                </h2>
                {inventory?.name == 'Get Started' && (
                  <button
                    onClick={() => setIsEditingInventoryName(true)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                    disabled={
                      loadingNameChange || loadingData || loadingInventory
                    }
                  >
                    <MdEdit size={18} /> (Click to edit)
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex w-full items-stretch justify-end gap-3 bg-white">
            <div className="relative w-full text-gray-500 md:max-w-80">
              <input
                type="text"
                placeholder="Search by name, category, or tag..."
                className="border border-gray-200 rounded-lg px-3 py-2 pr-7 w-full text-sm outline-none focus:border-green-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <div
                  className="absolute inset-y-0 right-0 h-full p-2 flex items-center cursor-pointer "
                  onClick={() => setSearchQuery('')}
                >
                  <MdClose />
                </div>
              )}
            </div>
            <RefreshButton
              failedtoRefresh={refreshFailed}
              loading={loadingInventory || refreshing}
              onClick={RefreshData}
            />
          </div>
        </div>
        <div className="bg-white  md:p-6">
          <div className="overflow-x-auto md:rounded-xl shadow-md border border-gray-200 ">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-3 md:px-6 md:py-4 text-center">#</th>
                  <th
                    className=" px-3 py-3 min-w-[170px] md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort('name')}
                  >
                    Name {renderSortIcon('name')}
                  </th>
                  <th
                    className="px-3 py-3 min-w-[110px] md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort('salePrice')}
                  >
                    S. Price {renderSortIcon('salePrice')}
                  </th>
                  {prefs.viewPurchasePriceColumn && (
                    <th
                      className="px-3 py-3 min-w-[110px] md:px-6 md:py-4 cursor-pointer"
                      onClick={() => toggleSort('purchasePrice')}
                    >
                      P. Price {renderSortIcon('purchasePrice')}
                    </th>
                  )}
                  {prefs.viewCategoryColumn && (
                    <th
                      className=" px-3 py-3 min-w-[130px] md:px-6 md:py-4 cursor-pointer"
                      onClick={() => toggleSort('categoryId')}
                    >
                      Category {renderSortIcon('categoryId')}
                    </th>
                  )}
                  {prefs.viewDateUpdatedColumn && (
                    <th
                      className="px-3 py-3 min-w-[160px] md:px-6 md:py-4 cursor-pointer"
                      onClick={() => toggleSort('updatedAt')}
                    >
                      Date Updated {renderSortIcon('updatedAt')}
                    </th>
                  )}
                  {prefs.viewDateAddedColumn && (
                    <th
                      className="px-3 py-3 min-w-[140px] md:px-6 md:py-4 cursor-pointer"
                      onClick={() => toggleSort('createdAt')}
                    >
                      Date Added {renderSortIcon('createdAt')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {loadingData || loadingInventory || !inventory ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <InvLoader key={index} prefs={prefs} />
                  ))
                ) : sortedProducts.length > 0 && user ? (
                  sortedProducts.map((product, index) => {
                    const category = categories.find(
                      (cat) => cat.id === product.categoryId
                    );
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition cursor-pointer "
                        onClick={() => prodViewClick(product)}
                      >
                        <td className="px-3 py-2 md:px-6 md:py-4 text-gray-500 text-center">
                          {index + 1}
                        </td>
                        <td className="px-3 min-w-[170px] max-w-[280px] py-2 md:px-6 md:py-4 font-medium cursor-pointer">
                          {product.name + ' - 1 ' + product.unit}
                        </td>
                        <td className="px-3  min-w-[110px] py-2 md:px-6 md:py-4">
                          Rs.{product.salePrice}
                        </td>
                        {prefs.viewPurchasePriceColumn && (
                          <td className="px-3 min-w-[110px] py-2 md:px-6 md:py-4">
                            Rs.{product.purchasePrice}
                          </td>
                        )}
                        {prefs.viewCategoryColumn && (
                          <td className="px-3 py-2 min-w-[130px] max-w-[180px] md:px-6 md:py-4">
                            {category?.name || '—'}
                          </td>
                        )}
                        {prefs.viewDateUpdatedColumn && (
                          <td className="px-3 py-2 min-w-[160px] md:px-6 md:py-4">
                            {new Date(product.updatedAt).toLocaleDateString()}
                          </td>
                        )}
                        {prefs.viewDateAddedColumn && (
                          <td className="px-3 py-2 min-w-[140px] md:px-6 md:py-4">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 py-8">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <ViewProduct
          prefs={prefs}
          selectedProduct={selectedProduct}
          categories={categories}
          close={() => setSelectedProduct(null)}
          editClick={() => handleEdit(selectedProduct)}
          deleteClick={() => {
            setSelectedProductForDelete(selectedProduct);
            setShowDeleteConfirmationDialogue(true);
          }}
        />
        {/* edit product */}
        <EditProduct
          editProduct={editProduct}
          close={() => setEditProduct(null)}
          editForm={editForm}
          fetchNewData={fetchAndStoreData}
          categories={categories}
          inventoryId={inventory?.id}
          setEditForm={setEditForm}
        />
        {/* delete product */}
        <DeleteProduct
          inventoryId={inventory?.id}
          selectedProductForDelete={selectedProductForDelete}
          cancel={() => {
            setSelectedProductForDelete(null);
            setShowDeleteConfirmationDialogue(false);
          }}
          close={() => {
            setSelectedProductForDelete(null);
            setSelectedProduct(null);
            setShowDeleteConfirmationDialogue(false);
          }}
          showDialogue={showDeleteConfirmationDialogue}
          fetchNewData={fetchAndStoreData}
        />
      </div>
    </div>
  );
}
