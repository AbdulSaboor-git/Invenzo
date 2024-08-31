import React, { useState, useEffect, useCallback, useRef } from "react";
import { MdClose, MdError, MdWarning } from "react-icons/md";
import { FaFilter, FaSort } from "react-icons/fa";
import Product_card from "./product_card";
import Sort_card from "./sortCard";
import Filter_card from "./filterCard";
import { useDispatch } from "react-redux";
import { triggerNotification } from "@/redux/notificationThunk";
import LoaderSmall from "@/components/loader_small";

export default function RightSide({
  role,
  openEditForm,
  handleDeleteClick,
  setProd,
  products,
  loadingData,
  categories,
  networkError,
  userId,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [sortCard_isOpen, setSortCard_isOpen] = useState(false);
  const [filterCard_isOpen, setFilterCard_isOpen] = useState(false);
  const [filterApplied, set_filterApplied] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [AppliedMinPrice, setAppliedMinPrice] = useState(0);
  const [AppliedMaxPrice, setAppliedMaxPrice] = useState(Infinity);
  const [AppliedFilterCategoryId, setAppliedFilterCategoryId] = useState("");
  const [PRODUCTS, setPRODUCTS] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [sortId, setSortId] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSortOrder = JSON.parse(localStorage.getItem("sortOrder"));
      const savedSortId = JSON.parse(localStorage.getItem("sortId"));

      if (savedSortId && savedSortOrder) {
        setSortId(savedSortId);
        setSortOrder(savedSortOrder);
      }
    }
  }, [sortId, sortOrder]);

  const setAppliedFilterValues = () => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setAppliedFilterCategoryId(filterCategoryId);
  };

  const setSortValues = (id, order) => {
    setSortId(id);
    setSortOrder(order);
    localStorage.setItem("sortId", JSON.stringify(id));
    localStorage.setItem("sortOrder", JSON.stringify(order));
  };

  const dispatch = useDispatch();

  const showMessage = (msg, state) => {
    dispatch(
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

  const sortProducts = useCallback(() => {
    if (!products || products.length === 0) {
      setPRODUCTS([]);
      return;
    }

    const sorted = [...products].sort((a, b) => {
      if (sortId === "salePrice") {
        return sortOrder === "asc"
          ? parseFloat(a.salePrice) - parseFloat(b.salePrice)
          : parseFloat(b.salePrice) - parseFloat(a.salePrice);
      } else {
        return sortOrder === "asc"
          ? a[sortId].localeCompare(b[sortId])
          : b[sortId].localeCompare(a[sortId]);
      }
    });

    setPRODUCTS(sorted);
  }, [products, sortId, sortOrder]);

  useEffect(() => {
    sortProducts();
  }, [sortId, sortOrder, products]);

  useEffect(() => {
    filterApplied && reApplyFilter();
  }, [filterApplied]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (sortCard_isOpen && !event.target.closest(".sortCard")) ||
        (filterCard_isOpen && !event.target.closest(".filterCard"))
      ) {
        closeSortCard();
        closeFilterCard();
        setFilterFields();
      }
    };

    document.body.addEventListener("click", handleClickOutside);

    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, [sortCard_isOpen, filterCard_isOpen]);

  const ApplyFilter = useCallback(() => {
    if (!products || products.length === 0) {
      setPRODUCTS([]);
      return;
    }

    if (minPrice === 0 && maxPrice === Infinity && filterCategoryId === "") {
      if (filterApplied) {
        clearFilter();
        return;
      }
      showMessage("No filter criteria entered", false);
      setPRODUCTS(originalProducts);
      return;
    }

    const filtered = originalProducts.filter((prod) => {
      return (
        (minPrice ? prod.salePrice >= minPrice : true) &&
        (maxPrice ? prod.salePrice <= maxPrice : true) &&
        (filterCategoryId
          ? prod.categoryId === parseInt(filterCategoryId)
          : true)
      );
    });
    setPRODUCTS(filtered);
    setAppliedFilterValues();
    set_filterApplied(true);
    showMessage("Filters applied successfully", true);
    closeFilterCard();
  }, [
    originalProducts,
    filterCategoryId,
    minPrice,
    maxPrice,
    products,
    filterApplied,
  ]);

  const reApplyFilter = () => {
    const filtered = originalProducts.filter((prod) => {
      return (
        (minPrice ? prod.salePrice >= minPrice : true) &&
        (maxPrice ? prod.salePrice <= maxPrice : true) &&
        (filterCategoryId
          ? prod.categoryId === parseInt(filterCategoryId)
          : true)
      );
    });

    closeFilterCard();
    setPRODUCTS(filtered);
  };

  const clearFilter = async () => {
    setMinPrice(0);
    setMaxPrice(Infinity);
    setFilterCategoryId("");
    setAppliedMinPrice(0);
    setAppliedMaxPrice(Infinity);
    setAppliedFilterCategoryId("");
    setPRODUCTS(originalProducts);
    showMessage("Filters cleared successfully", true);
    closeFilterCard();
    set_filterApplied(false);
  };

  const setFilterFields = () => {
    if (!filterApplied) {
      setMinPrice(0);
      setMaxPrice(Infinity);
      setFilterCategoryId("");
    } else {
      setMinPrice(AppliedMinPrice);
      setMaxPrice(AppliedMaxPrice);
      setFilterCategoryId(AppliedFilterCategoryId);
    }
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

  const [isSticky, setIsSticky] = useState(false);
  const placeholderRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: [1] }
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => {
      if (placeholderRef.current) {
        observer.unobserve(placeholderRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div ref={placeholderRef}></div>
      <div
        ref={headerRef}
        className={`flex -mx-6 px-6 p-4 pt-0 z-20  gap-1 md:gap-4 transition-all duration-300 ease-in-out items-center text-[#404040]  md:mx-0 md:top-0 md:pb-4  md:relative md:pt-0 md:px-2 ${
          isSticky ? "fixed translate-y-[-5px] top-[75px]  w-full " : "relative"
        }`}
      >
        <div className="relative w-full">
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full h-9 md:h-10 bg-[var(--searchbar)] text-[var(--text-prim)] placeholder:text-[var(--text-sec)]  rounded-full text-[12px] md:text-[14px] pl-4 pr-10"
            placeholder="Search..."
          />
          {searchValue && (
            <MdClose
              className="absolute right-0 rounded-e-full top-1/2 transform -translate-y-1/2  p-[11px] text-[40px] cursor-pointer  text-[var(--text-sec)]"
              onClick={clearSearch}
            />
          )}
        </div>
        <div className="relative text-[32px] text-[var(--btn-icons)] md:text-[35px] flex items-center justify-between gap-[2px] md:gap-3">
          <FaFilter
            onClick={toggleFilterCard}
            className={` py-[6px] cursor-pointer hover:text-[var(--btn-icons-sec)] ${
              filterApplied && "text-red-500 hover:text-red-600"
            }`}
          />
          <FaSort
            onClick={toggleSortCard}
            className=" py-[6px] cursor-pointer hover:text-[var(--btn-icons-sec)]"
          />
        </div>

        {sortCard_isOpen && (
          <Sort_card
            setSortValues={setSortValues}
            sortId={sortId}
            sortOrder={sortOrder}
          />
        )}
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
            onMouseLeave={closeFilterCard}
          />
        )}
      </div>
      <div
        className={`h-[240px] transition-all md:h-0 ${
          isSticky ? "block" : "hidden"
        }`}
      ></div>
      <div
        className={`flex flex-col gap-[6px] w-full pb-1 px-0 md:px-2 md:max-h-[80vh] md:overflow-auto hidden_scroll_bar`}
      >
        {loadingData ? (
          <LoaderSmall />
        ) : networkError ? (
          <div className="flex justify-center items-center gap-2 text-[var(--text-sec)] text-xs pl-2 text-center">
            <MdWarning />{" "}
            <p>{"Please check your network connection and try again"}</p>
          </div>
        ) : !PRODUCTS?.length ? (
          <div className="text-gray-300 text-xs pl-2 text-center">
            {/* <p>{"(Empty)"}</p> */}
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
