import React from "react";
import {
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";
import { SiGoogleplay } from "react-icons/si";

export default function Footer() {
  return (
    <div className="flex flex-col items-center p-6">
      <div className="flex flex-col justify-center w-full max-w-[1200px]">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end w-full py-4 px-6">
          <div className="flex flex-col items-center justify-center gap-3 pb-8 md:pb-3">
            <img
              src="/logo.png"
              alt="logo"
              className="w-[80px] h-[80px] md:w-[110px] md:h-[110px]"
            />
            <div className="flex flex-col items-center">
              <p className="font-bold text-[13px] md:text-[15px] text-[#272727]">
                Mian Shakeel Ahmad
              </p>
              <p className="font-normal text-[11px] md:text-[13px] text-[#404040]">
                Super Store
              </p>
            </div>
          </div>
          <div className="flex flex-col w-full md:w-auto text-[#404040] text-[12px] md:text-[14px] gap-3">
            <div className="flex items-center gap-3">
              <SiGoogleplay className="text-lg md:text-xl" />
              <p>MSA Super Store</p>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-lg md:text-xl" />
              <p>MSA.superstore@gmail.com</p>
            </div>
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-lg md:text-xl" />
              <p>Main Bazar Qazi Park Chowk, Shahdara Town, Lahore</p>
            </div>
            <div className="flex items-center gap-3">
              <FaWhatsapp className="text-lg md:text-xl" />
              <p>+92 0112223333</p>
            </div>
          </div>
        </div>
        <hr className="h-[2px] w-full bg-[#999]" />
        <div className="flex flex-col md:flex-row justify-between p-2 pb-0 text-[10px] md:text-[12px] text-[#404040] text-center md:text-left">
          <p>The MSA Super Store™</p>
          <p>Copyright © 2024 - All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}
