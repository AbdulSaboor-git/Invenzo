"use client";
import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { FaFilter, FaSort } from "react-icons/fa";
import Product_card from "./product_card";

export default function RightSide({ products }) {
  const [searchValue, setSearchValue] = useState("");

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
      <div className="flex gap-3 pb-4 items-center text-[#404040] px-2">
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
        <FaFilter className="cursor-pointer text-[25px] text-[#016c6c]" />
        <FaSort className="cursor-pointer text-[25px] text-[#016c6c]" />
      </div>
      <div className="flex flex-col gap-2 w-full pb-1 px-2 md:max-h-[80vh] md:overflow-auto hidden_scroll_bar">
        {products
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
            />
          ))}
      </div>
    </div>
  );
}
