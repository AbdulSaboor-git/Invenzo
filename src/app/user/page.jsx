"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AddInventory from "./components/AddInventory";
import EditInventory from "./components/editInventory";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import useAuthUser from "@/hooks/authUser";
import {
  MdDelete,
  MdDriveFileRenameOutline,
  MdLogout,
  MdMenu,
  MdMenuOpen,
} from "react-icons/md";

export default function HomePage() {
  const [ButtonId, setButtonId] = useState(null);
  const [AddInventory_isOpen, set_AddInventory_isOpen] = useState(false);
  const [editInv, setEditInv] = useState(null);
  const router = useRouter();
  const { user, userLoading, logout } = useAuthUser();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return null;
  }

  const toggle_editButtons = (id) => {
    setButtonId((prevId) => (prevId === id ? null : id));
  };

  const handleOpenInventory = () => {
    router.push(`user/inventory`);
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

  const MyInventories = [
    {
      id: 0,
      name: "A",
      onClick: handleOpenInventory,
    },
    {
      id: 1,
      name: "B",
      onClick: handleOpenInventory,
    },
    {
      id: 2,
      name: "C",
      onClick: handleOpenInventory,
    },
  ];

  const ModeratedInventories = [
    {
      id: 4,
      name: "M",
      onClick: handleOpenInventory,
    },
    {
      id: 5,
      name: "N",
      onClick: handleOpenInventory,
    },
    {
      id: 6,
      name: "P",
      onClick: handleOpenInventory,
    },
  ];

  const Buttons = [
    {
      btn_name: "Create an Inventory",
      icon: <FaPlus />,
      clickEvent: open_AddInventory,
    },
    {
      btn_name: "Logout",
      icon: <MdLogout />,
      clickEvent: logout,
    },
  ];

  const handleDeleteClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={`flex min-h-screen flex-col items-center`}>
      <div className="max-w-[1400px] w-full ">
        <Header user={user} Buttons={Buttons} />
        <div className="hidden md:flex justify-end w-full items-center px-4 pt-8 max-w-[1200px]">
          {Buttons.map((btn, index) => (
            <button
              onClick={btn.clickEvent}
              style={{ boxShadow: "inset 0 0 10px #00443d" }}
              className="bg-teal-600 hover:bg-teal-700  hover:scale-x-[1.01] text-sm transition-transform duration-200 ease-in-out text-white text-[11px] py-3 px-6 rounded-2xl"
              key={index}
            >
              <div className="flex gap-4 items-center justify-start">
                {btn.icon}
                {btn.btn_name}
              </div>
            </button>
          ))}
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
              {MyInventories.map((inv) => (
                <div
                  onClick={inv.onClick}
                  key={inv.id}
                  className={`my-1 relative py-3 px-4 cursor-pointer bg-white text-teal-700 rounded-lg transition-transform duration-200 ease-in-out shadow-md shadow-[#00000044] hover:scale-[1.005]`}
                >
                  <div
                    className={`absolute right-2 p-2 hover:scale-[1.1] top-2 ${
                      ButtonId === inv.id ? "text-white" : "text-teal-700"
                    } z-10`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle_editButtons(inv.id);
                    }}
                  >
                    {ButtonId === inv.id ? <MdMenuOpen /> : <MdMenu />}
                  </div>
                  {ButtonId === inv.id && (
                    <div className="absolute bg-teal-600 right-2 rounded-s-full top-2 px-3 pr-8 flex items-center  text-[16px] text-white">
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
                        className="hover:text-red-300 p-2 "
                        onClick={handleDeleteClick}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  )}
                  {inv.name}
                </div>
              ))}
            </div>
          </div>
          <div
            className="w-full max-w-[520px] px-6 py-8 rounded-2xl bg-teal-600"
            style={{ boxShadow: "inset 0 0 14px 6px #00443d" }}
          >
            <p className="font-bold text-lg md:text-xl pb-3 text-white text-left">
              Moderated Inventories
            </p>

            <div className="flex flex-col mx-5">
              {ModeratedInventories.map((inv) => (
                <div
                  onClick={inv.onClick}
                  key={inv.id}
                  className={`my-1 cursor-pointer relative py-3 px-4 bg-white text-teal-700 rounded-lg transition-transform duration-200 ease-in-out shadow-md shadow-[#00000044] hover:scale-[1.005]`}
                >
                  <div
                    className="absolute right-4  pt-1 "
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle_editButtons(inv.id);
                    }}
                  >
                    {<MdMenu />}
                  </div>
                  {ButtonId === inv.id && (
                    <div className="absolute right-12  flex gap-3 items-center pt-[3px] text-[16px] text-gray-500">
                      <button
                        className="hover:text-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          open_Editorm(inv);
                        }}
                      >
                        <MdDriveFileRenameOutline />
                      </button>

                      <button
                        className="hover:text-red-600"
                        onClick={handleDeleteClick}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  )}
                  {inv.name}
                </div>
              ))}
            </div>
          </div>
          {AddInventory_isOpen && (
            <AddInventory CloseForm={close_AddInventory} />
          )}
          {editInv && <EditInventory CloseForm={close_Editorm} inv={editInv} />}
        </div>
        <Footer />
      </div>
    </div>
  );
}
