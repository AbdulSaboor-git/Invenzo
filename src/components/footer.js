import React from "react";
import { FaEnvelope, FaLinkedin, FaInstagram } from "react-icons/fa";
import { SiGoogleplay } from "react-icons/si";

export default function Footer() {
  return (
    <div className="flex flex-col items-center p-6">
      <div className="flex flex-col justify-center w-full max-w-[1200px]">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end w-full py-4 px-6">
          <div className="flex flex-col items-center justify-center  pb-8 md:pb-3">
            <img src="/logo.png" alt="logo" className="h-[60px] md:h-[90px]" />
            <div className="flex flex-col items-center">
              <p className="font-normal text-[10px] mt-[-5px] md:text-[12px] text-teal-950">
                INVENTORY MANAGEMENT
              </p>
            </div>
          </div>
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
        </div>
        <hr className="h-[1px] w-full bg-[#999] border-none" />
        <div className="flex flex-col md:flex-row justify-between p-2 pb-0 text-[10px] md:text-[12px] text-[#404040] text-center md:text-left">
          <p>The MSA Super Store™</p>
          <p>Copyright © 2024 - All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}
