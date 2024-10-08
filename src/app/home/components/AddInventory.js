import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useDispatch } from "react-redux";
import { triggerNotification } from "@/redux/notificationThunk";

export default function Add_Inventory({ CloseForm, user, onSuccess }) {
  const [inventoryName, setInventoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const Dispatch = useDispatch();

  const [testUser, setTestUser] = useState("");
  useEffect(() => {
    user?.email === "test@invenzo.com" ? setTestUser(true) : setTestUser(false);
  }, [user]);

  const showMessage = (msg, state) => {
    Dispatch(
      triggerNotification({
        msg: msg,
        success: state,
      })
    );
  };
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const handleInputChange = (e) => {
    setInventoryName(e.target.value);
  };

  const addInventory = async (e) => {
    e.preventDefault();

    if (testUser) {
      showMessage("Unable to add. You are in view-only mode", false);
      CloseForm();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: inventoryName.trim(), adminId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || "Failed to add inventory", false);
        throw new Error("Failed to add inventory");
      }

      onSuccess();
      CloseForm(); // Close the form after successful submission
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex fixed z-[200] top-0 flex-col p-5 w-screen h-screen items-center  justify-center  bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="pt-4 md:pt-4 p-7 md:p-10 mx-10 z-40 w-full max-w-[400px] md:max-w-[450px] border border-gray-300 overflow-auto hidden_scroll_bar bg-[var(--form-bg)] rounded-lg shadow-lg shadow-[var(--shaddow)]">
        <div className="flex w-full justify-end sticky top-0 ">
          <button
            onClick={CloseForm}
            className="mr-[-15px] md:mr-[-25px] text-[var(--text-sec)] flex justify-center items-center size-6 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <p className="font-bold text-lg md:text-xl pb-4 text-[var(--form-heading)]">
          Add Inventory
        </p>
        {/* {error && <p className="text-red-500 text-xs mb-4">{error}</p>} */}
        <form
          className="space-y-3 text-xs md:text-sm text-gray-700"
          onSubmit={addInventory}
        >
          <div className="flex flex-col text-[var(--text-prim)]">
            <label className="mb-1 font-semibold">Inventory Name</label>
            <input
              type="text"
              value={inventoryName}
              onChange={handleInputChange}
              maxLength={50}
              className="px-3 py-2 border  border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 font-semibold text-white bg-[var(--btn-bg)] rounded-md hover:bg-[var(--btn-bg-sec)] focus:outline-none focus:ring-2 focus:ring-teal-600 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adding..." : "Add Inventory"}
          </button>
        </form>
      </div>
    </div>
  );
}
