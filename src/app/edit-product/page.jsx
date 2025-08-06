"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header2 from "@/components/header2";
import { toast } from "sonner";

export default function AddProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [govtSalePrice, setGovtSalePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const invId = 52;
  const userId = 6;
  const localStorageKey = `inventoryData_${invId}`;

  // Load categories from localStorage (or fetch from DB)
  useEffect(() => {
    const localData = localStorage.getItem(localStorageKey);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed?.categories?.length) {
          setCategories(parsed.categories);
          return;
        }
      } catch (err) {
        console.error("Invalid localStorage data:", err);
      }
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/inventory/${invId}/category`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Unknown error");
        }
        const data = await res.json();
        setCategories(data);

        // Update localStorage
        const local = localStorage.getItem(localStorageKey);
        const parsed = local ? JSON.parse(local) : {};
        localStorage.setItem(
          localStorageKey,
          JSON.stringify({ ...parsed, categories: data })
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error(error.message || "Failed to fetch categories");
      }
    };

    fetchCategories();
  }, [invId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !purchasePrice || !salePrice || !categoryId) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/inventory/${invId}?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          tags: tags.trim(),
          purchasePrice: parseFloat(purchasePrice),
          salePrice: parseFloat(salePrice),
          govtSalePrice: govtSalePrice ? parseFloat(govtSalePrice) : null,
          categoryId: parseInt(categoryId),
        }),
      });

      if (!res.ok) throw new Error("Failed to add product");

      toast.success("Product added successfully");
      setLoading(false);

      // Reset fields
      setName("");
      setDescription("");
      setTags("");
      setPurchasePrice("");
      setSalePrice("");
      setGovtSalePrice("");
      setCategoryId("");

      // Refetch products from DB
      setSyncing(true);
      const productRes = await fetch(
        `/api/inventory/${invId}?userId=${userId}`
      );
      if (!productRes.ok) {
        toast.error("Failed to sync data");
        throw new Error("Failed to refresh product list");
      }
      const { products, categories, inv } = await productRes.json();

      localStorage.setItem(
        localStorageKey,
        JSON.stringify({ products, categories, inv })
      );
      toast.success("Data synced successfully");
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Something went wrong");
    } finally {
      setSyncing(false);
    }
  };

  // Handlers
  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleTagsChange = (e) => setTags(e.target.value.slice(0, 200));
  const handleCategoryChange = (e) => setCategoryId(e.target.value);
  const handlePurchasePriceChange = (e) => {
    const value = e.target.value;
    setPurchasePrice(value);
    updateSalePrice(value);
  };
  const updateSalePrice = (PP) => {
    let newValue =
      Math.round((parseFloat(PP) + parseFloat(PP) * 0.07) / 10) * 10;
    setSalePrice(newValue);
  };
  const handleSalePriceChange = (e) => setSalePrice(e.target.value);
  const handleGovtSalePriceChange = (e) => setGovtSalePrice(e.target.value);

  return (
    <div className="min-h-screen w-full md:bg-gray-100">
      <Header2 />
      <div className="w-full place-self-center max-w-2xl px-8 py-10 md:px-12 md:py-16 bg-white md:shadow-lg md:mt-6 md:rounded-xl">
        <h1 className="text-xl md:text-3xl font-semibold text-gray-800 mb-8 text-center">
          Add New Product
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 text-sm md:text-base"
        >
          {/* Product Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
              maxLength={40}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Description
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              value={description}
              onChange={handleDescriptionChange}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={handleTagsChange}
              maxLength={200}
              placeholder="e.g. apple red phone"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              required
              className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Purchase Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={purchasePrice}
              onChange={handlePurchasePriceChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Sale Price */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Sale Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={salePrice}
              onChange={handleSalePriceChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Govt Sale Price */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Govt. Sale Price
            </label>
            <input
              type="number"
              min="0"
              value={govtSalePrice}
              onChange={handleGovtSalePriceChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? (
              <div className="border-2 border-gray-200 border-t-transparent animate-spin rounded-full w-6 h-6 mx-auto" />
            ) : (
              "Add Product"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
