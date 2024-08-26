import React, { useEffect } from "react";

export default function Loader() {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  return (
    <div className="w-full fixed h-full z-[201] flex justify-center items-center backdrop-blur-[2px]">
      <div className="loader-ring">
        <div className="inner-ring"></div>
      </div>
    </div>
  );
}
