"use client";
import React, { useEffect, useState } from "react";
import Header2 from "../../components/header2";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import {
  MdClose,
  MdDelete,
  MdEdit,
  MdSync,
  MdVisibility,
} from "react-icons/md";
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
  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    categoryId: "",
    purchasePrice: "",
    salePrice: "",
    govtSalePrice: "",
    tags: "",
  });

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

      localStorage.setItem(
        localStorageKey,
        JSON.stringify({ products, categories, inv })
      );
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

  const handleEdit = (product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      categoryId: product.categoryId.toString(),
      purchasePrice: product.purchasePrice.toString(),
      salePrice: product.salePrice.toString(),
      govtSalePrice: product.govtSalePrice?.toString() || "",
      tags: product.tags || "",
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/inventory/${invId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editProduct.id,
          name: editForm.name.trim(),
          description: "",
          categoryId: parseInt(editForm.categoryId, 10),
          purchasePrice: parseFloat(editForm.purchasePrice),
          salePrice: parseFloat(editForm.salePrice),
          govtSalePrice: editForm.govtSalePrice
            ? parseFloat(editForm.govtSalePrice)
            : null,
          tags: editForm.tags.trim(),
        }),
      });

      if (!response.ok) throw new Error("Update failed");
      toast.success("Product updated");
      setEditProduct(null);
      await fetchAndStoreData();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const isSaveDisabled =
    !editForm.name.trim() ||
    !editForm.categoryId ||
    parseFloat(editForm.purchasePrice) < 0 ||
    parseFloat(editForm.salePrice) < 0 ||
    (editForm.govtSalePrice && parseFloat(editForm.govtSalePrice) < 0);

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

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/inventory/${invId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedProductForDelete.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete product");
      }

      toast.success("Product deleted successfully");
      setSelectedProductForDelete(null);
      setConfirmDelete(false);
      await fetchAndStoreData(); // refresh product list from DB
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Failed to delete product");
    }
  };

  useEffect(() => {
    if (editProduct || confirmDelete || selectedProduct) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Clean up just in case
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [editProduct, confirmDelete, selectedProduct]);

  return (
    <div className="flex w-full flex-col items-center justify-center ">
      <Header2 />
      <div className="w-full max-w-7xl place-self-center">
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-6 py-4 gap-3 sticky top-3 md:top-14 bg-white z-40">
          <div className="w-full ">
            {loadingData ? (
              <div className="h-7 bg-gray-200 rounded w-52 place-self-center md:place-self-auto animate-pulse"></div>
            ) : (
              <h2 className="text-lg md:text-xl font-bold w-full text-gray-800 text-center md:text-left">
                {invInfo.name}
              </h2>
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
                  onClick={() => setSearchQuery("")}
                >
                  <MdClose />
                </div>
              )}
            </div>
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
        <div className="bg-white rounded-xl px-4 py-6 md:px-6">
          <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200 ">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-3 md:px-6 md:py-4 text-center">#</th>
                  <th
                    className=" px-3 py-3 md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort("name")}
                  >
                    Name {renderSortIcon("name")}
                  </th>
                  <th
                    className="px-3 py-3 md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort("salePrice")}
                  >
                    S. Price {renderSortIcon("salePrice")}
                  </th>
                  <th
                    className="px-3 py-3 md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort("purchasePrice")}
                  >
                    P. Price {renderSortIcon("purchasePrice")}
                  </th>
                  <th
                    className=" px-3 py-3 md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort("categoryId")}
                  >
                    Category {renderSortIcon("categoryId")}
                  </th>
                  <th
                    className="px-3 py-3 md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort("govtSalePrice")}
                  >
                    Updated At {renderSortIcon("updatedAt")}
                  </th>
                  <th className="px-3 py-3 md:px-6 md:py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {loadingData ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index} className="animate-pulse ">
                      <td className="px-3 py-4 md:px-6 md:py-4">
                        <div className="h-4 bg-gray-200 rounded w-4" />
                      </td>
                      <td className="px-3 py-4 min-w-[150px] md:px-6 md:py-4">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </td>
                      <td className="px-3 py-4 min-w-[110px] md:px-6 md:py-4">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-3 py-4 md:px-6 min-w-[110px] md:py-4">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-3 py-4 min-w-[130px] md:px-6 md:py-4">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </td>
                      <td className="px-3 py-4 min-w-[140px] md:px-6 md:py-4">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </td>
                      <td className="px-3 py-4 md:px-6 md:py-4">
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
                        className="hover:bg-gray-50 transition "
                      >
                        <td className="px-3 py-2 md:px-6 md:py-4 text-gray-500 text-center">
                          {index + 1}
                        </td>
                        <td
                          className="px-3 min-w-[150px] max-w-[280px] py-2 md:px-6 md:py-4 font-medium cursor-pointer"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.name}
                        </td>
                        <td className="px-3  min-w-[110px] py-2 md:px-6 md:py-4">
                          Rs.{product.salePrice}
                        </td>
                        <td className="px-3 min-w-[110px] py-2 md:px-6 md:py-4">
                          Rs.{product.purchasePrice}
                        </td>
                        <td className="px-3 py-2 min-w-[130px] max-w-[180px] md:px-6 md:py-4">
                          {category?.name || "—"}
                        </td>
                        <td className="px-3 py-2 min-w-[140px] md:px-6 md:py-4">
                          {new Date(product.updatedAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 flex translate-y-1/2 -mt-1 md:translate-y-0 md:-mt-0 gap-4 md:gap-6">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            title="View"
                            className=""
                          >
                            <MdVisibility className="text-gray-500" size={16} />
                          </button>
                          <button
                            title="Edit"
                            className="text-green-500"
                            onClick={() => handleEdit(product)}
                          >
                            <MdEdit size={16} />
                          </button>
                          <button
                            title="Delete"
                            className="text-red-500"
                            onClick={() => {
                              setSelectedProductForDelete(product);
                              setConfirmDelete(true);
                            }}
                          >
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

          <div
            className={`fixed inset-0 text-sm  bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 sm:px-6 transition-all duration-300 ${
              selectedProduct
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setSelectedProduct(null)}
          >
            {selectedProduct && (
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
            )}
          </div>
        </div>
        {/* edit product */}
        <div
          className={`fixed inset-0 text-sm  bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 sm:px-6 transition-all duration-300 ${
            editProduct
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="bg-white max-h-[90%] hidden_scroll_bar overflow-auto rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg py-10 px-6 sm:py-12 sm:px-10  relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setEditProduct(null)}
              aria-label="Close edit form"
            >
              ✕
            </button>

            <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
              Edit Product
            </h3>

            <div className="space-y-2">
              {/* Name */}
              <div className="flex items-center gap-2 w-full justify-between">
                <label
                  htmlFor="edit-name"
                  className="block  font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px] sm:max-w-[350px]"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>

              {/* Category */}
              <div className="flex items-center gap-2 w-full justify-between">
                <label
                  htmlFor="edit-category"
                  className="block  font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="edit-category"
                  className="w-full mt-1 px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px] sm:max-w-[350px]"
                  value={editForm.categoryId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, categoryId: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase Price */}
              <div className="flex items-center gap-2 w-full justify-between">
                <label
                  htmlFor="edit-purchase-price"
                  className="block  font-medium text-gray-700"
                >
                  P. Price
                </label>
                <input
                  id="edit-purchase-price"
                  type="number"
                  min={0}
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px] sm:max-w-[350px]"
                  value={editForm.purchasePrice}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      purchasePrice: e.target.value,
                    })
                  }
                />
              </div>

              {/* Sale Price */}
              <div className="flex items-center gap-2 w-full justify-between">
                <label
                  htmlFor="edit-sale-price"
                  className="block  font-medium text-gray-700"
                >
                  S. Price
                </label>
                <input
                  id="edit-sale-price"
                  type="number"
                  min={0}
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px] sm:max-w-[350px]"
                  value={editForm.salePrice}
                  onChange={(e) =>
                    setEditForm({ ...editForm, salePrice: e.target.value })
                  }
                />
              </div>

              {/* Govt. Sale Price */}
              <div className="flex items-center gap-2 w-full justify-between">
                <label
                  htmlFor="edit-govt-sale-price"
                  className="block  font-medium text-gray-700"
                >
                  G. S. Price
                </label>
                <input
                  id="edit-govt-sale-price"
                  type="number"
                  min={0}
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300  max-w-[200px] sm:max-w-[350px]"
                  value={editForm.govtSalePrice}
                  placeholder="Govt. Sale Price"
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      govtSalePrice: e.target.value,
                    })
                  }
                />
              </div>

              {/* Tags */}
              <div className="flex pb-6 sm:pb-8 items-center justify-between gap-2 w-full">
                <label
                  htmlFor="edit-tags"
                  className="block  font-medium text-gray-700"
                >
                  Tags
                </label>
                <input
                  id="edit-tags"
                  type="text"
                  maxLength={200}
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px] sm:max-w-[350px] "
                  value={editForm.tags}
                  placeholder="space-separated"
                  onChange={(e) =>
                    setEditForm({ ...editForm, tags: e.target.value })
                  }
                />
              </div>

              {/* Save Button */}
              <button
                disabled={isSaveDisabled}
                onClick={handleUpdate}
                className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
                  isSaveDisabled
                    ? "bg-green-500 cursor-not-allowed bg-opacity-50"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        <div
          className={`fixed inset-0 text-sm  bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 sm:px-6 transition-all duration-300 ${
            confirmDelete
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold text-red-700 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {selectedProductForDelete?.name}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
