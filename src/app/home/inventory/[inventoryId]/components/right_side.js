"use client";
import React, { useState, useEffect, useCallback } from "react";
import { MdClose } from "react-icons/md";
import { FaFilter, FaSort } from "react-icons/fa";
import Product_card from "./product_card";
import Sort_card from "./sortCard";
import Filter_card from "./filterCard";
import { useDispatch } from "react-redux";
import { triggerNotification } from "@/redux/notificationThunk";

export default function RightSide({
  inventoryId,
  role,
  openEditForm,
  handleDeleteClick,
  setProd,
  products,
  loadingData,
  categories,
  userId,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [sortCard_isOpen, setSortCard_isOpen] = useState(false);
  const [filterCard_isOpen, setFilterCard_isOpen] = useState(false);
  const [filterApplied, set_filterApplied] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [PRODUCTS, setPRODUCTS] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const Dispatch = useDispatch();

  const showMessage = (msg, state) => {
    Dispatch(
      triggerNotification({
        msg: msg,
        success: state,
      })
    );
  };

  useEffect(() => {
    setOriginalProducts(products);
    setPRODUCTS(products);
  }, [products]);

  const ApplyFilter = useCallback(() => {
    if (!products || products.length === 0) {
      setPRODUCTS([]);
      return;
    }

    if (
      minPrice === 0 &&
      maxPrice === (Infinity || "") &&
      filterCategoryId === ""
    ) {
      showMessage("No filter criteria entered", false);
      setPRODUCTS(originalProducts);
      return;
    }

    const filtered = originalProducts.filter((prod) => {
      return (
        (minPrice ? prod.salePrice >= minPrice : true) &&
        (maxPrice ? prod.salePrice <= maxPrice : true) &&
        (filterCategoryId ? prod.categoryId == filterCategoryId : true)
      );
    });

    setPRODUCTS(filtered);
    set_filterApplied(true);
    showMessage("Filters applied successfully", true);
    closeFilterCard();
  }, [originalProducts, filterCategoryId, minPrice, maxPrice, products]);

  const sortProducts = useCallback(
    (key, order) => {
      if (!products || products.length === 0) {
        setPRODUCTS([]);
        return;
      }
      const sorted = [...PRODUCTS].sort((a, b) => {
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
      setPRODUCTS(sorted);
    },
    [PRODUCTS, products]
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

  const clearFilter = () => {
    setMinPrice(0);
    setMaxPrice(Infinity);
    setFilterCategoryId("");
    setPRODUCTS(originalProducts);
    set_filterApplied(false);
    showMessage("Filters cleared successfully", true);
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
    console.log("filter:" + filterApplied);
    // if (!filterApplied) {
    //   setMinPrice(0);
    //   setMaxPrice(Infinity);
    //   setFilterCategoryId("");
    // }
    setFilterCard_isOpen(false);
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
      <div className="flex gap-3 md:gap-4 pb-4 items-center text-[#404040] px-0 md:px-2 relative">
        <div className="relative w-full">
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full h-10 md:h-11 rounded-full text-[12px] md:text-[14px] pl-4 pr-10"
            placeholder="Search..."
          />
          {searchValue && (
            <MdClose
              className="absolute right-0 rounded-e-full top-1/2 transform -translate-y-1/2  p-[11px] text-[40px] cursor-pointer  text-[#959595]"
              onClick={clearSearch}
            />
          )}
        </div>
        <div className="relative text-[22px] md:text-[25px] flex items-center justify-center gap-2 md:gap-3">
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
            applyFilter={ApplyFilter}
            clearFilter={clearFilter}
            filterApplied={filterApplied}
            setMaxPrice={setMaxPrice}
            setMinPrice={setMinPrice}
            setFilterCategoryId={setFilterCategoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            filterCategoryId={filterCategoryId}
          />
        )}
      </div>

      <div className="flex flex-col gap-[6px] w-full pb-1 px-0 md:px-2 md:max-h-[80vh] md:overflow-auto hidden_scroll_bar">
        {loadingData ? (
          <div className="text-gray-300 text-xs pl-2">
            <p>Loading...</p>
          </div>
        ) : !PRODUCTS?.length ? (
          <div className="text-gray-300 text-xs pl-2">
            <p>{"(Empty)"}</p>
          </div>
        ) : (
          PRODUCTS.filter((prod) => {
            const searchTerm = searchValue.toLowerCase().trim();
            return (
              prod.name.toLowerCase().includes(searchTerm) ||
              prod.category.name.toLowerCase().includes(searchTerm) ||
              prod.tags?.toLowerCase().includes(searchTerm)
            );
          }).map((prod) => (
            <Product_card
              key={prod.id}
              prod={prod}
              isExpanded={expandedProductId === prod.id}
              toggleProductDetails={toggleProductDetails}
              user={role}
              openEditForm={openEditForm}
              handleDeleteClick={handleDeleteClick}
              setProd={setProd}
              userId={userId}
            />
          ))
        )}
      </div>
    </div>
  );
}
