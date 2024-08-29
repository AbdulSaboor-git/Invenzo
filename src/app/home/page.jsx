// user.js
"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Confirmation_dialogue from "@/components/confirmation_dialogue";
import AddInventory from "./components/AddInventory";
import EditInventory from "./components/editInventory";
import { useRouter } from "next/navigation";
import useAuthUser from "@/hooks/authUser";
import { triggerNotification } from "@/redux/notificationThunk";
import { useDispatch } from "react-redux";
import Loader from "@/components/loader";
import {
  MdAdd,
  MdDelete,
  MdDriveFileRenameOutline,
  MdLogout,
  MdMoreVert,
  MdSettings,
} from "react-icons/md";
import Preferences from "@/components/preferences";
import LoaderSmall from "@/components/loader_small";

export default function HomePage() {
  const [ButtonId, setButtonId] = useState(null);
  const [AddInventory_isOpen, set_AddInventory_isOpen] = useState(false);
  const [editInv, setEditInv] = useState(null);
  const [myInventories, setMyInventories] = useState([]);
  const [moderatedInventories, setModeratedInventories] = useState([]);
  const router = useRouter();
  const { user, userLoading, logout } = useAuthUser();
  const [loadingInventories, setLoadingInventories] = useState(true);
  const [loading, setLoading] = useState(false);
  const Dispatch = useDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [preferences_isOpen, set_preferences_IsOpen] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const savedPreferences = JSON.parse(
        localStorage.getItem(`preferences_${user.id}`)
      );
      if (!savedPreferences) {
        const preferences = {
          add_edit_del: true,
          pp: true,
          categ: true,
          dateAdd: true,
          dateUpdate: true,
          theme: true,
        };
        localStorage.setItem(
          `preferences_${user.id}`,
          JSON.stringify(preferences)
        );
      }
    }
  }, [user]);

  const openPreferences = () => {
    set_preferences_IsOpen(true);
  };

  const clossePreferences = () => {
    set_preferences_IsOpen(false);
  };

  const openDialog = (e) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const confirmDelete = (invId) => {
    handleDeleteClick(invId);
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
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  const fetchInventories = async () => {
    if (user) {
      try {
        setLoadingInventories(true);
        // Fetch inventories where the user is an admin
        const myInvResponse = await fetch(`/api/inventory?adminId=${user.id}`);
        const myInvData = await myInvResponse.json();
        setMyInventories(myInvData.inventories);
        localStorage.setItem("myInv", JSON.stringify(myInvData.inventories));

        // Fetch inventories where the user is a moderator
        const modInvResponse = await fetch(
          `/api/inventory?moderatorId=${user.id}`
        );
        const modInvData = await modInvResponse.json();
        setModeratedInventories(modInvData.inventories);
        localStorage.setItem("modInv", JSON.stringify(modInvData.inventories));
      } catch (error) {
        console.error("Error fetching inventories:", error);
      } finally {
        setLoadingInventories(false);
      }
    }
  };

  useEffect(() => {
    fetchInventories();
  }, [user]);

  if (userLoading || !user) {
    return <Loader />;
  }

  // const refreshInventories = async () => {
  //   try {
  //     setLoadingInventories(true);

  //     const myInvResponse = await fetch(`/api/inventory?adminId=${user.id}`);
  //     const myInvData = await myInvResponse.json();
  //     setMyInventories(myInvData.inventories);
  //   } catch (error) {
  //     console.error("Error refreshing inventories:", error);
  //   } finally {
  //     setLoadingInventories(false);
  //   }
  // };

  const onAdd = async () => {
    fetchInventories();
    showMessage("Inventory created successfully!", true);
  };

  const onEdit = async (msg) => {
    fetchInventories();
    showMessage("Inventory updated successfully!", true);
  };

  const toggle_editButtons = (id) => {
    setButtonId((prevId) => (prevId === id ? null : id));
  };

  const handleOpenInventory = (invId) => {
    router.push(`/home/inventory/${invId}`);
  };

  const open_AddInventory = () => {
    set_AddInventory_isOpen(true);
  };

  const close_AddInventory = () => {
    set_AddInventory_isOpen(false);
  };

  const open_Editorm = (inv) => {
    setEditInv(inv);
  };

  const close_Editorm = () => {
    setEditInv(null);
  };

  const handleDeleteClick = async (id) => {
    try {
      setLoading(true);
      const response = await fetch("/api/inventory", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();

      if (response.ok) {
        setMyInventories(myInventories.filter((inv) => inv.id !== id));
        showMessage(data.message, true);
      } else {
        showMessage(data.error || "Error deleting inventory", false);
      }
    } catch (error) {
      showMessage(data.error, false);
    } finally {
      setLoading(false);
    }
  };

  const Buttons = [
    {
      btn_name: "Create an Inventory",
      icon: <MdAdd />,
      clickEvent: open_AddInventory,
    },
    {
      btn_name: "Logout",
      icon: <MdLogout />,
      clickEvent: logout,
    },
  ];

  return (
    <div className={`flex min-h-screen flex-col items-center`}>
      {loading && <Loader />}
      <div className="max-w-[1400px] w-full">
        <Header
          user={user}
          Buttons={Buttons}
          logout={logout}
          openPreferences={openPreferences}
        />
        <div className="hidden md:flex md:gap-3 justify-end w-full items-center pt-8  px-4 max-w-[1200px]">
          {Buttons.map((btn, index) => (
            <button
              onClick={btn.clickEvent}
              style={{ boxShadow: "inset 0 0 10px #00443d" }}
              className="bg-teal-600 hover:bg-teal-700 hover:scale-x-[1.01] text-sm transition-transform duration-200 ease-in-out text-white text-[11px] py-3 px-6 rounded-2xl"
              key={index}
            >
              <div className="flex gap-4 items-center justify-start">
                {btn.icon}
                {btn.btn_name}
              </div>
            </button>
          ))}
          <button
            onClick={openPreferences}
            style={{ boxShadow: "inset 0 0 10px #00443d" }}
            className="bg-teal-600 hover:bg-teal-700 hover:scale-x-[1.01] text-sm transition-transform duration-200 ease-in-out text-white text-[11px] py-3 px-6 rounded-2xl"
          >
            <div className="flex gap-4 items-center justify-start">
              <MdSettings />
              Preferences
            </div>
          </button>
        </div>
        <div className="flex flex-wrap w-full max-w-[1200px] justify-center items-center text-center py-8 px-4 gap-8">
          <div
            className="w-full max-w-[520px] px-6 py-8 rounded-2xl bg-teal-600"
            style={{ boxShadow: "inset 0 0 14px 6px #00443d" }}
          >
            <p className="font-bold text-lg md:text-xl pb-3 text-white text-left">
              My Inventories
            </p>
            <div className="flex flex-col mx-5">
              {loadingInventories ? (
                <LoaderSmall />
              ) : !myInventories?.length ? (
                <div className="text-gray-300 text-xs">
                  <p>{"(Empty)"}</p>
                </div>
              ) : (
                myInventories.map((inv) => (
                  <div
                    onClick={() => handleOpenInventory(inv.id)}
                    key={inv.id}
                    className={`my-1 relative py-3 px-6 cursor-pointer text-sm md:text-base bg-white text-teal-700 rounded-lg transition-transform duration-200 ease-in-out shadow-md shadow-[#00000044] hover:scale-[1.005]`}
                  >
                    <div
                      className={`absolute right-1 p-2 hover:scale-[1.1] top-2 ${
                        ButtonId === inv.id ? "text-white" : "text-teal-700"
                      } z-10`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle_editButtons(inv.id);
                      }}
                    >
                      <MdMoreVert />
                    </div>
                    {ButtonId === inv.id && (
                      <div className="absolute bg-teal-600 bg-opacity-70 right-2 rounded-s-full top-[6px] md:top-2 px-3 pr-8 flex items-center text-[16px] text-white">
                        <button
                          className="hover:text-green-300 p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            open_Editorm(inv);
                          }}
                        >
                          <MdDriveFileRenameOutline />
                        </button>
                        <button
                          className="hover:text-red-300 p-2"
                          onClick={(e) => openDialog(e)}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    )}
                    {inv.name}
                  </div>
                ))
              )}
            </div>
          </div>
          {isDialogOpen && (
            <Confirmation_dialogue
              isOpen={isDialogOpen}
              title="Confirm Delete"
              message="Are you sure you want to delete this item?"
              onConfirm={() => confirmDelete(ButtonId)}
              onCancel={closeDialog}
            />
          )}
          <div
            className="w-full max-w-[520px] px-6 py-8 rounded-2xl bg-teal-600"
            style={{ boxShadow: "inset 0 0 14px 6px #00443d" }}
          >
            <p className="font-bold text-lg md:text-xl pb-3 text-white text-left">
              Moderated Inventories
            </p>

            <div className="flex flex-col mx-5">
              {loadingInventories ? (
                <LoaderSmall />
              ) : !moderatedInventories?.length ? (
                <div className="text-gray-300 text-xs">
                  <p>{"(Empty)"}</p>
                </div>
              ) : (
                moderatedInventories.map((inv) => (
                  <div
                    onClick={() => handleOpenInventory(inv.id)}
                    key={inv.id}
                    className={`my-1 relative py-3 px-6 text-sm md:text-base cursor-pointer bg-white text-teal-700 rounded-lg transition-transform duration-200 ease-in-out shadow-md shadow-[#00000044] hover:scale-[1.005]`}
                  >
                    {inv.name}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
      {AddInventory_isOpen && (
        <AddInventory
          CloseForm={close_AddInventory}
          user={user}
          onSuccess={onAdd}
        />
      )}
      {editInv && (
        <EditInventory
          CloseForm={close_Editorm}
          inv={editInv}
          onSuccess={onEdit}
        />
      )}
      {preferences_isOpen && (
        <Preferences CloseForm={clossePreferences} userId={user.id} />
      )}
    </div>
  );
}
