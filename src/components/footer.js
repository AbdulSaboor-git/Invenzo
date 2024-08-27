import React from "react";
import { FaEnvelope, FaLinkedin, FaInstagram } from "react-icons/fa";
import {
  SiFacebook,
  SiGoogleplay,
  SiLinkedin,
  SiTelegram,
  SiX,
  SiYoutube,
} from "react-icons/si";

export default function Footer() {
  const date = new Date();

  return (
    <div className="flex flex-col items-center p-6">
      <div className="flex flex-col justify-center w-full max-w-[1200px]">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end w-full py-4 px-6">
          <div className="flex flex-col items-center justify-center  pb-8 md:pb-3">
            <img src="/logo.png" alt="logo" className="h-[50px] md:h-[70px]" />
            <div className="flex flex-col items-center">
              <p className="font-normal text-[8.3px] mt-[-5px] md:text-[11.5px] text-teal-950">
                INVENTORY MANAGEMENT
              </p>
            </div>
          </div>
          <div className="flex gap-10 md:gap-16 justify-center  md:px-16">
            <div className="flex flex-col w-full md:w-auto text-[#404040] text-[12px] md:text-[14px] gap-3">
              <div className="flex items-center gap-3">
                <SiGoogleplay className="text-lg md:text-xl" />
                <p>Invenzo</p>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-lg md:text-xl" />
                <p>invenzo@gmail.com</p>
              </div>
              <div className="flex items-center gap-3">
                <FaLinkedin className="text-lg md:text-xl" />
                <p>Invenzo</p>
              </div>
              <div className="flex items-center gap-3">
                <FaInstagram className="text-lg md:text-xl" />
                <p>@invenzo</p>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-auto text-[#404040] text-[12px] md:text-[14px] gap-3">
              <div className="flex items-center gap-3">
                <SiFacebook className="text-lg md:text-xl" />
                <p>Invenzo</p>
              </div>
              <div className="flex items-center gap-3">
                <SiTelegram className="text-lg md:text-xl" />
                <p>@invenzo</p>
              </div>
              <div className="flex items-center gap-3">
                <SiX className="text-lg md:text-xl" />
                <p>@Invenzo</p>
              </div>
              <div className="flex items-center gap-3">
                <SiYoutube className="text-lg md:text-xl" />
                <p>Invenzo</p>
              </div>
            </div>
          </div>
        </div>
        <hr className="h-[1px] w-full bg-[#999] border-none" />
        <div className="flex flex-col md:flex-row justify-between p-2 pb-0 text-[10px] md:text-[12px] text-[#404040] text-center md:text-left">
          <p>The Invenzo™ Inventory</p>
          <p>Copyright © {date.getFullYear()} - All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}
