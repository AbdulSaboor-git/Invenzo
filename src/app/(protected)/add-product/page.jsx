'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { toast } from 'sonner';
import useAuthUser from '@/hooks/authUser';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Footer from '@/components/footer';

export default function AddProductPage() {
  // const { user, logout } = useAuthUser();
  const { user } = useSelector((state) => state.user);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [govtSalePrice, setGovtSalePrice] = useState('');
  const [unit, setUnit] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [inventory, setInventory] = useState(null);
  const [fetchedInv, setFetchedInv] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const localStorageKey = user?.id ? `inventoryData_${user.id}` : null;

  const fetchInventory = async () => {
    if (!user) return;
    try {
      setLoadingInventory(true);
      const response = await fetch(`/api/inventory?adminId=${user?.adminId}`);
      if (!response.ok) throw new Error('Failed to fetch from server');
      const data = await response.json();
      setInventory(data.inventory);
    } catch (error) {
      console.error('Error fetching inventories:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  const fetchCategories = async () => {
    if (!user?.id || inventory === null || loadingInventory) {
      return;
    }
    try {
      setLoadingCategories(true);
      const res = await fetch(
        `/api/inventory/${inventory.id}?userId=${user?.id}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Unknown error');
      }
      const data = await res.json();
      setCategories(data.categories);
      setProducts(data.products);

      // Update localStorage
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(localStorageKey);
        const parsed = local ? JSON.parse(local) : {};
        localStorage.setItem(
          localStorageKey,
          JSON.stringify({
            ...parsed,
            products: data.products,
            categories: data.categories,
            inventory: inventory,
          })
        );
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || 'Failed to fetch categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load categories and inv from localStorage

  const loadFromLocalStorage = () => {
    try {
      if (typeof window !== 'undefined') {
        const localData = localStorage.getItem(localStorageKey);
        const parsed = JSON.parse(localData);
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
        setProducts(parsed.products);
        setInventory(parsed.inventory);
        return true;
      }
    } catch (err) {
      console.error('Invalid localStorage data:', err);
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
      setLoadingCategories(false);
    }
  }, [user]);

  useEffect(() => {
    if (inventory && !loadingInventory && fetchedInv) fetchCategories();
  }, [inventory, loadingInventory, fetchedInv]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }

    if (!name || !purchasePrice || !salePrice || !categoryId) {
      return toast.error('Please fill all required fields');
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/inventory/${inventory.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          tags: tags.trim(),
          purchasePrice: parseFloat(purchasePrice),
          salePrice: parseFloat(salePrice),
          govtSalePrice: govtSalePrice ? parseFloat(govtSalePrice) : null,
          unit: unit,
          categoryId: parseInt(categoryId),
        }),
      });

      if (!res.ok) throw new Error('Failed to add product');

      toast.success('Product added successfully');
      setLoading(false);
      fetchCategories();

      // Reset fields
      setName('');
      setDescription('');
      setTags('');
      setPurchasePrice('');
      setSalePrice('');
      setGovtSalePrice('');
      setCategoryId('');
      setUnit('');

      // Refetch products from DB
      try {
        setSyncing(true);
        const productRes = await fetch(
          `/api/inventory/${inventory.id}?userId=${user.id}`
        );
        if (!productRes.ok) {
          throw new Error('Failed to refresh product list');
        }
        const { products, categories } = await productRes.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            localStorageKey,
            JSON.stringify({ products, categories, inventory })
          );
        }
      } catch (error) {
        console.log('Error syncing data:', error);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('Error adding product');
    } finally {
      setSyncing(false);
    }
  };

  if (user?.role === 'superadmin' || user?.role === 'cashier') {
    return <NotFound />;
  }

  // Handlers
  const handleNameChange = (value) => setName(value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleTagsChange = (e) => setTags(e.target.value.slice(0, 200));
  const handleCategoryChange = (e) => setCategoryId(e.target.value);
  const handlePurchasePriceChange = (e) => {
    const value = e.target.value;
    setPurchasePrice(value);
    updateSalePrice(value);
  };
  const updateSalePrice = (PP) => {
    let newValue =
      Math.round((parseFloat(PP) + parseFloat(PP) * 0.07) / 10) * 10;
    setSalePrice(newValue);
  };
  const handleSalePriceChange = (e) => setSalePrice(e.target.value);
  const handleGovtSalePriceChange = (e) => setGovtSalePrice(e.target.value);

  const filteredSuggestions = products
    .filter((p) => p.name.toLowerCase().includes(name.toLowerCase()))
    .slice(0, 12);

  const handleSelect = (selectedProd) => {
    setName(selectedProd.name);
    setCategoryId(selectedProd.categoryId);
    setPurchasePrice(selectedProd.purchasePrice);
    setSalePrice(selectedProd.salePrice);
    setGovtSalePrice(
      selectedProd.govtSalePrice ? selectedProd.govtSalePrice : ''
    );
    setTags(selectedProd.tags ? selectedProd.tags : '');
    setUnit(selectedProd.unit);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSelect(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.relative')) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen w-full md:bg-gray-100">
      <Header />
      <div className="w-full flex  justify-center md:justify-start shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-16 bg-white z-40">
        {loadingInventory || !inventory ? (
          <div className="h-7 bg-gray-200 rounded w-52 place-self-center md:place-self-auto animate-pulse"></div>
        ) : (
          <h2 className="text-lg md:text-xl font-bold w-full text-gray-800 text-center md:text-left">
            {inventory?.name}
          </h2>
        )}
      </div>
      <div className="w-full place-self-center max-w-2xl px-8 py-10 md:px-12 md:py-16 bg-white md:shadow-lg md:mt-6 md:rounded-xl">
        <h1 className="text-xl md:text-3xl font-semibold text-gray-800 mb-8 text-center">
          Add New Product
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-3 text-sm md:text-base"
        >
          {/* Product Name with Suggestions */}
          <div className="relative">
            <label className="block mb-1 font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setShowSuggestions(true);
                handleNameChange(e.target.value);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              required
              maxLength={40}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((prod, idx) => (
                  <li
                    key={prod.id}
                    onClick={() => handleSelect(prod)}
                    className={`px-4 py-2 cursor-pointer ${
                      idx === highlightedIndex
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {prod.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Purchase Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={purchasePrice}
              onChange={handlePurchasePriceChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Sale Price */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Sale Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={salePrice}
              onChange={handleSalePriceChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Govt Sale Price */}
          <div className="">
            <label className="block mb-1 font-medium text-gray-700">
              Govt. Sale Price
            </label>
            <input
              type="number"
              min="0"
              value={govtSalePrice}
              onChange={handleGovtSalePriceChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Unit <span className="text-red-500">*</span>
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">Select unit</option>
              <option value="g">Gram (g)</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="ml">Milliliter (ml)</option>
              <option value="liter">Liter (l)</option>
              <option value="pc">Piece (pc)</option>
              <option value="dozen">Dozen</option>
              <option value="pack">Pack</option>
              <option value="box">Box</option>
            </select>
          </div>

          {/* Tags */}
          <div className="pb-6">
            <label className="block mb-1 font-medium text-gray-700">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={handleTagsChange}
              maxLength={200}
              placeholder="Tags (space-separated)"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading || syncing || loadingInventory || loadingCategories
            }
            className="w-full text-base bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 disabled:hover:bg-green-600 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="border-2 border-gray-200 border-t-transparent animate-spin rounded-full w-6 h-6 mx-auto" />
            ) : (
              'Add Product'
            )}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
