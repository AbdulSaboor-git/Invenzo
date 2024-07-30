"use client";
import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { FaFilter, FaSort } from "react-icons/fa";

export default function RightSide({ products }) {
  const [searchValue, setSearchValue] = useState("");
  const [expandedProductId, setExpandedProductId] = useState(null);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const clearSearch = () => {
    setSearchValue("");
  };

  const toggleProductDetails = (productId) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null); // Collapse if already expanded
    } else {
      setExpandedProductId(productId); // Expand the clicked product
    }
  };

  return (
    <div className="flex flex-col w-full z-0">
      <div className="flex gap-3 pb-4 items-center text-[#404040] px-2">
        <div className="relative w-full">
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full h-10 md:h-11 rounded-full  pl-4 pr-10"
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
          .filter((prod) =>
            prod.name.toLowerCase().includes(searchValue.toLowerCase().trim())
          )
          .map((prod) => (
            <div
              key={prod.id}
              className="w-full bg-white rounded-xl py-3 px-4 text-[#404040] shadow-sm shadow-[#00000061] hover:scale-[1.005] transition-transform duration-200 ease-in-out cursor-pointer"
              onClick={() => toggleProductDetails(prod.id)}
            >
              <p className="text-sm font-bold">{prod.name}</p>
              <p className="text-[13px]">Rs. {prod.sale_price}</p>
              {expandedProductId === prod.id && (
                <div
                  className="m-3 p-7 md:px-10 rounded-3xl shadow-sm  bg-[#dbeded] hover:bg-[#cde4e4] transition-colors duration-200 ease-in-out"
                  style={{ boxShadow: "0 0 10px -2px #00000096" }}
                >
                  <p className="font-bold py-2">Product Details</p>
                  <div>
                    <table className="w-full text-center text-[13px] ">
                      <tbody>
                        <tr>
                          <td className="border border-[#0079796c] p-1 font-semibold">
                            Name
                          </td>
                          <td className="border border-[#0079796c] p-1 min-w-[100px]">
                            {prod.name}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-[#0079796c]  p-1 font-semibold">
                            Category
                          </td>
                          <td className="border  border-[#0079796c] p-1">
                            {prod.category}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-[#0079796c]  p-1 font-semibold">
                            Purchase Price
                          </td>
                          <td className="border border-[#0079796c]  p-1">
                            Rs. {prod.purchase_price}
                          </td>
                        </tr>
                        <tr>
                          <td className="border  border-[#0079796c] p-1 font-semibold">
                            Sale Price
                          </td>
                          <td className="border  border-[#0079796c] p-1">
                            Rs. {prod.sale_price}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
