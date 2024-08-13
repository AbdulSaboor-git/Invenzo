"use client";
import React, { useState, useEffect, useCallback } from "react";
import { MdClose } from "react-icons/md";
import { FaFilter, FaSort } from "react-icons/fa";
import Product_card from "./product_card";
import Sort_card from "./sortCard";
import Filter_card from "./filterCard";
import { useDispatch } from "react-redux";
import { triggerNotification } from "@/redux/notificationThunk";
import Loader from "@/components/loader";
import { setProducts } from "@/redux/products";
import { setCategories } from "@/redux/categories";

export default function RightSide({ user, inventoryId, role }) {
  const [searchValue, setSearchValue] = useState("");
  const [sortCard_isOpen, setSortCard_isOpen] = useState(false);
  const [filterCard_isOpen, setFilterCard_isOpen] = useState(false);
  const [filterApplied, set_filterApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [products, setProducts_2] = useState([]);
  const [categories, setCategories_2] = useState([]);
  const invId = inventoryId;
  const Dispatch = useDispatch();

  useEffect(() => {
    const fetchInvData = async () => {
      if (user) {
        try {
          setLoadingData(true);
          const Response = await fetch(`/api/inventory/${invId}`);
          const InvData = await Response.json();
          setProducts_2(InvData.products);
          setCategories_2(InvData.categories);
        } catch (error) {
          console.error("Error fetching inventory data:", error);
        } finally {
          setLoadingData(false);
        }
      }
    };

    fetchInvData();
  }, [invId, user]);

  useEffect(() => {
    setSortedProducts(products);
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("categories", JSON.stringify(categories));
    Dispatch(setProducts(products));
    Dispatch(setCategories(categories));
  }, [products, categories, Dispatch]);

  const sortProducts = useCallback(
    (key, order) => {
      if (!products || products.length === 0) {
        setSortedProducts([]);
        return;
      }
      const sorted = [...products].sort((a, b) => {
        if (key === "salePrice") {
          return order === "asc"
            ? parseFloat(a[key]) - parseFloat(b[key])
            : parseFloat(b[key]) - parseFloat(a[key]);
        } else {
          return order === "asc"
            ? a[key].localeCompare(b[key])
            : b[key].localeCompare(a[key]);
        }
      });
      setSortedProducts(sorted);
    },
    [products]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (sortCard_isOpen && !event.target.closest(".sortCard")) ||
        (filterCard_isOpen && !event.target.closest(".filterCard"))
      ) {
        closeSortCard();
        closeFilterCard();
      }
    };

    document.body.addEventListener("click", handleClickOutside);

    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, [sortCard_isOpen, filterCard_isOpen]);

  const applyFilter = () => {
    set_filterApplied(true);
    Dispatch(
      triggerNotification({
        msg: "Filter Applied Successfully!",
        success: true,
      })
    );
    closeFilterCard();
  };

  const clearFilter = () => {
    set_filterApplied(false);
    Dispatch(
      triggerNotification({
        msg: "Filters Cleared Successfully!",
        success: true,
      })
    );
    closeFilterCard();
  };

  const toggleSortCard = () => {
    setSortCard_isOpen((prev) => !prev);
  };

  const closeSortCard = () => {
    setSortCard_isOpen(false);
  };
  const toggleFilterCard = () => {
    setFilterCard_isOpen((prev) => !prev);
  };

  const closeFilterCard = () => {
    setFilterCard_isOpen(false);
    event.stopPropagation();
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const clearSearch = () => {
    setSearchValue("");
  };

  const [expandedProductId, setExpandedProductId] = useState(null);

  const toggleProductDetails = (productId) => {
    setExpandedProductId((prevId) => (prevId === productId ? null : productId));
  };

  return (
    <div className="flex flex-col w-full z-0">
      {loading && <Loader />}
      <div className="flex gap-3 md:gap-4 pb-4 items-center text-[#404040] px-0 md:px-2 relative">
        <div className="relative w-full">
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full h-10 md:h-11 rounded-full text-sm md:text-base pl-4 pr-10"
            placeholder="Search..."
          />
          {searchValue && (
            <MdClose
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-[20px]"
              onClick={clearSearch}
            />
          )}
        </div>
        <div className="relative  text-[22px] md:text-[25px] flex items-center justify-center gap-2 md:gap-3">
          <FaFilter
            onClick={toggleFilterCard}
            className={`cursor-pointer ${
              filterApplied ? "text-red-500" : "text-teal-800"
            }`}
          />
          <FaSort
            onClick={toggleSortCard}
            className="cursor-pointer text-teal-800 "
          />
        </div>

        {sortCard_isOpen && <Sort_card sortProducts={sortProducts} />}
        {filterCard_isOpen && (
          <Filter_card
            categories={categories}
            applyFilter={applyFilter}
            clearFilter={clearFilter}
            filterApplied={filterApplied}
          />
        )}
      </div>

      <div className="flex flex-col gap-[6px]  w-full pb-1 px-0 md:px-2 md:max-h-[80vh] md:overflow-auto hidden_scroll_bar">
        {loadingData ? (
          <div className="text-gray-300 text-xs">
            <p>Loading...</p>
          </div>
        ) : !sortedProducts?.length ? (
          <div className="text-gray-300 text-xs">
            <p>{"(Empty)"}</p>
          </div>
        ) : (
          sortedProducts
            .filter((prod) => {
              const searchTerm = searchValue.toLowerCase().trim();
              return (
                prod.name.toLowerCase().includes(searchTerm) ||
                prod.category.name.toLowerCase().includes(searchTerm) ||
                prod.tags?.toLowerCase().includes(searchTerm)
              );
            })
            .map((prod) => (
              <Product_card
                key={prod.id}
                prod={prod}
                isExpanded={expandedProductId === prod.id}
                toggleProductDetails={toggleProductDetails}
                user={role}
              />
            ))
        )}
      </div>
    </div>
  );
}
