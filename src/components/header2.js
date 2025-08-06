"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  MdAdd,
  MdCategory,
  MdCreditCard,
  MdDashboard,
  MdInventory,
  MdOutlineMenu,
  MdOutlineMenuOpen,
  MdOutlineNotifications,
  MdOutlineSettings,
  MdSettings,
} from "react-icons/md";

export default function Header2() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleButtonClick = (name) => {
    router.push(`/${name.toLowerCase().replace(/\s+/g, "-")}`);
  };

  const buttons = [
    {
      icon: <MdDashboard />,
      label: "Dashboard",
      onclick: () => handleButtonClick("Dashboard"),
    },
    {
      icon: <MdInventory />,
      label: "Products Listing",
      onclick: () => handleButtonClick("Products Listing"),
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
      icon: <MdCreditCard />,
      label: "Sales",
      onclick: () => handleButtonClick("Sales"),
    },
    {
      icon: <MdSettings />,
      label: "Settings",
      onclick: () => handleButtonClick("Settings"),
    },
  ];

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Clean up just in case
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [sidebarOpen]);

  return (
    <div className="w-full px-4 md:px-6 py-3 sticky top-0 z-50 bg-white grid grid-cols-2 gap-5">
      <div className="flex items-center gap-4">
        <MdOutlineMenu
          className="text-3xl cursor-pointer text-gray-600 "
          onClick={handleMenuClick}
        />
        <div className="h-full">
          <img
            src="invenzo_logo.png"
            alt="logo"
            className="h-full aspect-auto object-contain max-h-12"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 md:gap-5 text-2xl">
        <button className="">
          <MdOutlineSettings />
        </button>
        <button className="">
          <MdOutlineNotifications />
        </button>
        <div className="h-9 md:h-10 aspect-square border-2 border-white bg-orange-500 rounded-full"></div>
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
            className="h-8 md:h-10 aspect-auto"
          />
          <MdOutlineMenuOpen
            className="text-2xl md:text-3xl cursor-pointer text-gray-600"
            onClick={handleMenuClick}
          />
        </div>
        <div className="flex flex-col">
          {buttons.map((button, index) => (
            <button
              key={index}
              className="flex items-center gap-4 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
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
