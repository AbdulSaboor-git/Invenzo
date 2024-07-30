"use client";
import React, { useState } from "react";
import { MdClose, MdMenu, MdSettings } from "react-icons/md";

export default function Header({ buttons, user }) {
  const [first_btn, ...Buttons] = buttons;
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative flex justify-center items-center p-4 pt-10 z-50">
      <div className="absolute left-4 top-4 md:hidden">
        <button onClick={toggleSidebar} className="text-2xl text-[#272727]">
          <MdMenu />
        </button>
      </div>

      <div
        className={`fixed top-0 left-[-10px] w-[230px] h-full rounded-e-[30px] bg-white transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-[240px]"
        }`}
        style={{ boxShadow: "0 0 20px -5px #404040" }}
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 text-xl text-[#272727]"
        >
          <MdClose style={{ fontSize: "1.5rem" }} />
        </button>
        <div className="flex flex-col items-start p-6">
          <div className=" flex flex-col justify-center items-center text-[#404040] font-[500] text-[12px]">
            <img
              className="w-[60px] h-[60px]"
              src={user.profile_pic}
              alt="avatar"
            />
            <p className="max-w-[80px] max-h-[40px] overflow-hidden">
              {user.name}
            </p>
          </div>
          <div className="flex flex-col w-full">
            <div className="flex flex-col gap-2 pt-8 px-2">
              {Buttons.map((btn, index) => (
                <button
                  className="bg-[#14aeae] hover:bg-[#089393] hover:scale-x-[1.01]  transition-transform duration-200 ease-in-out   text-white text-[11px] py-2 px-4 rounded-xl shadow-sm shadow-[#000000cd]"
                  key={index}
                >
                  <div className="flex gap-4 items-center justify-start">
                    {btn.icon}
                    {btn.btn_name}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex flex-col absolute w-[190px] bottom-4 gap-1 text-[#404040]">
              <hr className="h-[1px] bg-[#999]" />
              <div className="flex justify-between w-[190px] text-[12px] px-2">
                <p className="">Preferences</p>
                <button>{<MdSettings className="text-base" />}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center w-full max-w-[1200px] items-center">
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="flex ">
            <img
              className="size-[90px] md:size-[130px]"
              src="/logo.png"
              alt="logo"
            />
            <img
              className="w-[60px] h-[60px] md:block absolute right-4 hidden"
              src="/avatar.png"
              alt="avatar"
            />
          </div>
          <div className="flex flex-col items-center">
            <p className="font-extrabold text-[14px] md:text-[16px] text-[#272727]">
              Mian Shakeel Ahmad
            </p>
            <p className="font-normal text-[12px] md:text-[14px] text-[#404040]">
              Super Store
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
