import React from "react";
import Left_Side from "./left_side";
import Right_Side from "./right_side";

export default function Body({ buttons, user, inventoryId }) {
  return (
    <div className="flex flex-col items-center p-6">
      <div className="flex justify-center w-full max-w-[1200px] gap-4">
        <div className="hidden md:flex-[2] md:block">
          <Left_Side buttons={buttons} />
        </div>
        <div className="w-[2px] bg-[#008080a4] border-0 hidden shadow-black md:block"></div>
        <div className="w-full md:flex-[5]">
          <Right_Side user={user} inventoryId={inventoryId} />
        </div>
      </div>
    </div>
  );
}
