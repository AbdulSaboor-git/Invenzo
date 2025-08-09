"use client";
import React, { useState } from "react";
import { toast } from "sonner";

export default function DeleteProduct({
  inventory,
  selectedProductForDelete,
  close,
  fetchNewData,
  showDialogue,
}) {
  const [loadingForDelete, setLoadingForDelete] = useState(false);

  const handleDelete = async () => {
    if (!navigator.onLine) {
      toast.error("Cannot delete. Check your network connection");
      return;
    }
    try {
      setLoadingForDelete(true);
      const response = await fetch(`/api/inventory/${inventory?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedProductForDelete.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete product");
      }

      toast.success("Product deleted successfully");
      close();
      await fetchNewData(); // refresh product list from DB
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setLoadingForDelete(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 text-sm  bg-black bg-opacity-40 flex items-center justify-center z-50 px-4  backdrop-blur-[2px] sm:px-6 transition-all duration-200 ${
        showDialogue
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold text-red-700 mb-4">
          Confirm Deletion
        </h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">
            {selectedProductForDelete?.name}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-4">
          <button
            disabled={loadingForDelete}
            onClick={close}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-black disabled:hover:bg-gray-300 disabled:cursor-not-allowed "
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loadingForDelete}
            className="px-4 py-2 w-32 bg-red-600 hover:bg-red-700 rounded text-white disabled:hover:bg-red-700 disabled:cursor-not-allowed "
          >
            {loadingForDelete ? (
              <div className="border-2 border-gray-200 border-t-transparent animate-spin rounded-full w-4 h-4 mx-auto" />
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
