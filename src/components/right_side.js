"use client";
import React, { useState, useEffect, useCallback } from "react";
import { MdArrowDownward, MdArrowUpward, MdClose } from "react-icons/md";
import { FaFilter, FaSort } from "react-icons/fa";
import Product_card from "./product_card";

export default function RightSide({ products, user }) {
  const [searchValue, setSearchValue] = useState("");
  const [sortCard_isOpen, setSortCard_isOpen] = useState(false);
  const [sortedProducts, setSortedProducts] = useState(products);

  const sortProducts = useCallback(
    (key, order) => {
      const sorted = [...products].sort((a, b) => {
        if (key === "sale_price") {
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
        sortCard_isOpen &&
        !event.target.closest(".sortCard") &&
        !event.target.closest("#sort_btn")
      ) {
        closeSortCard();
      }
    };

    document.body.addEventListener("click", handleClickOutside);

    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, [sortCard_isOpen]);

  const toggleSortCard = () => {
    setSortCard_isOpen((prev) => !prev);
  };

  const closeSortCard = () => {
    setSortCard_isOpen(false);
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
      <div className="flex gap-3 pb-4 items-center text-[#404040] px-2 relative">
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
        <FaFilter className="cursor-pointer text-[25px] text-teal-800" />
        <FaSort
          onClick={toggleSortCard}
          id="sort_btn"
          className="cursor-pointer text-[25px] text-teal-800 "
        />
        {sortCard_isOpen && (
          <div className="absolute top-10 right-5 text-sm text-gray-600 w-auto bg-white shadow-md shadow-[#00000052] rounded-xl sortCard z-30">
            <div
              onClick={() => sortProducts("name", "asc")}
              className="flex items-center justify-center gap-3 p-2 px-8 hover:bg-[#dbeded] rounded-xl"
            >
              Name
              <MdArrowUpward />
            </div>
            <div
              onClick={() => sortProducts("name", "desc")}
              className="flex items-center justify-center gap-3 p-2 hover:bg-[#dbeded] rounded-xl"
            >
              Name
              <MdArrowDownward />
            </div>
            <div
              onClick={() => sortProducts("sale_price", "asc")}
              className="flex items-center justify-center gap-3 p-2 hover:bg-[#dbeded] rounded-xl"
            >
              Price
              <MdArrowUpward />
            </div>
            <div
              onClick={() => sortProducts("sale_price", "desc")}
              className="flex items-center justify-center gap-3 p-2 hover:bg-[#dbeded] rounded-xl"
            >
              Price
              <MdArrowDownward />
            </div>
            <div
              onClick={() => sortProducts("date_added", "desc")}
              className="flex items-center justify-center gap-3 p-2 hover:bg-[#dbeded] rounded-xl"
            >
              Last Added
            </div>
            <div
              onClick={() => sortProducts("date_updated", "desc")}
              className="flex items-center justify-center gap-3 p-2 hover:bg-[#dbeded] rounded-xl"
            >
              Last Updated
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 w-full pb-1 px-2 md:max-h-[80vh] md:overflow-auto hidden_scroll_bar">
        {sortedProducts
          .filter((prod) => {
            const searchTerm = searchValue.toLowerCase().trim();
            return (
              prod.name.toLowerCase().includes(searchTerm) ||
              prod.category.toLowerCase().includes(searchTerm) ||
              prod.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
            );
          })
          .map((prod) => (
            <Product_card
              key={prod.id}
              prod={prod}
              isExpanded={expandedProductId === prod.id}
              toggleProductDetails={toggleProductDetails}
              user={user}
            />
          ))}
      </div>
    </div>
  );
}
