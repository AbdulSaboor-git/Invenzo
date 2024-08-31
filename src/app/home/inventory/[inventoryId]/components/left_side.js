import React, { useState } from "react";
export default function Left_side({ buttons, openPreferences }) {
  return (
    <div className="flex flex-col gap-2 px-2 w-full min-w-[250px]">
      {buttons.map((btn, index) => (
        <button
          onClick={btn.clickEvent}
          className="bg-[var(--btn-alt-2)] hover:bg-[var(--btn-alt-2-sec)] hover:scale-x-[1.01]    text-white text-sm text-left py-4 px-6 rounded-xl shadow-sm shadow-[#00000062]"
          key={index}
        >
          <div className="flex gap-4 items-center justify-start">
            <div className="mb-[2px]">{btn.icon}</div>
            <p>{btn.btn_name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
