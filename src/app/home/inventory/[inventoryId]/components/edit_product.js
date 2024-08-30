import React, { useEffect, useState } from "react";
import { MdClose, MdInfoOutline } from "react-icons/md";
import { useDispatch } from "react-redux";
import { triggerNotification } from "@/redux/notificationThunk";

export default function EditProduct({
  CloseForm,
  categories,
  invId,
  onSuccess,
  product,
}) {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const [infoBox_visible, setInfoBox_visible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(product.name || "");
  const [categoryId, setCategoryId] = useState(product.category.id || null);
  const [purchasePrice, setPurchasePrice] = useState(
    product.purchasePrice || 0
  );
  const [salePrice, setSalePrice] = useState(product.salePrice || 0);
  const [govtSalePrice, setGovtSalePrice] = useState(
    product.govtSalePrice || null
  );
  const [tags, setTags] = useState(product.tags || "");
  const Dispatch = useDispatch();

  const showMessage = (msg, state) => {
    Dispatch(
      triggerNotification({
        msg: msg,
        success: state,
      })
    );
  };

  function showInfoBox() {
    setInfoBox_visible(true);
  }
  function hideInfoBox() {
    setInfoBox_visible(false);
  }

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleCategoryChange(e) {
    setCategoryId(e.target.value);
  }

  function handlePurchasePriceChange(e) {
    setPurchasePrice(parseFloat(e.target.value));
    setNewSalePrice(parseFloat(e.target.value));
  }

  function setNewSalePrice(PP) {
    setSalePrice(Math.round((PP + PP * 0.07) / 10) * 10);
  }

  function handleSalePriceChange(e) {
    setSalePrice(parseFloat(e.target.value));
  }
  function handleGovtSalePriceChange(e) {
    setGovtSalePrice(parseFloat(e.target.value) || null);
  }

  function handleTagsChange(e) {
    setTags(e.target.value);
  }

  const editProduct = async (e) => {
    e.preventDefault();
    setError(""); // Clear any existing errors

    // Validate required fields
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!categoryId) {
      setError("Category is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/inventory/${invId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
          name: name.trim(),
          description: "",
          categoryId: parseInt(categoryId, 10),
          purchasePrice: purchasePrice,
          salePrice: salePrice,
          govtSalePrice: govtSalePrice,
          tags: tags.trim(),
        }),
      });

      if (!response.ok) {
        showMessage(error, false);
        throw new Error("Failed to edit product");
      }

      onSuccess();
      CloseForm(); // Close the form after successful submission
    } catch (error) {
      setError(error.message);
      showMessage(error.message, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex fixed z-[200] top-0 flex-col p-5 w-screen h-screen items-center justify-center bg-[#00000040] backdrop-blur-[2px]">
      <div className="pt-4 md:pt-4 p-7 border-[10px] border-transparent  md:p-10 mx-10 z-40 w-full max-w-[400px] md:max-w-[450px] overflow-auto hidden_scroll_bar bg-[var(--form-bg)] rounded-lg shadow-lg shadow-[var(--shaddow)] text-[var(--text-prim)]">
        <div className="flex w-full justify-end ">
          <button
            onClick={CloseForm}
            className="mr-[-25px] mt-[-10px] md:mr-[-35px] text-[var(--text-sec)] flex justify-center items-center size-6 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <p className="font-bold text-lg md:text-xl pb-4 text-[var(--form-heading)]">
          Edit Product
        </p>
        <form
          className="space-y-3 text-xs md:text-sm "
          method="patch"
          onSubmit={editProduct}
        >
          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--form-heading)]"
              required
              maxLength={40}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Category</label>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className="px-3 py-2 border  border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--form-heading)]"
              required
            >
              <option value="">Select a category</option>
              {categories?.map((categ) => (
                <option key={categ.id} value={categ.id}>
                  {categ.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">Purchase Price</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={handlePurchasePriceChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--form-heading)]"
              max={999999999}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">Sale Price</label>
            <input
              type="number"
              value={salePrice}
              onChange={handleSalePriceChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--form-heading)]"
              required
              max={999999999}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">
              Govt. Sale Price
              <span className="font-light text-[var(--text-sec)] ml-2">
                (optional)
              </span>
            </label>
            <input
              type="number"
              value={govtSalePrice || ""}
              onChange={handleGovtSalePriceChange}
              max={999999999}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--form-heading)]"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex gap-2 items-center mb-1">
              <label className="font-semibold ">Tags</label>
              <MdInfoOutline
                className="text-[var(--text-sec)]"
                onMouseEnter={showInfoBox}
                onMouseLeave={hideInfoBox}
                onClick={showInfoBox}
              />
              {infoBox_visible && (
                <div className="absolute rounded-md px-2 py-[2px] border text-gray-500 border-[var(--text-sec)] bg-white shadow-md shadow-[#0004] ml-12 mb-8 text-[10px]">
                  Separate tags by spaces
                </div>
              )}
            </div>
            <input
              type="text"
              value={tags}
              onChange={handleTagsChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--form-heading)]"
              maxLength={400}
            />
          </div>

          <div className="pt-2 flex justify-center">
            <button
              disabled={loading}
              type="submit"
              className={`py-2.5 bg-[var(--btn-bg)] w-3/5 rounded-full text-white hover:bg-[var(--btn-bg-sec)] transition-all duration-200 text-sm font-semibold ${
                loading && "cursor-not-allowed"
              }`}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
