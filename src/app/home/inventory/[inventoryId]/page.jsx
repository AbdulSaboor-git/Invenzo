"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { openAddItemForm, closeAddItemForm } from "@/redux/addItemFormSlice";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Body from "./components/body";
import { triggerNotification } from "@/redux/notificationThunk";
import Add_Product_Form from "@/app/home/inventory/[inventoryId]/components/add_product";
import Manage_Categories_Form from "@/app/home/inventory/[inventoryId]/components/manage_categories";
import Manage_Moderators_Form from "@/app/home/inventory/[inventoryId]/components/manage_moderators";
import { MdAdd, MdLogout } from "react-icons/md";
import { useRouter } from "next/navigation";
import useAuthUser from "@/hooks/authUser";
import Loader from "@/components/loader";
import { FaPlus, FaCogs, FaTrashAlt, FaUsers } from "react-icons/fa";

export default function Inventory({ params }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [addItemForm_isOpen, setAddForm_isOpen] = useState(false);
  const invId = params.inventoryId;
  let role = "viewer";
  const { user, userLoading, logout } = useAuthUser();
  const products = useSelector((state) => state.products);
  const categories = useSelector((state) => state.categories);
  const [manageCategories_isOpen, set_manageCategories_isOpen] =
    useState(false);
  const [manageModerators_isOpen, set_manageModerators_isOpen] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const showMessage = (msg, state) => {
    dispatch(
      triggerNotification({
        msg: msg,
        success: state,
      })
    );
  };

  const onAdd = async () => {
    // refreshInventories();
    showMessage("Product added successfully!", true);
  };

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
    setAddForm_isOpen(true);
  };

  const close_AddItemForm = () => {
    setAddForm_isOpen(false);
  };

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return <Loader />;
  }
  if (user?.Inventories?.some((inventory) => inventory.id === Number(invId))) {
    role = "admin";
  } else {
    role = "viewer";
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
      {loading && <Loader />}
      <div className="max-w-[1440px] w-full">
        <Header user={user} Buttons={Buttons} />

        <Body
          buttons={Buttons}
          user={user}
          inventoryId={invId}
          role={role}
          setLoading={setLoading}
        />
        <Footer />
      </div>
      {addItemForm_isOpen && (
        <Add_Product_Form
          CloseForm={close_AddItemForm}
          categories={categories}
          invId={invId}
          onSuccess={onAdd}
        />
      )}
      {manageCategories_isOpen && (
        <Manage_Categories_Form
          CloseForm={close_manageCategories}
          categories={categories}
        />
      )}
      {manageModerators_isOpen && (
        <Manage_Moderators_Form
          CloseForm={close_manageModerators}
          moderators={[]}
        />
      )}
      {role !== "viewer" && (
        <div className="fixed block md:hidden bottom-8 right-6 rounded-full ">
          <button
            onClick={open_AddItemForm}
            className="rounded-full size-[45px] text-2xl bg-[#01b0b0] z-50 flex items-center justify-center hover:bg-[#079d9d] hover:scale-[1.05]  transition-transform duration-200 ease-in-out shadow-sm shadow-[#000000cd]"
          >
            {<MdAdd />}
          </button>
        </div>
      )}
    </div>
  );
}
