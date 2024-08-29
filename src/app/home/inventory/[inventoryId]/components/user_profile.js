import React, { useState, useEffect } from "react";
import {
  MdClose,
  MdVisibility,
  MdVisibilityOff,
  MdLogout,
} from "react-icons/md";

export default function UserProfile({ CloseForm, user, logout }) {
  const [showPassword, setShowPassword] = useState(false);
  const username = user?.firstName + " " + user?.lastName;
  const profilePic = user?.profilePicture;
  const email = user?.email;
  const password = user?.password;

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  return (
    <div className="flex fixed z-[200] w-[105vw] -ml-7 top-0 flex-col p-5 h-screen items-center justify-center bg-[#00000040] backdrop-blur-[2px] ">
      <div className="pt-4 pb-10 md:py-4  md:pb-12 px-10 md:px-14 mx-10 z-40 w-full max-w-[420px] md:max-w-[470px] overflow-auto hidden_scroll_bar bg-[#d5edeb] rounded-3xl shadow-lg shadow-[#00000040] text-[#404040]">
        <div className="flex w-full justify-end sticky top-0">
          <button
            onClick={CloseForm}
            className="mr-[-27px] md:mr-[-43px] text-gray-500 flex justify-center items-center size-6  rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>

        <h1 className="font-bold text-xl md:text-2xl text-center pb-4 text-teal-700">
          User Profile
        </h1>
        <div>
          <div className="flex flex-col mt-3 mb-7">
            <img
              className="self-center cursor-pointer object-cover w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full"
              src={profilePic || "/avatar.png"}
              alt="avatar"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <p className="font-bold text-base md:text-lg">Name</p>
              <p className="ml-4 text-gray-600 text-sm md:text-base">
                {username}
              </p>
            </div>
            <div>
              <p className="font-bold text-base md:text-lg">Email Address</p>
              <p className="ml-4 text-gray-600 text-sm md:text-base">{email}</p>
            </div>
            <div>
              <p className="font-bold text-base md:text-lg">Password</p>
              <div className="ml-4 text-gray-600 text-sm md:text-base flex items-center">
                <span className="mr-2">
                  {showPassword ? password : "•".repeat(password.length)}
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-teal-700 transition-all duration-200"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-3 p-3 bg-red-500 hover:bg-red-600 transition-colors rounded-full text-white w-full mt-10 text-base md:text-lg"
          >
            Logout <MdLogout size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
