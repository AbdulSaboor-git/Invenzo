import React, { useEffect } from "react";
import { MdClose } from "react-icons/md";

export default function Add_Inventory({ CloseForm }) {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  function addInventory() {
    // event.preventDefault();
  }

  return (
    <div className="flex fixed z-40 top-0 flex-col p-5 w-screen h-screen items-center justify-center bg-[#00000040] backdrop-blur-[2px] ">
      <div className="pt-4 md:pt-4 p-7 md:p-10 mx-10 z-40 w-full max-w-[400px] md:max-w-[450px] overflow-auto hidden_scroll_bar bg-[#dfeaea] rounded-lg shadow-lg shadow-[#00000040] text-[#404040]">
        <div className="flex w-full justify-end sticky top-0">
          <button
            onClick={CloseForm}
            className="mr-[-15px] md:mr-[-25px] text-gray-600 flex justify-center items-center size-6  rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <p className="font-bold text-lg md:text-xl pb-4 text-teal-700">
          Add Inventory
        </p>
        <form className="space-y-3 text-xs md:text-sm text-gray-700 ">
          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">Inventory Name</label>
            <input
              type="text"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <button
            type="submit"
            onClick={addInventory}
            className="w-full px-4 py-3 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            Add Inventory
          </button>
        </form>
      </div>
    </div>
  );
}
