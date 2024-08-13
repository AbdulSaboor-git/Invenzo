import React, { useEffect } from "react";

export default function Confirmation_dialogue({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.stopPropagation()} // Stop propagation on the overlay click
    >
      <div className="bg-white rounded-lg px-6 py-8 text-sm md:text-base max-w-sm w-full mx-6 text-gray-700">
        <h2 className="text-lg font-bold mb-4 ">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
            onClick={(e) => {
              e.stopPropagation(); // Stop propagation on cancel button click
              onCancel();
            }}
          >
            Cancel
          </button>
          <button
            className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded"
            onClick={(e) => {
              e.stopPropagation(); // Stop propagation on confirm button click
              onConfirm();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
