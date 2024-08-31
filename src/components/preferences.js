import React, { useEffect, useState } from "react";
import { FaMoon } from "react-icons/fa";
import { MdClose, MdSunny } from "react-icons/md";
import { triggerNotification } from "@/redux/notificationThunk";
import { useDispatch } from "react-redux";

export default function Preferences({ CloseForm, userId }) {
  const [add_edit_del, set_add_edit_del] = useState(true);
  const [pp, set_pp] = useState(true);
  const [categ, set_categ] = useState(true);
  const [dateAdd, set_dateAdd] = useState(true);
  const [dateUpdate, set_dateUpdate] = useState(true);
  const [theme, set_theme] = useState(true);
  const [tempPreferences, setTempPreferences] = useState({});
  const [tempTheme, setTempTheme] = useState(true);
  const dispatch = useDispatch();

  const showMessage = (msg, state) => {
    dispatch(
      triggerNotification({
        msg: msg,
        success: state,
      })
    );
  };

  useEffect(() => {
    document.body.classList.add("no-scroll");

    // Retrieve and parse saved preferences
    const savedPreferences =
      JSON.parse(localStorage.getItem(`preferences_${userId}`)) || {};
    const savedTheme = localStorage.getItem("theme");

    // Set preferences state
    set_add_edit_del(savedPreferences.add_edit_del ?? true);
    set_pp(savedPreferences.pp ?? true);
    set_categ(savedPreferences.categ ?? true);
    set_dateAdd(savedPreferences.dateAdd ?? true);
    set_dateUpdate(savedPreferences.dateUpdate ?? true);
    setTempPreferences(savedPreferences);

    // Set theme state
    if (savedTheme !== null) {
      set_theme(JSON.parse(savedTheme));
      setTempTheme(JSON.parse(savedTheme));
    } else {
      set_theme(true); // Default to light theme if no saved theme
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [userId]);

  const generalOptions = [
    {
      name: "Allow Add, Edit and Delete Products",
      value: add_edit_del,
      setter: set_add_edit_del,
    },
  ];
  const productOptions = [
    { name: "Show Purchase Price", value: pp, setter: set_pp },
    { name: "Show Category", value: categ, setter: set_categ },
    { name: "Show Date Added", value: dateAdd, setter: set_dateAdd },
    {
      name: "Show Date Updated",
      value: dateUpdate,
      setter: set_dateUpdate,
    },
  ];

  const savePreferences = () => {
    const preferences = {
      add_edit_del,
      pp,
      categ,
      dateAdd,
      dateUpdate,
    };
    localStorage.setItem(`preferences_${userId}`, JSON.stringify(preferences));
    localStorage.setItem("theme", JSON.stringify(theme));
    document.documentElement.setAttribute(
      "data-theme",
      theme ? "light" : "dark"
    );
    showMessage("Preferences saved", true);
  };

  const cancelChanges = () => {
    set_add_edit_del(tempPreferences.add_edit_del);
    set_pp(tempPreferences.pp);
    set_categ(tempPreferences.categ);
    set_dateAdd(tempPreferences.dateAdd);
    set_dateUpdate(tempPreferences.dateUpdate);
    set_theme(tempTheme);
    CloseForm();
  };

  const toggleSwitch = (setter) => {
    setter((prevValue) => !prevValue);
  };

  return (
    <div className="flex fixed z-[200] top-0 flex-col p-5 w-screen h-screen items-center justify-center bg-[#00000040] backdrop-blur-[2px]">
      <div className="pt-4 md:pt-4 p-7 border-[10px] border-transparent md:p-10 mx-10 z-40 w-full max-w-[400px] md:max-w-[450px] overflow-auto hidden_scroll_bar bg-[var(--form-bg)] rounded-lg shadow-lg shadow-[var(--shaddow)] text-[var(--text-prim)]">
        <div className="flex w-full justify-end">
          <button
            onClick={CloseForm}
            className="mr-[-25px] mt-[-10px] md:mr-[-35px] text-[var(--text-sec)] flex justify-center items-center size-6 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <MdClose size={16} />
          </button>
        </div>
        <p className="font-bold text-lg md:text-xl pb-4 text-[var(--form-heading)]">
          Preferences
        </p>
        <div className="flex flex-col gap-4 text-sm md:text-base">
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold mb-2">General</h1>
            {generalOptions.map((op, index) => (
              <div
                className="flex justify-between gap-2 items-center"
                key={index}
              >
                <label>{op.name}</label>
                <div
                  onClick={() => toggleSwitch(op.setter)}
                  className={`relative w-10 h-5 transition duration-200 ease-linear rounded-full ${
                    op.value ? "bg-[var(--btn-bg)]" : "bg-[#bdbdbd]"
                  } cursor-pointer`}
                >
                  <span
                    className={`absolute left-0 bg-white border-2 rounded-full h-5 w-5 transition transform ${
                      op.value
                        ? "translate-x-full border-[var(--btn-bg)]"
                        : "border-[#bdbdbd]"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <hr className="h-[1px] border-none bg-[#c1c1c1a6]" />

          <div className="flex flex-col gap-1">
            <h1 className="font-semibold mb-2">Product Details</h1>
            {productOptions.map((op, index) => (
              <div
                className="flex justify-between gap-2 items-center"
                key={index}
              >
                <label>{op.name}</label>
                <div
                  onClick={() => toggleSwitch(op.setter)}
                  className={`relative w-10 h-5 transition duration-200 ease-linear rounded-full ${
                    op.value ? "bg-[var(--btn-bg)]" : "bg-[#bdbdbd]"
                  } cursor-pointer`}
                >
                  <span
                    className={`absolute left-0 bg-white border-2 rounded-full h-5 w-5 transition transform ${
                      op.value
                        ? "translate-x-full border-[var(--btn-bg)]"
                        : "border-[#bdbdbd]"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <hr className="h-[1px] border-none bg-[#c1c1c1a6]" />

          <div className="flex justify-between items-center">
            <h1 className="font-semibold">Theme</h1>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={theme}
                onChange={() => toggleSwitch(set_theme)}
                className="sr-only peer"
              />
              <div
                style={{
                  boxShadow: theme
                    ? "0 0 13px 2px #deee00"
                    : "0 0 13px 2px #ffffff",
                }}
                className="w-10 h-6 peer-focus:outline-none rounded-full peer bg-[#686868] peer-checked:bg-blue-500"
              ></div>
              <span className="absolute left-1 w-[18px] h-6 top-1 rounded-full transition-transform peer-checked:translate-x-full">
                {theme ? (
                  <MdSunny className="text-yellow-300" size={16} />
                ) : (
                  <FaMoon className="text-white" size={16} />
                )}
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={cancelChanges}
              className="px-5 py-2 text-sm font-medium  text-[var(--text-prim)]  rounded-full hover:text-[#afafaf]"
            >
              Cancel
            </button>
            <button
              onClick={savePreferences}
              className="px-5 py-2 text-sm font-medium -mr-1.5 text-white bg-[var(--btn-bg)] rounded-full hover:bg-[var(--btn-bg-sec)]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
