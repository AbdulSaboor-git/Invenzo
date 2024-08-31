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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()} // Stop propagation on the overlay click
    >
      <div className="bg-[var(--form-bg)] rounded-lg px-6 py-8 text-sm md:text-base max-w-sm w-full border border-gray-300 shadow-md shadow-[var(--shaddow)] mx-6 text-[var(--text-prim)]">
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
            className="bg-[var(--btn-bg)] hover:bg-[var(--btn-bg-sec)] text-white py-2 px-4 rounded"
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
