import React from "react";

export default function left_side({ buttons }) {
  return (
    <div className="flex flex-col gap-2 px-2 w-full">
      {buttons.map((btn, index) => (
        <button
          className="bg-[#008e8e] hover:bg-[#007c7c] hover:scale-x-[1.01]  transition-transform duration-200 ease-in-out   text-white text-sm text-left py-4 px-6 rounded-xl shadow-sm shadow-[#000000cd]"
          key={index}
        >
          <div className="flex gap-4 items-center justify-start ">
            <div>{btn.icon}</div>
            <p>{btn.btn_name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
