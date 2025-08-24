/* eslint-disable react/prop-types */
import React from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';

export default function ViewProduct({
  selectedProduct,
  categories,
  close,
  editClick,
  deleteClick,
  prefs,
}) {
  return (
    <div
      className={`fixed inset-0 text-sm bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-6 transition ease-in-out ${
        selectedProduct
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
      onClick={close}
    >
      {selectedProduct && (
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="hidden md:block absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={close}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Header */}
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-5">
            Product Details
          </h3>

          {/* Details */}
          <div className="grid grid-cols-1 gap-y-3 text-gray-700">
            <Detail label="Name" value={selectedProduct.name} />
            {/* <Detail
              label="Description"
              value={selectedProduct.description || "—"}
            /> */}
            {prefs.viewCategory && (
              <Detail label="Category" value={selectedProduct.category?.name} />
            )}
            {prefs.viewPurchasePrice && (
              <Detail
                label="Purchase Price"
                value={`Rs.${selectedProduct.purchasePrice}/${selectedProduct.unit}`}
              />
            )}
            <Detail
              label="Sale Price"
              value={`Rs.${selectedProduct.salePrice}/${selectedProduct.unit}`}
            />
            {prefs.viewGovtSalePrice && (
              <Detail
                label="Govt. Sale Price"
                value={
                  selectedProduct.govtSalePrice != null
                    ? `Rs.${selectedProduct.govtSalePrice}/${selectedProduct.unit}`
                    : '—'
                }
              />
            )}
            {prefs.viewDateAdded && (
              <Detail
                label="Created At"
                value={new Date(selectedProduct.createdAt).toLocaleString()}
              />
            )}
            {prefs.viewDateUpdated && (
              <Detail
                label="Updated At"
                value={new Date(selectedProduct.updatedAt).toLocaleString()}
              />
            )}
            {/* <Detail label="Tags" value={selectedProduct.tags || "—"} /> */}
          </div>

          {/* Action buttons */}
          {(prefs.editProduct || prefs.deleteProduct) && (
            <div className="w-full flex items-center gap-3 mt-8 text-sm sm:text-base">
              {prefs.editProduct && (
                <button
                  className="w-full group px-2 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white  transition-all"
                  onClick={editClick}
                >
                  <MdEdit size={18} className="group-hover-shake" /> Edit
                </button>
              )}
              {prefs.deleteProduct && (
                <button
                  className="w-full group px-2 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white  transition-all"
                  onClick={deleteClick}
                >
                  <MdDelete size={18} className="group-hover-shake" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Small reusable component for consistent detail layout
function Detail({ label, value }) {
  return (
    <p>
      <span className="font-medium text-gray-700">{label}:</span>{' '}
      <span className="text-gray-600">{value}</span>
    </p>
  );
}
