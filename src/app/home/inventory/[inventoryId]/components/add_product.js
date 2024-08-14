import React, { useEffect, useState } from "react";
import { MdClose, MdInfoOutline } from "react-icons/md";
import { useDispatch } from "react-redux";
import { triggerNotification } from "@/redux/notificationThunk";

export default function AddProduct({
  CloseForm,
  categories,
  invId,
  onSuccess,
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
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [govtSalePrice, setGovtSalePrice] = useState(null);
  const [tags, setTags] = useState("");
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
    setPurchasePrice(parseFloat(e.target.value) || 0);
  }

  function handleSalePriceChange(e) {
    setSalePrice(parseFloat(e.target.value) || 0);
  }

  function handleGovtSalePriceChange(e) {
    setGovtSalePrice(parseFloat(e.target.value) || null);
  }

  function handleTagsChange(e) {
    setTags(e.target.value);
  }

  const addProduct = async (e) => {
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        throw new Error("Failed to add product");
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
      <div className="pt-4 md:pt-4 p-7 md:p-10 mx-10 z-40 w-full max-w-[400px] md:max-w-[450px] overflow-auto hidden_scroll_bar bg-[#dfeaea] rounded-lg shadow-lg shadow-[#00000040] text-[#404040]">
        <div className="flex w-full justify-end sticky top-0">
          <button
            onClick={CloseForm}
            className="mr-[-15px] md:mr-[-25px] text-gray-600 flex justify-center items-center size-6 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <p className="font-bold text-lg md:text-xl pb-4 text-teal-700">
          Add Product
        </p>
        <form
          className="space-y-3 text-xs md:text-sm text-gray-700"
          method="post"
          onSubmit={addProduct}
        >
          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
              maxLength={40}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Category</label>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
              max={999999999}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold ">
              Govt. Sale Price
              <span className="font-light text-[#838383] ml-2">(optional)</span>
            </label>
            <input
              type="number"
              value={govtSalePrice || ""}
              onChange={handleGovtSalePriceChange}
              max={999999999}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex gap-2 items-center mb-1">
              <label className="font-semibold ">Tags</label>
              <MdInfoOutline
                className="text-[#949494]"
                onMouseEnter={showInfoBox}
                onMouseLeave={hideInfoBox}
                onClick={showInfoBox}
              />
              {infoBox_visible && (
                <div className="absolute rounded-md px-2 py-[2px] border text-[#7d7d7d] border-[#a0a0a094] bg-white shadow-md shadow-[#0004] ml-12 mb-8 text-[10px]">
                  Separate tags by spaces
                </div>
              )}
            </div>
            <input
              type="text"
              value={tags}
              onChange={handleTagsChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              maxLength={400}
            />
          </div>

          <div className="pt-2 flex justify-center">
            <button
              disabled={loading}
              type="submit"
              className={`py-2.5 bg-teal-600 w-3/5 rounded-full text-white hover:bg-teal-700 transition-all duration-200 text-sm font-semibold ${
                loading && "cursor-not-allowed"
              }`}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
