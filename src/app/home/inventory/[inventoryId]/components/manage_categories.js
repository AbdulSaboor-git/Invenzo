import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { useDispatch } from "react-redux";
import { triggerNotification } from "@/redux/notificationThunk";
import Confirmation_dialogue from "@/components/confirmation_dialogue";

export default function ManageCategories({
  CloseForm,
  inventoryId,
  categories,
  user,
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

  const [testUser, setTestUser] = useState("");
  useEffect(() => {
    user?.email === "test@invenzo.com" ? setTestUser(true) : setTestUser(false);
  }, [user]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = (e) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
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
    if (testUser) {
      showMessage("Unable to add. You are in view-only mode", false);
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
    if (testUser) {
      showMessage("Unable to edit. You are in view-only mode", false);
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

  const handleDeleteCategory = () => {
    DeleteCategory();
    closeDialog();
  };

  const DeleteCategory = async () => {
    if (!selectedCategoryId) {
      showMessage("Please select a category to delete", false);
      return;
    }

    if (testUser) {
      showMessage("Unable to delete. You are in view-only mode", false);
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
    <div className="flex fixed z-[200] top-0 flex-col p-5 w-screen h-screen items-center justify-center  bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="pt-6 md:pt-6 p-10 md:p-11 mx-10 z-40 w-full max-w-[400px] md:max-w-[450px] overflow-auto hidden_scroll_bar border border-gray-300 bg-[var(--form-bg)] rounded-lg shadow-lg shadow-[var(--shaddow)] text-[var(--text-prim)]">
        <div className="flex w-full justify-end ">
          <button
            onClick={CloseForm}
            className="mr-[-25px] mt-[-10px]  md:mr-[-30px] text-[var(--text-sec)] flex justify-center items-center size-6 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <p className="font-bold text-lg md:text-xl pb-4 text-[var(--form-heading)]">
          Manage Categories
        </p>
        <div className="flex flex-col text-sm md:text-base gap-3 font-semibold">
          <div className="flex justify-between items-center text-white bg-[var(--btn-bg)] rounded-full p-1">
            <button
              onClick={handleAddClick}
              className={`py-1 px-3 duration-75 ${
                isAdding
                  ? `bg-white text-[var(--btn-bg)]`
                  : `hover:scale-[1.05] text-white`
              } rounded-full w-full`}
            >
              Add
            </button>
            <button
              onClick={handleEditClick}
              className={`py-1 px-3 duration-75 ${
                isEditing
                  ? `bg-white text-[var(--btn-bg)]`
                  : `hover:scale-[1.05] text-white`
              } rounded-full w-full`}
            >
              Edit
            </button>
            <button
              onClick={handleRemoveClick}
              className={`py-1 px-3 duration-75 ${
                isRemoving
                  ? `bg-white text-[var(--btn-bg)]`
                  : `hover:scale-[1.05] text-white`
              } rounded-full w-full`}
            >
              Delete
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
                  maxLength={30}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
                />
              </div>
              <div className="pt-2 flex justify-center">
                <button
                  disabled={loading}
                  onClick={handleAddCategory}
                  className={`py-2.5 bg-[var(--btn-bg)] w-3/5 rounded-full text-white hover:bg-[var(--btn-bg-sec)]  text-sm font-semibold ${
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
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
                  maxLength={30}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
                />
              </div>
              <div className="pt-2 flex justify-center">
                <button
                  disabled={loading}
                  onClick={handleEditCategory}
                  className={`py-2.5 bg-[var(--btn-bg)] w-3/5 rounded-full text-white hover:bg-[var(--btn-bg-sec)]  text-sm font-semibold ${
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
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
                  onClick={openDialog}
                  className={`py-2.5 bg-[var(--btn-bg)] w-3/5 rounded-full text-white hover:bg-[var(--btn-bg-sec)]  text-sm font-semibold ${
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
      {isDialogOpen && (
        <Confirmation_dialogue
          isOpen={isDialogOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this category?"
          onConfirm={handleDeleteCategory}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
