'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaFileInvoice, FaUsers } from 'react-icons/fa';
import { IoAddCircle, IoLockClosed } from 'react-icons/io5';
import {
  MdCategory,
  MdDashboard,
  MdInventory,
  MdOutlineMenu,
  MdSettings,
} from 'react-icons/md';
import UserProfile from './user_profile';
import usePreferences from '@/hooks/usePreferences';
import { BsShieldLockFill } from 'react-icons/bs';
import { useSelector } from 'react-redux';

export default function Header({ className }) {
  const { user } = useSelector((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();
  const prefs = usePreferences(user?.id, user?.role);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const defaultProfilePictureLink = 'default.png';

  let profilePicture = user?.profilePicture || defaultProfilePictureLink;

  const handleButtonClick = (name) => {
    router.push(`/${name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const logo = '/invenzo_logo.png';

  const buttons = [];
  user?.role !== 'cashier' &&
    buttons.push({
      icon: <MdDashboard />,
      label: 'Dashboard',
      onclick: () => handleButtonClick('Dashboard'),
    });

  buttons.push({
    icon: <MdInventory />,
    label: 'Inventory',
    onclick: () => handleButtonClick('Inventory'),
  });

  // user?.role != 'cashier' &&
  prefs.addProduct &&
    buttons.push({
      icon: <IoAddCircle />,
      label: 'Add Product',
      onclick: () => handleButtonClick('Add Product'),
    });

  prefs.allowCategoryManagement &&
    buttons.push({
      icon: <MdCategory />,
      label: 'Categories',
      onclick: () => handleButtonClick('Categories'),
    });

  user?.role !== 'cashier' &&
    buttons.push({
      icon: <FaUsers />,
      label: 'Cashiers',
      onclick: () => handleButtonClick('Cashiers'),
    });

  prefs.viewSalesData &&
    buttons.push({
      icon: <FaFileInvoice />,
      label: 'Sales',
      onclick: () => handleButtonClick('Sales'),
    });

  user?.role === 'superadmin' &&
    buttons.push({
      icon: <BsShieldLockFill />,
      label: `Super-Admin Panel`,
      onclick: () => handleButtonClick('super-admin'),
      locked: prefs.requireSuperAdminPassword,
    });

  user?.role !== 'cashier' &&
    buttons.push({
      icon: <MdSettings />,
      label: `Settings`,
      onclick: () => handleButtonClick('Settings'),
      locked: prefs.requireSettingsPassword,
    });
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [sidebarOpen]);

  return (
    <div
      className={` ${className} w-full px-4 pt-4 pb-3 md:px-6 sticky top-0 z-50 bg-white grid grid-cols-[2fr_1.3fr] gap-6`}
    >
      <div className="flex items-center gap-4">
        <MdOutlineMenu
          size={30}
          className="text-3xl cursor-pointer text-gray-600 "
          onClick={handleMenuClick}
        />
        <div className="flex items-center justify-center h-full">
          <img
            src={logo}
            alt="logo"
            draggable={false}
            className="h-full aspect-auto object-contain  max-h-10 md:max-h-12"
          />
        </div>
      </div>

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

      {/* sidebar */}
      <div
        className={`fixed inset-0 text-sm bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-50 px-4 sm:px-6 transition-all duration-300 ease-in-out ${
          sidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        className={`fixed left-0 w-[70%] max-w-[400px] h-full bg-white shadow-lg shadow-black/30 z-50 flex flex-col gap-12 px-3 py-5 md:px-4 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
              className="flex items-center justify-start gap-1 px-3 py-3  md:px-4 md:py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={button.onclick}
            >
              <span className="text-lg md:text-xl">{button.icon}</span>
              <span className="text-sm md:text-base ml-3">{button.label}</span>
              {button.locked && <IoLockClosed />}
            </button>
          ))}
        </div>
      </div>
      <UserProfile
        user={user}
        CloseForm={() => setShowProfile(false)}
        showProfile={showProfile}
      />
    </div>
  );
}
