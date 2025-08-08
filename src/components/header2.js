"use client";
import useAuthUser from "@/hooks/authUser";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import {
  MdAdd,
  MdCategory,
  MdCreditCard,
  MdDashboard,
  MdInventory,
  MdLogout,
  MdOutlineMenu,
  MdOutlineNotifications,
  MdSettings,
} from "react-icons/md";
import { toast } from "sonner";

export default function Header2() {
  const { user, userLoading, logout } = useAuthUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user && !userLoading) {
      router.replace("/login");
      toast.error("Please login to continue");
    }
  }, [user, userLoading]);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const defaultProfilePictureLink =
    "https://lh3.googleusercontent.com/pw/AP1GczM2cnSQPHG8oKKskeSFKCFjs3z_NG31Tt4bQPqb4Fp-Qdteh0m-84BjSvDgQTkscceDPu1eD1Rs2OxUSd0InRuqnowixs1x8kqSVIcu_7BbkBi4XFK13ZqIeq56OxPw0bzq0hoUgYtTHteuYB1cTI-K=w883-h883-s-no-gm";

  const handleButtonClick = (name) => {
    router.push(`/${name.toLowerCase().replace(/\s+/g, "-")}`);
  };

  const handleSettingsClick = () => {};

  const buttons = [
    {
      icon: <MdDashboard />,
      label: "Dashboard",
      onclick: () => handleButtonClick("Dashboard"),
    },
    {
      icon: <MdInventory />,
      label: "Inventory",
      onclick: () => handleButtonClick("Inventory"),
    },
    {
      icon: <MdAdd />,
      label: "Add Product",
      onclick: () => handleButtonClick("Add Product"),
    },
    {
      icon: <MdCategory />,
      label: "Categories",
      onclick: () => handleButtonClick("Categories"),
    },
    {
      icon: <FaUsers />,
      label: "Cashiers",
      onclick: () => handleButtonClick("Cashiers"),
    },
    {
      icon: <MdCreditCard />,
      label: "Sales",
      onclick: () => handleButtonClick("Sales"),
    },
    {
      icon: <MdSettings />,
      label: "Settings",
      onclick: () => handleSettingsClick(),
    },
  ];

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [sidebarOpen]);

  return (
    <div className="w-full px-4 md:px-6 py-3 sticky top-0 z-50 bg-white grid grid-cols-[2fr_1.3fr] gap-6">
      <div className="flex items-center gap-4">
        <MdOutlineMenu
          className="text-3xl cursor-pointer text-gray-600 "
          onClick={handleMenuClick}
        />
        <div className="flex items-center justify-center h-full">
          <img
            src="invenzo_logo.png"
            alt="logo"
            draggable={false}
            className="h-full aspect-auto object-contain  max-h-10 md:max-h-12"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 md:gap-5 text-2xl">
        <button className="">
          <MdOutlineNotifications />
        </button>
        <div className="h-10 md:h-14 cursor-pointer aspect-square rounded-full overflow-hidden">
          <img
            src={user?.profilePicture || defaultProfilePictureLink}
            draggable={false}
            alt="user"
            className={`w-full aspect-square object-cover rounded-full ${
              userLoading && "animate-pulse"
            }`}
          />
        </div>
        <button
          onClick={logout}
          className="rounded-lg flex items-center gap-2 bg-red-500 hover:bg-red-600 transition text-sm text-white px-2 md:px-4 py-2 "
        >
          <span className="hidden md:block">Logout</span> <MdLogout />
        </button>
      </div>

      {/* sidebar */}
      <div
        className={`fixed w-full h-full bg-black opacity-0 pointer-events-none ${
          sidebarOpen && "opacity-40 pointer-events-auto"
        } transition-all duration-300 `}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        className={`fixed left-0 w-[60%] max-w-[400px] h-full bg-white shadow-lg shadow-black/30 z-50 flex flex-col gap-12 p-3 md:p-4 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between gap-4">
          <img
            src="invenzo_logo.png"
            alt="logo"
            className="h-9 md:h-12 aspect-auto"
          />
        </div>
        <div className="flex flex-col">
          {buttons.map((button, index) => (
            <button
              key={index}
              className="flex items-center gap-4 px-3 py-3  md:px-4 md:py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={button.onclick}
            >
              <span className="text-lg md:text-xl">{button.icon}</span>
              <span className="text-sm md:text-base">{button.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
