import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-t-transparent border-b-transparent border-r-transparent border-[#f87e47] rounded-full animate-spin"></div>
    </div>
  );
}
