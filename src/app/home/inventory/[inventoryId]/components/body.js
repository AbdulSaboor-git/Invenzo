import React, { useEffect, useState } from "react";
import Left_Side from "./left_side";
import Right_Side from "./right_side";
import Edit_Product_Form from "./edit_product";
import { triggerNotification } from "@/redux/notificationThunk";
import { useDispatch, useSelector } from "react-redux";
import Confirmation_dialogue from "@/components/confirmation_dialogue";

export default function Body({
  buttons,
  inventoryId,
  role,
  user,
  setLoading,
  categories,
  products,
  loadingData,
  fetchInvData,
  userId,
  networkError,
}) {
  const [editItemForm_isOpen, set_editItemForm_isOpen] = useState(false);
  const Dispatch = useDispatch();
  // const categories = useSelector((state) => state.categories);
  const [prod, setProd] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [testUser, setTestUser] = useState("");
  useEffect(() => {
    user?.email === "test@invenzo.com" ? setTestUser(true) : setTestUser(false);
  }, [user]);

  const openDialog = (e) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const confirmDelete = (prodId) => {
    handleDeleteClick(prodId);
    closeDialog();
  };

  const showMessage = (msg, state) => {
    Dispatch(
      triggerNotification({
        msg: msg,
        success: state,
      })
    );
  };

  const openEditForm = (e) => {
    e.stopPropagation();
    set_editItemForm_isOpen(true);
  };
  const closeEditForm = () => {
    set_editItemForm_isOpen(false);
  };

  const handleDeleteClick = async (id) => {
    if (testUser) {
      showMessage("Unable to delete. You are in view-only mode", false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/inventory/${inventoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, true);
        fetchInvData();
      } else {
        showMessage(data.error || "Error deleting product", false);
      }
    } catch (error) {
      showMessage("Error deleting product", false);
    } finally {
      setLoading(false);
    }
  };

  const onEdit = () => {
    showMessage("Product updated successfully!", true);
    fetchInvData();
  };

  return (
    <div className="flex flex-col items-center p-6 pt-2 z-[200]">
      <div className="flex justify-center w-full max-w-[1200px] gap-4">
        <div className="hidden md:flex-[2] md:block">
          <Left_Side buttons={buttons} />
        </div>
        <div className="w-[2px] bg-[var(--shaddow)] border-none hidden md:block"></div>
        <div className="w-full md:flex-[5]">
          <Right_Side
            products={products}
            categories={categories}
            role={role}
            openEditForm={openEditForm}
            handleDeleteClick={openDialog}
            setProd={setProd}
            loadingData={loadingData}
            userId={userId}
            networkError={networkError}
          />
        </div>
      </div>
      {editItemForm_isOpen && (
        <Edit_Product_Form
          CloseForm={closeEditForm}
          categories={categories}
          invId={inventoryId}
          onSuccess={onEdit}
          product={prod}
          user={user}
        />
      )}
      {isDialogOpen && (
        <Confirmation_dialogue
          isOpen={isDialogOpen}
          title="Confirm Delete"
          message="Are you sure you want to delete this item?"
          onConfirm={() => confirmDelete(prod.id)}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
