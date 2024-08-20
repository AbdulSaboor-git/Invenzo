import React from "react";

export default function FilterCard({
  categories,
  applyFilter,
  clearFilter,
  filterApplied,
  setMinPrice,
  setMaxPrice,
  setFilterCategoryId,
  minPrice,
  maxPrice,
  filterCategoryId,
}) {
  const handleCategoryChange = (e) => setFilterCategoryId(e.target.value);
  const handleMinPriceChange = (e) => setMinPrice(e.target.value);
  const handleMaxPriceChange = (e) => setMaxPrice(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    applyFilter();
  };

  return (
    <div className="filterCard absolute p-6 pt-8 top-9 right-[75px] text-xs md:text-sm border border-gray-300 text-gray-600 w-[300px] bg-[#dfeaea] shadow-md shadow-[#00000052] rounded-xl z-30">
      <div className="flex flex-col gap-3">
        <p className="font-bold text-lg md:text-xl pb-1 text-teal-700">
          Filter Products
        </p>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Category</p>
              <select
                onChange={handleCategoryChange}
                value={filterCategoryId}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Select a category</option>
                {categories?.map((categ) => (
                  <option key={categ.id} value={categ.id}>
                    {categ.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Min. Price</p>
              <input
                value={minPrice}
                onChange={handleMinPriceChange}
                type="number"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Max. Price </p>
              <input
                value={maxPrice}
                onChange={handleMaxPriceChange}
                type="number"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div className="flex flex-col mt-2 gap-1">
              <button className="w-full px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600">
                Apply
              </button>
              {filterApplied && (
                <button
                  onClick={clearFilter}
                  className="w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
