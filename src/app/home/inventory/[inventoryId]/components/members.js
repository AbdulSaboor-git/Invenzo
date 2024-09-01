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
    <div className="flex fixed z-[200] top-0 flex-col p-5 w-screen h-screen items-center justify-center  bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="pt-6 md:pt-6 p-10 md:p-11 mx-10 z-40 w-full max-w-[460px] md:max-w-[480px] overflow-auto hidden_scroll_bar border border-gray-300 bg-[var(--form-bg)] rounded-lg shadow-lg shadow-[var(--shaddow)] text-[var(--text-prim)]">
        <div className="flex w-full justify-end ">
          <button
            onClick={CloseForm}
            className="mr-[-25px] mt-[-10px]  md:mr-[-30px] text-[var(--text-sec)] flex justify-center items-center size-6 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <p className="font-bold text-lg md:text-xl pb-4 text-[var(--form-heading)]">
          Inventory Members
        </p>
        <div className="flex flex-col gap-4 shadow-inner shadow-black p-6 h-[230px] md:h-[250px] bg-[var(--text-alt)] overflow-auto hidden_scroll_bar">
          <div className="flex flex-col text-sm md:text-base">
            <h2 className="font-bold text-base md:text-lg pb-4   mb-[-10px] ">
              Admin:
            </h2>
            <p className="ml-4 text-[var(--text-sec)]">
              {inv?.admin?.firstName} {inv?.admin?.lastName} -{" "}
              <span className="text-[var(--form-heading)]">
                {inv?.admin?.email}
                {user.id === inv?.admin?.id && (
                  <span className="text-[#9e9e9e] text-xs"> (You)</span>
                )}
              </span>
            </p>
          </div>
          <div className="flex flex-col text-sm md:text-base">
            <h2 className="font-bold text-base md:text-lg pb-4   mb-[-10px] ">
              Moderators:
            </h2>
            {moderators?.map((mod) => (
              <p className="ml-4 text-[var(--text-sec)]" key={mod.id}>
                {mod.user.firstName} {mod.user.lastName} -{" "}
                <span className="text-[var(--form-heading)]">
                  {mod.user.email}{" "}
                </span>
                {user.id === mod.user.id && (
                  <span className="text-[#9e9e9e] text-xs">(You)</span>
                )}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
