import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";

export default function Manage_Categories({ CloseForm, categories }) {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const [add_C, set_add_C] = useState(true);
  const [edit_C, set_edit_C] = useState(false);
  const [remove_C, set_remove_C] = useState(false);

  const add_clicked = () => {
    set_add_C(true);
    set_edit_C(false);
    set_remove_C(false);
  };
  const edit_clicked = () => {
    set_add_C(false);
    set_edit_C(true);
    set_remove_C(false);
  };
  const remove_clicked = () => {
    set_add_C(false);
    set_edit_C(false);
    set_remove_C(true);
  };

  return (
    <div className="flex fixed z-40 top-0 flex-col p-5 w-screen h-screen items-center justify-center bg-[#00000040] backdrop-blur-[2px] ">
      <div className="pt-4  md:pt-4 p-7 md:p-10 mx-10 z-40 w-full max-w-[400px] h-[355px] md:h-[385px] md:max-w-[450px] overflow-auto hidden_scroll_bar bg-[#dfeaea] rounded-lg shadow-lg shadow-[#00000040] text-[#404040]">
        <div className="flex w-full justify-end sticky top-0">
          <button
            onClick={CloseForm}
            className="mr-[-15px] md:mr-[-25px] text-gray-600 flex justify-center items-center size-6  rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <p className="font-bold text-lg md:text-xl pb-4 text-teal-700">
          Manage Categories
        </p>
        <div className="flex flex-col text-sm md:text-base gap-3 font-semibold">
          <div className="flex justify-between items-center text-white bg-teal-600 rounded-full p-1">
            <button
              onClick={add_clicked}
              className={`py-1 px-3 ${
                add_C
                  ? `bg-white text-teal-700`
                  : `hover:scale-[1.05] text-white`
              }  rounded-full w-full`}
            >
              Add
            </button>
            <button
              onClick={edit_clicked}
              className={`py-1 px-3 ${
                edit_C
                  ? `bg-white text-teal-700`
                  : `hover:scale-[1.05] text-white`
              }  rounded-full w-full`}
            >
              Edit
            </button>
            <button
              onClick={remove_clicked}
              className={`py-1 px-3 ${
                remove_C
                  ? `bg-white text-teal-700`
                  : `hover:scale-[1.05] text-white`
              }  rounded-full w-full`}
            >
              Remove
            </button>
          </div>
          {add_C && (
            <div className="flex flex-col gap-4 text-xs md:text-sm font-normal p-2 px-4">
              <div className="flex flex-col gap-1">
                <p>Category Name</p>
                <input
                  type="text"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <button className="w-full px-4 py-3 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600">
                Add
              </button>
            </div>
          )}
          {edit_C && (
            <div className="flex flex-col gap-4 text-xs md:text-sm font-normal p-2 px-4">
              <div className="flex flex-col gap-1">
                <p>Select a Category</p>
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
              <div className="flex flex-col gap-1">
                <p>New Name</p>
                <input
                  type="text"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <button className="w-full px-4 py-3 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600">
                Update
              </button>
            </div>
          )}
          {remove_C && (
            <div className="flex flex-col gap-4 text-xs md:text-sm font-normal  p-2 px-4">
              <div className="flex flex-col gap-1">
                <p>Select a Category</p>
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
              <button className="w-full px-4 py-3 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
