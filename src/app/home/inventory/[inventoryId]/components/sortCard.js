import React, { useEffect, useState } from "react";
import {
  FaSortAlphaDown,
  FaSortAlphaDownAlt,
  FaSortAlphaUp,
  FaSortAlphaUpAlt,
  FaSortAmountDown,
  FaSortAmountDownAlt,
  FaSortAmountUp,
  FaSortAmountUpAlt,
  FaSortDown,
  FaSortNumericUp,
} from "react-icons/fa";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdOutlineSortByAlpha,
  MdSortByAlpha,
  MdSportsBar,
} from "react-icons/md";

export default function Notification({ setSortValues, sortId, sortOrder }) {
  const [one, setOne] = useState(false);
  const [two, setTwo] = useState(false);
  const [three, setThree] = useState(false);
  const [four, setFour] = useState(false);
  const [five, setFive] = useState(false);
  const [six, setSix] = useState(false);

  const resetValues = () => {
    setOne(false);
    setTwo(false);
    setThree(false);
    setFour(false);
    setFive(false);
    setSix(false);
  };

  useEffect(() => {
    if (sortId === "name") {
      resetValues();
      sortOrder === "asc" ? setOne(true) : setTwo(true);
    } else if (sortId === "salePrice") {
      resetValues();
      sortOrder === "asc" ? setThree(true) : setFour(true);
    } else if (sortId === "createdAt") {
      resetValues();
      setFive(true);
    } else {
      resetValues();
      setSix(true);
    }
  }, [sortId, sortOrder]);

  return (
    <div className="sortCard absolute top-9 right-10 md:right-6  text-xs  border border-gray-300 text-gray-600 w-auto bg-white shadow-md shadow-[#00000052] rounded-xl z-30">
      <div
        onClick={() => setSortValues("name", "asc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[#dbeded] rounded-xl ${
          one && "text-teal-600"
        }`}
      >
        Name
        <FaSortAlphaDown />
      </div>
      <div
        onClick={() => setSortValues("name", "desc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[#dbeded] rounded-xl ${
          two && "text-teal-600"
        }`}
      >
        Name
        <FaSortAlphaUp />
      </div>
      <div
        onClick={() => setSortValues("salePrice", "desc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[#dbeded] rounded-xl ${
          four && "text-teal-600"
        }`}
      >
        Price
        <FaSortAmountDown />
      </div>
      <div
        onClick={() => setSortValues("salePrice", "asc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[#dbeded] rounded-xl ${
          three && "text-teal-600"
        }`}
      >
        Price
        <FaSortAmountUp />
      </div>
      <div
        onClick={() => setSortValues("createdAt", "desc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[#dbeded] rounded-xl ${
          five && "text-teal-600"
        }`}
      >
        Recently Added
      </div>
      <div
        onClick={() => setSortValues("updatedAt", "desc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[#dbeded] rounded-xl ${
          six && "text-teal-600"
        }`}
      >
        Recently Updated
      </div>
    </div>
  );
}
