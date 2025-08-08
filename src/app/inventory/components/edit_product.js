"use client";
import React, { useState } from "react";
import { toast } from "sonner";

export default function EditProduct({
  editProduct,
  categories,
  editForm,
  close,
  fetchNewData,
  inventory,
  setEditForm,
}) {
  const [loadingForEdit, setLoadingForEdit] = useState(false);

  const isSaveDisabled =
    !editForm.name.trim() ||
    !editForm.categoryId ||
    parseFloat(editForm.purchasePrice) < 0 ||
    parseFloat(editForm.salePrice) < 0 ||
    (editForm.govtSalePrice && parseFloat(editForm.govtSalePrice) < 0);

  const handleUpdate = async () => {
    if (!navigator.onLine) {
      toast.error("Cannot update. Check your network connection");
      return;
    }
    try {
      setLoadingForEdit(true);
      const response = await fetch(`/api/inventory/${inventory?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editProduct.id,
          name: editForm.name.trim(),
          description: "",
          categoryId: parseInt(editForm.categoryId, 10),
          purchasePrice: parseFloat(editForm.purchasePrice),
          salePrice: parseFloat(editForm.salePrice),
          govtSalePrice: editForm.govtSalePrice
            ? parseFloat(editForm.govtSalePrice)
            : null,
          tags: editForm.tags.trim(),
        }),
      });

      if (!response.ok) throw new Error("Update failed");
      toast.success("Product updated");
      close();
      await fetchNewData();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setLoadingForEdit(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 text-sm  bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 sm:px-6 transition-all duration-200  backdrop-blur-[2px] ${
        editProduct
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="bg-white max-h-[90%] hidden_scroll_bar overflow-auto rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg py-10 px-6 sm:py-12 sm:px-10  relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          onClick={close}
          disabled={loadingForEdit}
          aria-label="Close edit form"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Edit Product
        </h3>

        <div className="space-y-2">
          {/* Name */}
          <div className="flex items-center gap-2 w-full justify-between">
            <label
              htmlFor="edit-name"
              className="block  font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="edit-name"
              type="text"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px] sm:max-w-[350px]"
              value={editForm.name}
              placeholder="Name"
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
          </div>

          {/* Category */}
          <div className="flex items-center gap-2 w-full justify-between">
            <label
              htmlFor="edit-category"
              className="block  font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="edit-category"
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px] sm:max-w-[350px]"
              value={editForm.categoryId}
              onChange={(e) =>
                setEditForm({ ...editForm, categoryId: e.target.value })
              }
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Price */}
          <div className="flex items-center gap-2 w-full justify-between">
            <label
              htmlFor="edit-purchase-price"
              className="block  font-medium text-gray-700"
            >
              P. Price
            </label>
            <input
              id="edit-purchase-price"
              type="number"
              placeholder="Purchase Price"
              min={0}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px] sm:max-w-[350px]"
              value={editForm.purchasePrice}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  purchasePrice: e.target.value,
                })
              }
            />
          </div>

          {/* Sale Price */}
          <div className="flex items-center gap-2 w-full justify-between">
            <label
              htmlFor="edit-sale-price"
              className="block  font-medium text-gray-700"
            >
              S. Price
            </label>
            <input
              id="edit-sale-price"
              type="number"
              min={0}
              placeholder="Sale Price"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px] sm:max-w-[350px]"
              value={editForm.salePrice}
              onChange={(e) =>
                setEditForm({ ...editForm, salePrice: e.target.value })
              }
            />
          </div>

          {/* Govt. Sale Price */}
          <div className="flex items-center gap-2 w-full justify-between">
            <label
              htmlFor="edit-govt-sale-price"
              className="block  font-medium text-gray-700"
            >
              G. S. Price
            </label>
            <input
              id="edit-govt-sale-price"
              type="number"
              min={0}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300  max-w-[200px] sm:max-w-[350px]"
              value={editForm.govtSalePrice}
              placeholder="Govt. Sale Price"
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  govtSalePrice: e.target.value,
                })
              }
            />
          </div>

          {/* Tags */}
          <div className="flex pb-6 sm:pb-8 items-center justify-between gap-2 w-full">
            <label
              htmlFor="edit-tags"
              className="block  font-medium text-gray-700"
            >
              Tags
            </label>
            <input
              id="edit-tags"
              type="text"
              maxLength={200}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px] sm:max-w-[350px] "
              value={editForm.tags}
              placeholder="Tags (space-separated)"
              onChange={(e) =>
                setEditForm({ ...editForm, tags: e.target.value })
              }
            />
          </div>

          {/* Save Button */}
          <button
            disabled={isSaveDisabled || loadingForEdit}
            onClick={handleUpdate}
            className={`w-full bg-green-500 hover:bg-green-600 py-4 px-6 rounded-lg text-white font-semibold transition-colors disabled:hover:bg-green-600 disabled:cursor-not-allowed
            `}
          >
            {loadingForEdit ? (
              <div className="border-2 border-gray-200 border-t-transparent animate-spin rounded-full w-5 h-5 mx-auto" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
