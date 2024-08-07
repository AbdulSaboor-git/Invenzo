import React, { useEffect } from "react";

export default function Loader() {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  return (
    <div className="w-full fixed h-screen z-50 flex justify-center items-center  backdrop-blur-[2px] ">
      <div className="py-5 px-8 text-sm bg-[#000000be] flex justify-center items-center rounded-full">
        <p className="animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
