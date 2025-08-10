"use client";
import React, { useEffect, useState } from "react";
import { HiOutlineSwitchVertical } from "react-icons/hi";

import { IoSync } from "react-icons/io5";
import { MdClose, MdDelete, MdEdit, MdVisibility } from "react-icons/md";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { toast } from "sonner";
import ScrollToTop from "@/components/scroll_to_top";
import useAuthUser from "@/hooks/authUser";
import InvLoader from "./components/inv_loader";
import ViewProduct from "./components/view_product";
import EditProduct from "./components/edit_product";
import DeleteProduct from "./components/delete_product";
import Header from "@/components/header";

export default function Inventory() {
  const { user } = useAuthUser();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [inventory, setInventory] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [fetchedInv, setFetchedInv] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState(null);
  const [showDeleteConfirmationDialogue, setShowDeleteConfirmationDialogue] =
    useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  const localStorageKey = user?.id ? `inventoryData_${user.id}` : null;

  const fetchInventory = async () => {
    if (!user) return;
    try {
      setLoadingInventory(true);
      const response = await fetch(`/api/inventory?adminId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch from server");
      const data = await response.json();
      setInventory(data.inventory);
      console.log(data.inventory);
    } catch (error) {
      console.error("Error fetching inventories:", error);
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
      if (!response.ok) throw new Error("Failed to fetch from server");

      const data = await response.json();
      const { products, categories } = data;

      if (typeof window !== "undefined") {
        localStorage.setItem(
          localStorageKey,
          JSON.stringify({ products, categories, inventory })
        );
      }
      setProducts(products);
      setCategories(categories);
    } catch (err) {
      setRefreshFailed(true);
      console.error("Fetch error:", err);
      toast.error("Failed to refresh. Showing cached data.");
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  const RefreshData = async () => {
    if (!navigator.onLine) {
      toast.error(
        "Network not available. Please check your internet connection."
      );
      return;
    }

    const loadingToastId = toast.loading("Refreshing...");

    try {
      await fetchAndStoreData();
      toast.success("Data refreshed!", { id: loadingToastId });
    } catch (error) {
      toast.error("Failed to refresh data.", { id: loadingToastId });
    }
  };

  const loadFromLocalStorage = () => {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(localStorageKey);
        if (!cached) {
          return false;
        }

        const parsed = JSON.parse(cached);
        if (
          !parsed ||
          !Array.isArray(parsed.products) ||
          !Array.isArray(parsed.categories) ||
          typeof parsed.inventory !== "object" ||
          parsed.inventory == null
        ) {
          if (parsed.inventory == null) {
            console.log(parsed.inventory);
          } else if (typeof parsed.inventory !== "object")
            console.log("inv not obj");
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

  const [editForm, setEditForm] = useState({
    name: "",
    categoryId: "",
    purchasePrice: "",
    salePrice: "",
    govtSalePrice: "",
    tags: "",
  });

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

  useEffect(() => {
    if (editProduct || showDeleteConfirmationDialogue || selectedProduct) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
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
        <div className="flex flex-col md:flex-row md:justify-between items-center shadow px-3 md:px-6 py-4 gap-3 sticky top-3 md:top-16 bg-white z-40">
          <div className="w-full flex  justify-center md:justify-start ">
            {loadingInventory || !inventory ? (
              <div className="h-7 bg-gray-200 rounded w-52 place-self-center md:place-self-auto animate-pulse"></div>
            ) : (
              <h2 className="text-lg md:text-xl font-bold w-full text-gray-800 text-center md:text-left">
                {inventory?.name}
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
              onClick={RefreshData}
              disabled={refreshing || loadingInventory}
              className={`flex gap-2 items-center justify-center text-sm font-semibold px-3 py-1.5 rounded-md border transition-all duration-300 disabled:cursor-not-allowed disabled:bg-green-200  disabled:shadow-none ${
                refreshFailed
                  ? "bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
                  : "bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
              }`}
            >
              <span className="hidden md:inline">Refresh</span>
              <IoSync className={` ${refreshing && "animate-spin "} `} />
            </button>
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
                    onClick={() => toggleSort("name")}
                  >
                    Name {renderSortIcon("name")}
                  </th>
                  <th
                    className="px-3 py-3 min-w-[110px] md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort("salePrice")}
                  >
                    S. Price {renderSortIcon("salePrice")}
                  </th>
                  <th
                    className="px-3 py-3 min-w-[110px] md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort("purchasePrice")}
                  >
                    P. Price {renderSortIcon("purchasePrice")}
                  </th>
                  <th
                    className=" px-3 py-3 min-w-[130px] md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort("categoryId")}
                  >
                    Category {renderSortIcon("categoryId")}
                  </th>
                  <th
                    className="px-3 py-3 min-w-[140px] md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort("updatedAt")}
                  >
                    Updated At {renderSortIcon("updatedAt")}
                  </th>
                  <th
                    className="px-3 py-3 min-w-[140px] md:px-6 md:py-4 cursor-pointer"
                    onClick={() => toggleSort("createdAt")}
                  >
                    Created At {renderSortIcon("createdAt")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {loadingData || loadingInventory || !inventory ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <InvLoader key={index} />
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
                          {new Date(product.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 min-w-[140px] md:px-6 md:py-4">
                          {new Date(product.createdAt).toLocaleDateString()}
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
        </div>
        <ViewProduct
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
          inventory={inventory}
          setEditForm={setEditForm}
        />
        {/* delete product */}
        <DeleteProduct
          inventory={inventory}
          selectedProductForDelete={selectedProductForDelete}
          close={() => {
            setSelectedProductForDelete(null);
            setShowDeleteConfirmationDialogue(false);
          }}
          showDialogue={showDeleteConfirmationDialogue}
          fetchNewData={fetchAndStoreData}
        />
      </div>
    </div>
  );
}
