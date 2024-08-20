import React from "react";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";

export default function notification({ setSortValues, sortId, sortOrder }) {
  return (
    <div className="sortCard absolute top-9 right-4 text-xs md:text-sm border border-gray-300 text-gray-600 w-auto bg-white shadow-md shadow-[#00000052] rounded-xl z-30">
      <div
        onClick={() => setSortValues("name", "asc")}
        className="flex items-center justify-center gap-3 p-2 px-8 hover:bg-[#dbeded] rounded-xl"
      >
        Name
        <MdArrowDownward />
      </div>
      <div
        onClick={() => setSortValues("name", "desc")}
        className="flex items-center justify-center gap-3 p-2 hover:bg-[#dbeded] rounded-xl"
      >
        Name
        <MdArrowUpward />
      </div>
      <div
        onClick={() => setSortValues("salePrice", "asc")}
        className="flex items-center justify-center gap-3 p-2 hover:bg-[#dbeded] rounded-xl"
      >
        Price
        <MdArrowDownward />
      </div>
      <div
        onClick={() => setSortValues("salePrice", "desc")}
        className="flex items-center justify-center gap-3 p-2 hover:bg-[#dbeded] rounded-xl"
      >
        Price
        <MdArrowUpward />
      </div>
      <div
        onClick={() => setSortValues("createdAt", "desc")}
        className="flex items-center justify-center gap-3 p-2 hover:bg-[#dbeded] rounded-xl"
      >
        Last Added
      </div>
      <div
        onClick={() => setSortValues("updatedAt", "desc")}
        className="flex items-center justify-center gap-3 p-2 hover:bg-[#dbeded] rounded-xl"
      >
        Last Updated
      </div>
    </div>
  );
}
