import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";

export default function Manage_Moderators({ CloseForm, moderators }) {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const [add_M, set_add_M] = useState(true);
  const [remove_M, set_remove_M] = useState(false);

  const add_clicked = () => {
    set_add_M(true);
    set_remove_M(false);
  };

  const remove_clicked = () => {
    set_add_M(false);
    set_remove_M(true);
  };

  return (
    <div className="flex fixed z-40 top-0 flex-col p-5 w-screen h-screen items-center justify-center bg-[#00000040] backdrop-blur-[2px] ">
      <div className="pt-4  md:pt-4 p-7 md:p-10 mx-10 z-40 w-full max-w-[400px] h-[425px] md:h-[465px] md:max-w-[450px] overflow-auto hidden_scroll_bar bg-[#dfeaea] rounded-lg shadow-lg shadow-[#00000040] text-[#404040]">
        <div className="flex w-full justify-end sticky top-0">
          <button
            onClick={CloseForm}
            className="mr-[-15px] md:mr-[-25px] text-gray-600 flex justify-center items-center size-6  rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <p className="font-bold text-lg md:text-xl pb-4 text-teal-700">
          Manage Moderators
        </p>
        <div className="flex flex-col text-sm md:text-base gap-3 font-semibold">
          <div className="flex justify-between items-center text-white bg-teal-600 rounded-full p-1">
            <button
              onClick={add_clicked}
              className={`py-1 px-3 ${
                add_M
                  ? `bg-white text-teal-700`
                  : `hover:scale-[1.05] text-white`
              }  rounded-full w-full`}
            >
              Add
            </button>
            <button
              onClick={remove_clicked}
              className={`py-1 px-3 ${
                remove_M
                  ? `bg-white text-teal-700`
                  : `hover:scale-[1.05] text-white`
              }  rounded-full w-full`}
            >
              Remove
            </button>
          </div>
          {add_M && (
            <div className="flex flex-col gap-4 text-xs md:text-sm font-normal p-2 px-4">
              <div className="flex flex-col gap-1">
                <p>Moderator Name</p>
                <input
                  type="text"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <p>Moderator Email</p>
                <input
                  type="email"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <p>Moderator id</p>
                <input
                  type="number"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>
              <button className="w-full px-4 py-3 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600">
                Add
              </button>
            </div>
          )}
          {remove_M && (
            <div className="flex flex-col gap-4 text-xs md:text-sm font-normal  p-2 px-4">
              <div className="flex flex-col gap-1">
                <p>Select a Moderator</p>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                >
                  <option value="">Select a Moderator</option>
                  {moderators.map((moderator, i) => (
                    <option key={i} value={moderator.id}>
                      {moderator.name + ", " + moderator.email}
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
