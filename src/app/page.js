"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { openAddItemForm, closeAddItemForm } from "../redux/addItemFormSlice";
import { triggerNotification } from "../redux/notificationThunk";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Notify from "@/components/notification";
import Body from "@/components/body";
import { Products, Categories } from "@/components/products";
import Add_Product_Form from "@/components/add_product";
import Manage_Categories_Form from "@/components/manage_categories";
import { MdAdd } from "react-icons/md";
import {
  FaPlus,
  FaCogs,
  FaCloudUploadAlt,
  FaFileExport,
  FaTrashAlt,
  FaUsers,
} from "react-icons/fa";

const user = {
  name: "Abdul Saboor",
  profile_pic: "/avatar.png",
  role: "admin",
};

export default function Home() {
  const dispatch = useDispatch();
  const addItemForm_isOpen = useSelector((state) => state.addItemForm.isOpen);
  const heading = useSelector((state) => state.addItemForm.heading);
  const btn_text = useSelector((state) => state.addItemForm.btn_text);
  const notification = useSelector((state) => state.notification);

  const [manageCategories_isOpen, set_manageCategories_isOpen] =
    useState(false);

  const open_manageCategories = () => {
    set_manageCategories_isOpen(true);
  };

  const close_manageCategories = () => {
    set_manageCategories_isOpen(false);
  };

  const open_AddItemForm = () => {
    dispatch(openAddItemForm({ heading: "Add", btn_text: "Add" }));
  };

  const close_AddItemForm = () => {
    dispatch(closeAddItemForm());
  };

  const Buttons = [];

  user.role === "admin" &&
    Buttons.push(
      {
        btn_name: "Add Product",
        icon: <FaPlus />,
        clickEvent: open_AddItemForm,
      },
      {
        btn_name: "Manage Categories",
        icon: <FaCogs />,
        clickEvent: open_manageCategories,
      },
      {
        btn_name: "Load Data",
        icon: <FaCloudUploadAlt />,
        clickEvent: open_AddItemForm,
      },
      {
        btn_name: "Export Data",
        icon: <FaFileExport />,
        clickEvent: open_AddItemForm,
      },
      {
        btn_name: "Clear Data",
        icon: <FaTrashAlt />,
        clickEvent: open_AddItemForm,
      },
      {
        btn_name: "Manage Users",
        icon: <FaUsers />,
        clickEvent: open_AddItemForm,
      }
    );

  user.role === "manager" &&
    Buttons.push(
      {
        btn_name: "Add Product",
        icon: <FaPlus />,
        clickEvent: open_AddItemForm,
      },
      {
        btn_name: "Manage Categories",
        icon: <FaCogs />,
        clickEvent: open_AddItemForm,
      }
    );

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between`}>
      <div className="max-w-[1440px] w-full">
        <Header user={user} Buttons={Buttons} />
        <Body
          products={Products}
          categories={Categories}
          buttons={Buttons}
          user={user}
        />
        <Footer />
      </div>
      {addItemForm_isOpen && (
        <Add_Product_Form
          heading={heading}
          buttonText={btn_text}
          CloseForm={close_AddItemForm}
          categories={Categories}
        />
      )}
      {manageCategories_isOpen && (
        <Manage_Categories_Form
          CloseForm={close_manageCategories}
          categories={Categories}
        />
      )}
      <div className="fixed block md:hidden bottom-8 right-6 rounded-full ">
        <button
          onClick={open_AddItemForm}
          className="rounded-full size-[45px] text-2xl bg-[#01b0b0] z-50 flex items-center justify-center hover:bg-[#079d9d] hover:scale-[1.05]  transition-transform duration-200 ease-in-out shadow-sm shadow-[#000000cd]"
        >
          {<MdAdd />}
        </button>
      </div>
      {notification.isVisible && (
        <Notify msg={notification.msg} success={notification.success} />
      )}
    </main>
  );
}
