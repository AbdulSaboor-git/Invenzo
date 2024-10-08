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
    <div className="sortCard absolute top-9 right-10 md:right-6  text-xs  border border-gray-300 text-[var(--text-prim)] w-auto bg-[var(--form-bg)] shadow-md shadow-[var(--shaddow)] rounded-xl z-30">
      <div
        onClick={() => setSortValues("name", "asc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[var(--text-alt-2)] rounded-xl ${
          one && "text-[var(--text-alt-3)] font-semibold "
        }`}
      >
        Name
        <FaSortAlphaDown />
      </div>
      <div
        onClick={() => setSortValues("name", "desc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[var(--text-alt-2)] rounded-xl ${
          two && "text-[var(--text-alt-3)] font-semibold "
        }`}
      >
        Name
        <FaSortAlphaUp />
      </div>
      <div
        onClick={() => setSortValues("salePrice", "desc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[var(--text-alt-2)] rounded-xl ${
          four && "text-[var(--text-alt-3)] font-semibold "
        }`}
      >
        Price
        <FaSortAmountDown />
      </div>
      <div
        onClick={() => setSortValues("salePrice", "asc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[var(--text-alt-2)] rounded-xl ${
          three && "text-[var(--text-alt-3)] font-semibold "
        }`}
      >
        Price
        <FaSortAmountUp />
      </div>
      <div
        onClick={() => setSortValues("createdAt", "desc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[var(--text-alt-2)] rounded-xl ${
          five && "text-[var(--text-alt-3)] font-semibold "
        }`}
      >
        Recently Added
      </div>
      <div
        onClick={() => setSortValues("updatedAt", "desc")}
        className={`flex items-center justify-center gap-3 p-2 px-6 hover:bg-[var(--text-alt-2)] rounded-xl ${
          six && "text-[var(--text-alt-3)] font-semibold "
        }`}
      >
        Recently Updated
      </div>
    </div>
  );
}
