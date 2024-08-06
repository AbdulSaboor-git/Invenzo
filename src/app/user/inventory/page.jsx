"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { openAddItemForm, closeAddItemForm } from "@/redux/addItemFormSlice";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Notify from "@/components/notification";
import Body from "@/components/body";
import { Products, Categories } from "@/components/products";
import Add_Product_Form from "@/components/add_product";
import Manage_Categories_Form from "@/components/manage_categories";
import Manage_Moderators_Form from "@/components/manage_moderators";
import { MdAdd, MdLogout } from "react-icons/md";
import { useRouter } from "next/navigation";
import useAuthUser from "@/hooks/authUser";

import {
  FaPlus,
  FaCogs,
  FaCloudUploadAlt,
  FaFileExport,
  FaTrashAlt,
  FaUsers,
} from "react-icons/fa";

const moderators = [
  {
    id: 12,
    name: "abc",
    email: "abc@email.com",
  },
  {
    id: 15,
    name: "xyz",
    email: "xyz@email.com",
  },
];

export default function Inventory() {
  const dispatch = useDispatch();
  const addItemForm_isOpen = useSelector((state) => state.addItemForm.isOpen);
  const heading = useSelector((state) => state.addItemForm.heading);
  const btn_text = useSelector((state) => state.addItemForm.btn_text);
  const notification = useSelector((state) => state.notification);

  const [manageCategories_isOpen, set_manageCategories_isOpen] =
    useState(false);
  const [manageModerators_isOpen, set_manageModerators_isOpen] =
    useState(false);

  const open_manageCategories = () => {
    set_manageCategories_isOpen(true);
  };

  const close_manageCategories = () => {
    set_manageCategories_isOpen(false);
  };

  const open_manageModerators = () => {
    set_manageModerators_isOpen(true);
  };

  const close_manageModerators = () => {
    set_manageModerators_isOpen(false);
  };

  const open_AddItemForm = () => {
    dispatch(openAddItemForm({ heading: "Add", btn_text: "Add" }));
  };

  const close_AddItemForm = () => {
    dispatch(closeAddItemForm());
  };

  const router = useRouter();
  const { user, userLoading, logout } = useAuthUser();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-teal-700">
        <div className="loader">Loading...</div>{" "}
      </div>
    );
  }

  const Buttons = [];

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
      // clickEvent: open_AddItemForm,
    },
    {
      btn_name: "Export Data",
      icon: <FaFileExport />,
      // clickEvent: open_AddItemForm,
    },
    {
      btn_name: "Clear Data",
      icon: <FaTrashAlt />,
      // clickEvent: open_AddItemForm,
    },
    {
      btn_name: "Manage Moderators",
      icon: <FaUsers />,
      clickEvent: open_manageModerators,
    },
    {
      btn_name: "Logout",
      icon: <MdLogout />,
      clickEvent: logout,
    }
  );

  return (
    <div className={`flex min-h-screen flex-col items-center justify-between`}>
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
      {manageModerators_isOpen && (
        <Manage_Moderators_Form
          CloseForm={close_manageModerators}
          moderators={moderators}
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
    </div>
  );
}
