import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { useDispatch } from "react-redux";
import { triggerNotification } from "@/redux/notificationThunk";

export default function ManageCategories({
  CloseForm,
  inventoryId,
  categories,
  fetchInvData,
}) {
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const [isAdding, setIsAdding] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const dispatch = useDispatch();

  const showMessage = (msg, state) => {
    dispatch(
      triggerNotification({
        msg: msg,
        success: state,
      })
    );
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setIsEditing(false);
    setIsRemoving(false);
  };

  const handleEditClick = () => {
    setIsAdding(false);
    setIsEditing(true);
    setIsRemoving(false);
  };

  const handleRemoveClick = () => {
    setIsAdding(false);
    setIsEditing(false);
    setIsRemoving(true);
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      showMessage("Category name cannot be empty", false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/${inventoryId}/category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      });

      if (res.ok) {
        showMessage("Category added successfully", true);
        fetchInvData();
        setCategoryName("");
      } else {
        const { error } = await res.json();
        showMessage(`Failed to add category: ${error}`, false);
      }
    } catch (error) {
      console.error("Error adding category:", error);
      showMessage("An error occurred while adding the category", false);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!newCategoryName.trim()) {
      showMessage("New category name cannot be empty", false);
      return;
    }
    if (!selectedCategoryId) {
      showMessage("Please select a category to edit", false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/${inventoryId}/category`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategoryId,
          name: newCategoryName,
        }),
      });

      if (res.ok) {
        showMessage("Category updated successfully", true);
        fetchInvData();
        setSelectedCategoryId("");
        setNewCategoryName("");
      } else {
        const { error } = await res.json();
        showMessage(`Failed to update category: ${error}`, false);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      showMessage("An error occurred while updating the category", false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) {
      showMessage("Please select a category to delete", false);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/inventory/${inventoryId}/category`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: selectedCategoryId }),
      });

      if (res.ok) {
        showMessage("Category deleted successfully", true);
        fetchInvData();
        setSelectedCategoryId("");
      } else {
        const { error } = await res.json();
        showMessage(`Failed to delete category: ${error}`, false);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      showMessage("An error occurred while deleting the category", false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex fixed z-[200] top-0 flex-col p-5 w-screen h-screen items-center justify-center bg-[#00000040] backdrop-blur-[2px] ">
      <div className="pt-4 md:pt-4 p-7 md:p-10 mx-10 z-40 w-full max-w-[400px] h-[355px] md:h-[385px] md:max-w-[450px] overflow-auto hidden_scroll_bar bg-[#dfeaea] rounded-lg shadow-lg shadow-[#00000040] text-[#404040]">
        <div className="flex w-full justify-end sticky top-0">
          <button
            onClick={CloseForm}
            className="mr-[-15px] md:mr-[-25px] text-gray-600 flex justify-center items-center size-6 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <p className="font-bold text-lg md:text-xl pb-4 text-teal-700">
          Manage Categories
        </p>
        <div className="flex flex-col text-sm md:text-base gap-3 font-semibold">
          <div className="flex justify-between items-center text-white bg-teal-600 rounded-full p-1">
            <button
              onClick={handleAddClick}
              className={`py-1 px-3 ${
                isAdding
                  ? `bg-white text-teal-700`
                  : `hover:scale-[1.05] text-white`
              } rounded-full w-full`}
            >
              Add
            </button>
            <button
              onClick={handleEditClick}
              className={`py-1 px-3 ${
                isEditing
                  ? `bg-white text-teal-700`
                  : `hover:scale-[1.05] text-white`
              } rounded-full w-full`}
            >
              Edit
            </button>
            <button
              onClick={handleRemoveClick}
              className={`py-1 px-3 ${
                isRemoving
                  ? `bg-white text-teal-700`
                  : `hover:scale-[1.05] text-white`
              } rounded-full w-full`}
            >
              Remove
            </button>
          </div>
          {isAdding && (
            <div className="flex flex-col gap-4 text-xs md:text-sm font-normal p-2 px-4">
              <div className="flex flex-col gap-1">
                <p>Category Name</p>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div className="pt-2 flex justify-center">
                <button
                  disabled={loading}
                  onClick={handleAddCategory}
                  className={`py-2.5 bg-teal-600 w-3/5 rounded-full text-white hover:bg-teal-700 transition-all duration-200 text-sm font-semibold ${
                    loading && "cursor-not-allowed"
                  }`}
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          )}
          {isEditing && (
            <div className="flex flex-col gap-4 text-xs md:text-sm font-normal p-2 px-4">
              <div className="flex flex-col gap-1">
                <p>Select Category</p>
                <select
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  value={selectedCategoryId}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="">Choose Category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <p>New Name</p>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div className="pt-2 flex justify-center">
                <button
                  disabled={loading}
                  onClick={handleEditCategory}
                  className={`py-2.5 bg-teal-600 w-3/5 rounded-full text-white hover:bg-teal-700 transition-all duration-200 text-sm font-semibold ${
                    loading && "cursor-not-allowed"
                  }`}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          )}
          {isRemoving && (
            <div className="flex flex-col gap-4 text-xs md:text-sm font-normal p-2 px-4">
              <div className="flex flex-col gap-1">
                <p>Select Category</p>
                <select
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  value={selectedCategoryId}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="">Choose Category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-center">
                <button
                  disabled={loading}
                  onClick={handleDeleteCategory}
                  className={`py-2.5 bg-teal-600 w-3/5 rounded-full text-white hover:bg-teal-700 transition-all duration-200 text-sm font-semibold ${
                    loading && "cursor-not-allowed"
                  }`}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
