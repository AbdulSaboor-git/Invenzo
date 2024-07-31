import React, { useEffect } from "react";
import { MdClose } from "react-icons/md";

export default function AddProduct({
  onClose,
  categories,
  heading,
  buttonText,
}) {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);
  return (
    <div className="flex fixed z-40 top-0 flex-col p-5 w-screen h-screen items-center justify-center bg-[#00000040] backdrop-blur-[2px] ">
      <div className="pt-4 p-10 mx-10 z-40 w-full max-w-[450px] overflow-auto hidden_scroll_bar bg-[#dfeaea] rounded-lg shadow-lg text-[#404040]">
        <div className="flex w-full justify-end sticky top-0">
          <button
            onClick={onClose}
            className="mr-[-25px] text-gray-600 flex justify-center items-center size-8 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={20} />
          </button>
        </div>
        <p className="font-bold text-xl pb-4 text-teal-700">
          {heading} Product
        </p>
        <form className="space-y-3 text-sm text-gray-700 ">
          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">Product Name</label>
            <input
              type="text"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Category</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            >
              <option value="">Select a category</option>
              {categories.map((categ, i) => (
                <option key={i} value={categ}>
                  {categ}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">Purchase Price</label>
            <input
              type="number"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">Sale Price</label>
            <input
              type="number"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">Govt. Sale Price</label>
            <input
              type="number"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">Tags</label>
            <input
              type="text"
              className="px-3 mb-5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {buttonText} Product
          </button>
        </form>
      </div>
    </div>
  );
}
