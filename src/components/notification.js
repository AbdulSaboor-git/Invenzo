// Notification.js
"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Notification() {
  const { msg, success, isVisible } = useSelector(
    (state) => state.notification
  );
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    setVisible(isVisible);

    if (isVisible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!visible) return null;

  return (
    <div className="flex w-full justify-center touch-none">
      <div
        className={`fixed z-[200] top-2 p-1 px-4 mx-10 bg-white text-xs rounded-full ${
          success ? "text-[#008514]" : "text-[#cb0000]"
        } transition-all duration-300 ${
          isVisible
            ? success
              ? "animate-slide-expand"
              : "animate-slide-expand-error"
            : "animate-slide-contract"
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
