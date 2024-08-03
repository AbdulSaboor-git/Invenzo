import React, { useEffect, useState } from "react";

export default function Notification({ msg, success }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex w-full justify justify-center touch-none">
      <div
        className={`fixed z-50 top-2 p-1 px-4 bg-white text-xs rounded-full text-[#404040] transition-all duration-300 ${
          isVisible ? "animate-slide-expand" : "animate-slide-contract"
        }`}
        style={
          success
            ? { boxShadow: "0px 0px 10px 1px green", border: "1px solid green" }
            : {
                boxShadow: "0px 0px 10px 1px #ff2a2a",
                border: "1px solid #ff2a2a",
              }
        }
      >
        {msg}
      </div>
    </div>
  );
}
