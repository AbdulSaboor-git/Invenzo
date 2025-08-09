import React from "react";

export default function ViewProduct({ selectedProduct, categories, close }) {
  return (
    <div
      className={`fixed inset-0 text-sm  bg-black bg-opacity-40 backdrop-blur-[2px] flex items-center justify-center z-50 px-4 sm:px-6 transition-all duration-200 ${
        selectedProduct
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={close}
    >
      {selectedProduct && (
        <div
          className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            onClick={close}
          >
            ✕
          </button>
          <h3 className="text-lg font-bold mb-4">Product Details</h3>
          <div className="text-sm space-y-2">
            <p>
              <strong>Name:</strong> {selectedProduct.name}
            </p>
            <p>
              <strong>Description:</strong> {selectedProduct.description || "—"}
            </p>
            <p>
              <strong>Category:</strong>{" "}
              {categories.find((cat) => cat.id === selectedProduct.categoryId)
                ?.name || "—"}
            </p>
            <p>
              <strong>Purchase Price:</strong> Rs.
              {selectedProduct.purchasePrice}
            </p>
            <p>
              <strong>Sale Price:</strong> Rs.
              {selectedProduct.salePrice}
            </p>
            <p>
              <strong>Govt. Sale Price:</strong>{" "}
              {selectedProduct.govtSalePrice != null
                ? `Rs.${selectedProduct.govtSalePrice}`
                : "—"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(selectedProduct.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {new Date(selectedProduct.updatedAt).toLocaleString()}
            </p>
            <p>
              <strong>Tags:</strong> {selectedProduct.tags || "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
