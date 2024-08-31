import React, { useEffect, useState } from "react";
import { MdClose, MdInfoOutline } from "react-icons/md";
import { useDispatch } from "react-redux";
import { triggerNotification } from "@/redux/notificationThunk";
import Confirmation_dialogue from "@/components/confirmation_dialogue";

export default function Manage_Moderators({
  CloseForm,
  moderators,
  refreshModerators,
  inventoryId,
  adminEmail,
}) {
  const [loading, setLoading] = useState(false);
  const [infoBox_visible, setInfoBox_visible] = useState(false);

  const dispatch = useDispatch();
  const showMessage = (msg, state) => {
    dispatch(
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

  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = (e) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const [add_M, set_add_M] = useState(true);
  const [remove_M, set_remove_M] = useState(false);

  const add_clicked = () => {
    set_add_M(true);
    set_remove_M(false);
  };

  const remove_clicked = () => {
    set_add_M(false);
    set_remove_M(true);
  };

  function handleAddModerator() {
    const moderatorNameInput = document.getElementById("name");
    const moderatorEmailInput = document.getElementById("email");

    const moderatorName = moderatorNameInput.value.trim();
    const moderatorEmail = moderatorEmailInput.value.trim().toLowerCase();

    if (!moderatorName) {
      showMessage("Please enter the moderator's name", false);
      return;
    }

    if (adminEmail === moderatorEmail) {
      showMessage("Cannot add yourself as moderator of your inventory", false);
      return;
    }

    if (!moderatorEmail) {
      showMessage("Please enter the moderator's email", false);
      return;
    }

    setLoading(true);

    fetch(`/api/inventory/${inventoryId}/moderators`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: moderatorName,
        email: moderatorEmail,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showMessage(data.error, false);
        } else {
          showMessage(data.message, true);
          refreshModerators(); // Refresh the list of moderators
          moderatorNameInput.value = ""; // Clear the input field
          moderatorEmailInput.value = ""; // Clear the input field
        }
      })
      .catch((err) => {
        showMessage("Failed to add moderator", false);
        console.error("Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function RemoveModerator() {
    const moderatorId = document.querySelector("select").value;
    if (!moderatorId) {
      showMessage("Please select a moderator to delete", false);
      return;
    }
    setLoading(true);
    fetch(`/api/inventory/${inventoryId}/moderators`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        moderatorId: moderatorId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showMessage(data.error, false);
        } else {
          showMessage(data.message, true);
          refreshModerators(); // Refresh the list of moderators
          document.querySelector("select").value = ""; // Clear the select field
        }
      })
      .catch((err) => {
        showMessage("Failed to remove moderator", false);
        console.error("Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleRemoveModerator() {
    RemoveModerator();
    closeDialog();
  }

  return (
    <div className="flex fixed z-[200] top-0 flex-col p-5 w-screen h-screen items-center justify-center bg-[#00000040] backdrop-blur-[2px]">
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
          Manage Moderators
        </p>
        <div className="flex flex-col text-sm md:text-base gap-3 font-semibold">
          <div className="flex justify-between items-center text-white bg-[var(--btn-bg)] rounded-full p-1">
            <button
              onClick={add_clicked}
              className={`py-1 px-3 duration-75 ${
                add_M
                  ? `bg-white text-[var(--btn-bg)]`
                  : `hover:scale-[1.05] text-white`
              }  rounded-full w-full`}
            >
              Add
            </button>
            <button
              onClick={remove_clicked}
              className={`py-1 px-3 duration-75 ${
                remove_M
                  ? `bg-white text-[var(--btn-bg)]`
                  : `hover:scale-[1.05] text-white`
              }  rounded-full w-full`}
            >
              Remove
            </button>
          </div>
          {add_M && (
            <div className="flex flex-col gap-4 text-xs md:text-sm font-normal p-2 px-4">
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 items-center">
                  <label>Moderator&apos;s First Name</label>
                  <MdInfoOutline
                    className="text-[var(--shaddow)]"
                    onMouseEnter={showInfoBox}
                    onMouseLeave={hideInfoBox}
                    onClick={showInfoBox}
                  />
                  {infoBox_visible && (
                    <div className="absolute rounded-md px-2 py-[2px] border text-[#717171] border-[#a0a0a094] bg-white shadow-md shadow-[#0004] ml-[154px] mb-7 text-[10px]">
                      Case Sensitive
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  id="name"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label>Moderator&apos;s Email</label>
                <input
                  id="email"
                  type="email"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
                  required
                />
              </div>
              <div className="pt-2 flex justify-center">
                <button
                  disabled={loading}
                  onClick={handleAddModerator}
                  className={`py-2.5 bg-[var(--btn-bg)] w-3/5 rounded-full text-white hover:bg-[var(--btn-bg-sec)] transition-all duration-200 text-sm font-semibold ${
                    loading && "cursor-not-allowed"
                  }`}
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          )}
          {remove_M && (
            <div className="flex flex-col gap-4 text-xs md:text-sm font-normal  p-2 px-4">
              <div className="flex flex-col gap-1">
                <p>Select a Moderator</p>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
                  required
                >
                  <option value="">Select a Moderator</option>
                  {moderators?.map((moderator) => (
                    <option key={moderator.id} value={moderator.id}>
                      {moderator.user.firstName +
                        " " +
                        moderator.user.lastName +
                        " - (" +
                        moderator.user.email +
                        ")"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-center">
                <button
                  disabled={loading}
                  onClick={openDialog}
                  className={`py-2.5 bg-[var(--btn-bg)] w-3/5 rounded-full text-white hover:bg-[var(--btn-bg-sec)] transition-all duration-200 text-sm font-semibold ${
                    loading && "cursor-not-allowed"
                  }`}
                >
                  {loading ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isDialogOpen && (
        <Confirmation_dialogue
          isOpen={isDialogOpen}
          title="Confirm Removal"
          message="Are you sure you want to remove this moderator?"
          onConfirm={handleRemoveModerator}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
