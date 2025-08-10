"use client";
import useAuthUser from "@/hooks/authUser";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaFileInvoice, FaUsers } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import {
  MdCategory,
  MdDashboard,
  MdInventory,
  MdLogout,
  MdOutlineMenu,
  MdSettings,
} from "react-icons/md";
import { toast } from "sonner";
import UserProfile from "./user_profile";

export default function Header() {
  const { user, logout } = useAuthUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const defaultProfilePictureLink = "default.png";

  let profilePicture = user?.profilePicture || defaultProfilePictureLink;

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
      icon: <IoAddCircle />,
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
      icon: <FaFileInvoice />,
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
    <div className="w-full px-4 pt-4 pb-3 md:px-6 sticky top-0 z-50 bg-white grid grid-cols-[2fr_1.3fr] gap-6">
      <div className="flex items-center gap-4">
        {user && (
          <MdOutlineMenu
            className="text-3xl cursor-pointer text-gray-600 "
            onClick={handleMenuClick}
          />
        )}
        <div className="flex items-center justify-center h-full">
          <img
            src="invenzo_logo.png"
            alt="logo"
            draggable={false}
            className="h-full aspect-auto object-contain  max-h-10 md:max-h-12"
          />
        </div>
      </div>

      {user && (
        <div className="flex items-center justify-end gap-3 md:gap-5 text-2xl">
          <div className="h-10 md:h-14 cursor-pointer aspect-square rounded-full overflow-hidden">
            <img
              src={profilePicture}
              draggable={false}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfilePictureLink;
              }}
              onClick={() => setShowProfile(true)}
              alt="user"
              className={`w-full aspect-square object-cover rounded-full `}
            />
          </div>
        </div>
      )}

      {/* sidebar */}
      <div
        className={`fixed inset-0 text-sm bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-50 px-4 sm:px-6 transition-all duration-300 ease-in-out ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        className={`fixed left-0 w-[60%] max-w-[400px] h-full bg-white shadow-lg shadow-black/30 z-50 flex flex-col gap-12 px-3 py-5 md:px-4 ${
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
      <UserProfile
        user={user}
        logout={logout}
        CloseForm={() => setShowProfile(false)}
        showProfile={showProfile}
      />
    </div>
  );
}
