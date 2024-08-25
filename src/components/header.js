"use client";
import React, { useState, useEffect, useRef } from "react";
import { MdClose, MdMenu, MdSettings } from "react-icons/md";

export default function Header({
  user,
  Buttons,
  openPreferences,
  inv,
  dockOnTop,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // useEffect(() => {
  //   isOpen && document.body.classList.add("no-scroll");
  //   return () => {
  //     document.body.classList.remove("no-scroll");
  //   };
  // }, [isOpen]);

  const openSidebar = () => {
    setIsOpen(true);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (isOpen && !event.target.closest(".sidebar")) {
  //       closeSidebar();
  //     }
  //   };
  //   document.body.addEventListener("click", handleClickOutside);

  //   return () => {
  //     document.body.removeEventListener("click", handleClickOutside);
  //   };
  // }, [isOpen]);

  const [isSticky, setIsSticky] = useState(false);

  const placeholderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: [1] }
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => {
      if (placeholderRef.current) {
        observer.unobserve(placeholderRef.current);
      }
    };
  }, []);

  return (
    <div>
      <div ref={placeholderRef} className="absolute mt-[85px]"></div>
      <div
        className={`${
          isSticky && dockOnTop
            ? " transition-all duration-300 ease-in-out fixed top-0 h-[137px] backdrop-blur-[10px] bg-[#23b2b26a] w-full z-[20]  md:hidden"
            : "bg-[#23b2b2] "
        }`}
      ></div>
      <div
        className={`${
          isSticky && dockOnTop
            ? "fixed transition-all duration-300 ease-in-out top-0 left-0 right-0 z-[40]  md:relative"
            : "relative"
        }`}
      >
        <div
          onClick={closeSidebar}
          className={`md:hidden fixed h-screen w-full z-40  ${
            isOpen ? "translate-x-0" : "-translate-x-[100%]"
          }`}
        ></div>
        <div className="relative flex justify-center items-center p-4 pt-10 z-50">
          {(user || Buttons) && (
            <>
              <div className=" fixed left-4 top-4 md:hidden">
                <button
                  onClick={openSidebar}
                  className=" text-2xl text-teal-900"
                >
                  <MdMenu />
                </button>
              </div>
              <div
                className={` md:hidden fixed top-0 left-[-10px] w-[230px] h-full rounded-e-[30px] sidebar bg-white transition-transform duration-300 ease-in-out ${
                  isOpen ? "translate-x-0" : "-translate-x-[240px]"
                }`}
                style={{ boxShadow: "0 0 20px -5px #404040" }}
              >
                <button
                  onClick={closeSidebar}
                  className="absolute top-4 right-4 text-xl text-[#7e7e7e]"
                >
                  <MdClose style={{ fontSize: "1.2rem" }} />
                </button>
                <div className="flex flex-col items-start py-6">
                  <div className=" flex flex-col justify-center items-center text-[#404040] font-[500] text-[12px] gap-1 ml-6">
                    <img
                      className="w-[60px] h-[60px]"
                      src={"/avatar.png"}
                      alt="avatar"
                    />
                    <p className="max-w-[120px] max-h-[40px] overflow-hidden">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col pt-8">
                      {Buttons.map(
                        (btn, index) =>
                          btn.btn_name !== "Add Product" &&
                          btn.btn_name !== "Preferences" && (
                            <button
                              onClick={btn.clickEvent}
                              className={`hover:bg-[#dff9f9]  transition-transform duration-200 ease-in-out ${
                                btn.btn_name === "Logout"
                                  ? "text-[#c30000]"
                                  : "text-[#404040]"
                              } text-[11px] px-6 py-[10px]  shadow-[#00000066]`}
                              key={index}
                            >
                              <div className="flex gap-3 items-center justify-start">
                                {btn.icon}
                                {btn.btn_name}
                              </div>
                            </button>
                          )
                      )}
                    </div>
                    <div className="flex flex-col absolute w-[190px] bottom-4 gap-1 text-[#404040] ml-6">
                      <hr className="h-[2px] bg-[#b3b3b3]" />
                      <div className="flex justify-between w-[190px] text-[12px] px-2">
                        <p onClick={openPreferences} className="cursor-pointer">
                          Preferences
                        </p>
                        <button onClick={openPreferences}>
                          {<MdSettings className="text-base" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div
            onClick={closeSidebar}
            className="flex flex-col justify-center w-full max-w-[1200px] items-center"
          >
            <div
              className={`flex transition-all ease-in-out duration-300 items-center justify-center gap-1 ${
                isSticky && dockOnTop
                  ? "flex-row w-full gap-3 -mt-5 md:flex-col"
                  : "flex-col md:mt-0"
              }`}
            >
              <div className="flex ">
                <img
                  className={` md:h-[130px] transition-all ease-in-out duration-0  ${
                    isSticky && dockOnTop ? "h-[50px]" : "h-[90px]"
                  }`}
                  src="/logo.png"
                  alt="logo"
                />
                {(user || Buttons) && (
                  <img
                    className="w-[60px] h-[60px] md:block absolute right-4 hidden"
                    src="/avatar.png"
                    alt="avatar"
                  />
                )}
              </div>
              <div className="flex flex-col items-center">
                <p
                  className={`font-extrabold transition-all duration-300 ease-in-out  md:text-[16px] text-teal-950 ${
                    isSticky && dockOnTop ? "text-xs" : "text-[14px]"
                  }`}
                >
                  {inv?.name}
                </p>
                <p
                  className={`font-normal text-[12px] transition-all duration-300 ease-in-out md:text-[14px] text-[#404040] ${
                    isSticky && dockOnTop ? "text-[10px]" : "text-[12px]"
                  }`}
                ></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
