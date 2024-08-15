import React, { useEffect } from "react";
import { MdClose } from "react-icons/md";

export default function Members({ CloseForm, moderators, inv, user }) {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);
  return (
    <div className="flex fixed z-[200] top-0 flex-col p-5 w-screen h-screen items-center justify-center bg-[#00000040] backdrop-blur-[2px] ">
      <div className="pt-4  md:pt-4 p-7 md:p-10 mx-10 z-40 w-full max-w-[400px] h-[305px] md:h-[345px] md:max-w-[450px] overflow-auto hidden_scroll_bar bg-teal-700 rounded-lg shadow-lg shadow-[#00000040] text-[#404040]">
        <div className="flex w-full justify-end sticky top-0">
          <button
            onClick={CloseForm}
            className="mr-[-15px] md:mr-[-25px] text-white flex justify-center items-center size-6  rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <h1 className="font-bold text-lg md:text-xl pb-4 text-white">
          Inventory Members
        </h1>
        <div className="flex flex-col gap-4 shadow-inner shadow-black p-6 bg-[#dfeaea] overflow-auto hidden_scroll_bar">
          <div className="flex flex-col text-sm md:text-base">
            <h2 className="font-bold text-base md:text-lg pb-4 text-teal-700  mb-[-10px] ">
              Admin:
            </h2>
            <p className="ml-4">
              {inv?.admin?.firstName} {inv?.admin?.lastName} -{" "}
              <span className="text-teal-800">
                {inv?.admin?.email}
                {user.id === inv?.admin?.id && (
                  <span className="text-[#999] text-xs"> (You)</span>
                )}
              </span>
            </p>
          </div>
          <div className="flex flex-col text-sm md:text-base">
            <h2 className="font-bold text-base md:text-lg pb-4 text-teal-700  mb-[-10px] ">
              Moderators:
            </h2>
            {moderators?.map((mod) => (
              <p className="ml-4" key={mod.id}>
                {mod.user.firstName} {mod.user.lastName} -{" "}
                <span className="text-teal-800">{mod.user.email} </span>
                {user.id === mod.user.id && (
                  <span className="text-[#999] text-xs">(You)</span>
                )}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
