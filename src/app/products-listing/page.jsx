"use client";
import React, { useEffect, useState } from "react";
import Header2 from "../../components/header2";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { MdDelete, MdEdit, MdSync, MdVisibility } from "react-icons/md";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { toast } from "sonner";

export default function ProductsListing() {
  const userId = 6;
  const invId = 52;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [invInfo, set_invInfo] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const localStorageKey = `inventoryData_${invId}`;

  const fetchAndStoreData = async () => {
    try {
      setRefreshFailed(false);
      setLoadingData(true);
      setRefreshing(true);
      const response = await fetch(`/api/inventory/${invId}?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch from server");

      const data = await response.json();
      const { products, categories, inv } = data;

      const toStore = { products, categories, inv };
      localStorage.setItem(localStorageKey, JSON.stringify(toStore));

      setProducts(products);
      setCategories(categories);
      set_invInfo(inv);
      toast.success("Data refreshed.");
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to refresh. Showing cached data.");
      setRefreshFailed(true);
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const cached = localStorage.getItem(localStorageKey);
      if (!cached) return false;

      const parsed = JSON.parse(cached);
      if (
        !parsed ||
        !Array.isArray(parsed.products) ||
        !Array.isArray(parsed.categories) ||
        typeof parsed.inv !== "object"
      ) {
        return false;
      }

      setProducts(parsed.products);
      setCategories(parsed.categories);
      set_invInfo(parsed.inv);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const hasLocal = loadFromLocalStorage();
    if (!hasLocal) {
      fetchAndStoreData();
    } else {
      setLoadingData(false);
    }
  }, []);

  const toggleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <HiOutlineSwitchVertical size={14} className="inline ml-1" />;
    return sortConfig.direction === "asc" ? (
      <FiArrowUp size={14} className="inline ml-1" />
    ) : (
      <FiArrowDown size={14} className="inline ml-1" />
    );
  };

  const sortedProducts = [...products]
    .filter((product) => {
      const category =
        categories.find((cat) => cat.id === product.categoryId)?.name || "";
      return (
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="flex w-full flex-col items-center justify-center ">
      <Header2 />

      <div className="w-full max-w-7xl place-self-center">
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-6 py-4 gap-3 sticky top-2 md:top-12 bg-white">
          <div className="w-full ">
            {loadingData ? (
              <div className="h-7 bg-gray-200 rounded w-52 place-self-center md:place-self-auto animate-pulse"></div>
            ) : (
              <h2 className="text-lg md:text-xl font-bold w-full text-gray-800 text-center md:text-left">
                {invInfo.name}
              </h2>
            )}
          </div>
          <div className="flex w-full items-stretch justify-end gap-4">
            <input
              type="text"
              placeholder="Search by name, category, or tag..."
              className="border border-gray-200 rounded-lg px-3 py-2 w-full md:max-w-80 text-sm outline-none focus:border-green-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={fetchAndStoreData}
              className={`flex gap-2 items-center justify-center text-sm font-semibold px-3 py-1.5 rounded-md border transition-all duration-300 ${
                refreshFailed
                  ? "bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
                  : "bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
              }`}
            >
              <span className="hidden md:inline">Refresh</span>
              <MdSync className={`${refreshing && "animate-spin"}`} />
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6">
          <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200 ">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => toggleSort("name")}
                  >
                    Name {renderSortIcon("name")}
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => toggleSort("categoryId")}
                  >
                    Category {renderSortIcon("categoryId")}
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => toggleSort("purchasePrice")}
                  >
                    Purchase Price {renderSortIcon("purchasePrice")}
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => toggleSort("salePrice")}
                  >
                    Sale Price {renderSortIcon("salePrice")}
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => toggleSort("govtSalePrice")}
                  >
                    Govt. Sale Price {renderSortIcon("govtSalePrice")}
                  </th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {loadingData ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-4" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </td>
                    </tr>
                  ))
                ) : sortedProducts.length > 0 ? (
                  sortedProducts.map((product, index) => {
                    const category = categories.find(
                      (cat) => cat.id === product.categoryId
                    );
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 font-medium">
                          {product.name}
                        </td>
                        <td className="px-6 py-4">{category?.name || "—"}</td>
                        <td className="px-6 py-4">
                          Rs.{product.purchasePrice}
                        </td>
                        <td className="px-6 py-4">Rs.{product.salePrice}</td>
                        <td className="px-6 py-4">
                          {product.govtSalePrice != null
                            ? `Rs.${product.govtSalePrice}`
                            : "—"}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-6">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            title="View"
                          >
                            <MdVisibility className="text-gray-500" size={16} />
                          </button>
                          <button title="Edit" className="text-green-500">
                            <MdEdit size={16} />
                          </button>
                          <button title="Delete" className="text-red-500">
                            <MdDelete size={16} />
                          </button>
                        </td>
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

          {selectedProduct && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-6"
              onClick={() => setSelectedProduct(null)}
            >
              <div
                className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedProduct(null)}
                >
                  ✕
                </button>
                <h3 className="text-lg font-bold mb-4">Product Details</h3>
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Name:</strong> {selectedProduct.name}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {selectedProduct.description || "—"}
                  </p>
                  <p>
                    <strong>Category:</strong>{" "}
                    {categories.find(
                      (cat) => cat.id === selectedProduct.categoryId
                    )?.name || "—"}
                  </p>
                  <p>
                    <strong>Purchase Price:</strong> Rs.
                    {selectedProduct.purchasePrice.toFixed(2)}
                  </p>
                  <p>
                    <strong>Sale Price:</strong> Rs.
                    {selectedProduct.salePrice.toFixed(2)}
                  </p>
                  <p>
                    <strong>Govt. Sale Price:</strong>{" "}
                    {selectedProduct.govtSalePrice != null
                      ? `Rs.${selectedProduct.govtSalePrice.toFixed(2)}`
                      : "—"}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(selectedProduct.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Updated At:</strong>{" "}
                    {new Date(selectedProduct.updatedAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Tags:</strong> {selectedProduct.tags || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
