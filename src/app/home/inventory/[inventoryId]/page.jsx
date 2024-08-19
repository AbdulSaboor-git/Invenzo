"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Body from "./components/body";
import { triggerNotification } from "@/redux/notificationThunk";
import Add_Product_Form from "@/app/home/inventory/[inventoryId]/components/add_product";
import Manage_Categories_Form from "@/app/home/inventory/[inventoryId]/components/manage_categories";
import Manage_Moderators_Form from "@/app/home/inventory/[inventoryId]/components/manage_moderators";
import Members from "@/app/home/inventory/[inventoryId]/components/members";
import {
  MdAdd,
  MdInventory,
  MdLogout,
  MdPeopleAlt,
  MdSettings,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import useAuthUser from "@/hooks/authUser";
import Loader from "@/components/loader";
import { FaPlus, FaCogs, FaTrashAlt, FaUsers } from "react-icons/fa";
import { setProducts } from "@/redux/products";
import { setCategories } from "@/redux/categories";
import Confirmation_dialogue from "@/components/confirmation_dialogue";
import Preferences from "@/components/preferences";

export default function Inventory({ params }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [addItemForm_isOpen, setAddForm_isOpen] = useState(false);
  const [members_isOpen, set_Members_isOpen] = useState(false);
  const invId = params.inventoryId;
  let role = "viewer";
  const { user, userLoading, logout } = useAuthUser();
  // const products = useSelector((state) => state.products);
  // const categories = useSelector((state) => state.categories);
  const [manageCategories_isOpen, set_manageCategories_isOpen] =
    useState(false);
  const [manageModerators_isOpen, set_manageModerators_isOpen] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [products, setProducts_2] = useState([]);
  const [categories, setCategories_2] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [invInfo, set_invInfo] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [preferences_isOpen, set_preferences_IsOpen] = useState(false);

  let savedPreferences = [];

  if (user) {
    savedPreferences = JSON.parse(
      localStorage.getItem(`preferences_${user.id}`)
    );
  }

  const openPreferences = () => {
    set_preferences_IsOpen(true);
  };

  const clossePreferences = () => {
    set_preferences_IsOpen(false);
  };

  const goToHome = () => {
    router.push("/home");
  };

  const openDialog = (e) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const showMessage = (msg, state) => {
    dispatch(
      triggerNotification({
        msg: msg,
        success: state,
      })
    );
  };

  const fetchInvData = async () => {
    if (user) {
      try {
        setLoadingData(true);
        const Response = await fetch(
          `/api/inventory/${invId}?userId=${user.id}`
        );

        if (!Response.ok) {
          const errorData = await Response.json();
          if (
            errorData.message ===
            "User is not authorized to access this inventory"
          ) {
            showMessage(
              "You are not authorized to access this inventory. Redirecting to Home...",
              false
            );
          } else if (errorData.message === "Invalid inventory ID") {
            showMessage("Invalid inventory ID. Redirecting to Home...", false);
          } else {
            showMessage("Invalid inventory ID. Redirecting to Home...", false);
          }
          router.push("/home");
          return;
        }

        const InvData = await Response.json();
        setProducts_2(InvData.products);
        setCategories_2(InvData.categories);
        setModerators(InvData.moderators);
        set_invInfo(InvData.inv);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoadingData(false);
      }
    }
  };

  const refreshInvData = async () => {
    if (user) {
      try {
        const Response = await fetch(
          `/api/inventory/${invId}?userId=${user.id}`
        );
        const InvData = await Response.json();
        setProducts_2(InvData.products);
        setCategories_2(InvData.categories);
        setModerators(InvData.moderators);
        set_invInfo(InvData.inv);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      }
    }
  };

  const deleteAll = async () => {
    try {
      // Validate the inventoryId
      if (!invId) {
        alert("Invalid inventory ID");
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/inventory/${invId}/deleteAll`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle response
      if (response.ok) {
        const data = await response.json();
        showMessage(data.message || "Successfully cleared inventory", true);
        fetchInvData();
      } else {
        const errorData = await response.json();
        showMessage(`Failed to delete data: ${errorData.error}`, false);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      showMessage("An error occurred while deleting the data", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvData();
  }, [invId, user]);

  const onAdd = async () => {
    fetchInvData();
    showMessage("Product added successfully!", true);
  };

  const confirmClearData = () => {
    deleteAll();
    closeDialog();
  };

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("categories", JSON.stringify(categories));
    dispatch(setProducts(products));
    dispatch(setCategories(categories));
  }, [dispatch, categories, products]);

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

  const openMembers = () => {
    set_Members_isOpen(true);
  };

  const closeMembers = () => {
    set_Members_isOpen(false);
  };

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return <Loader />;
  }
  if (user.id === invInfo?.admin?.id) {
    role = "admin";
  } else {
    role = "viewer";
  }

  const Buttons = [];

  role !== "viewer" &&
    savedPreferences.add_edit_del &&
    Buttons.push({
      btn_name: "Add Product",
      icon: <FaPlus className="pr-[1px] text-[12px] md:text-[14px]" />,
      clickEvent: open_AddItemForm,
    });

  role !== "viewer" &&
    Buttons.push(
      {
        btn_name: "Manage Categories",
        icon: <FaCogs className="pr-[1px] text-[14px] md:text-[16px]" />,
        clickEvent: open_manageCategories,
      },
      // {
      //   btn_name: "Clear Data",
      //   icon: <FaTrashAlt size={13} className="pr-[1px]" />,
      //   clickEvent: openDialog,
      // },
      {
        btn_name: "Manage Moderators",
        icon: <FaUsers className="pr-[1px] text-[14px] md:text-[16px]" />,
        clickEvent: open_manageModerators,
      }
    );

  Buttons.push(
    {
      btn_name: "Members",
      icon: <MdPeopleAlt className="pr-[1px] text-[14px] md:text-[16px]" />,
      clickEvent: openMembers,
    },
    {
      btn_name: "Other Inventories",
      icon: <MdInventory className="pr-[1px] text-[14px] md:text-[16px]" />,
      clickEvent: goToHome,
    },
    {
      btn_name: "Preferences",
      icon: <MdSettings className="pr-[1px] text-[14px] md:text-[16px]" />,
      clickEvent: openPreferences,
    },
    {
      btn_name: "Logout",
      icon: <MdLogout className="pr-[1px] text-[14px] md:text-[16px]" />,
      clickEvent: logout,
    }
  );

  return (
    <div className={`flex min-h-screen flex-col items-center justify-between`}>
      {loading && <Loader />}
      <div className="max-w-[1440px] w-full">
        <Header
          user={user}
          Buttons={Buttons}
          openPreferences={openPreferences}
        />

        <Body
          buttons={Buttons}
          inventoryId={invId}
          role={role}
          setLoading={setLoading}
          loadingData={loadingData}
          products={products}
          categories={categories}
          fetchInvData={fetchInvData}
          userId={user.id}
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
          inventoryId={invId}
          categories={categories}
          fetchInvData={refreshInvData}
        />
      )}
      {manageModerators_isOpen && (
        <Manage_Moderators_Form
          CloseForm={close_manageModerators}
          moderators={moderators}
          refreshModerators={refreshInvData}
          inventoryId={invId}
          adminEmail={invInfo?.admin?.email}
        />
      )}
      {members_isOpen && (
        <Members
          CloseForm={closeMembers}
          moderators={moderators}
          inv={invInfo}
          user={user}
        />
      )}
      {role !== "viewer" && savedPreferences.add_edit_del === true && (
        <div className="fixed block md:hidden bottom-8 right-6 rounded-full ">
          <button
            onClick={open_AddItemForm}
            className="rounded-full size-[45px] text-2xl bg-[#01b0b0] z-50 flex items-center justify-center hover:bg-[#079d9d] hover:scale-[1.05]  transition-transform duration-200 ease-in-out shadow-sm shadow-[#000000cd]"
          >
            {<MdAdd />}
          </button>
        </div>
      )}
      {isDialogOpen && (
        <Confirmation_dialogue
          isOpen={isDialogOpen}
          title="Confirm Clear Data"
          message="Are you sure you want to clear all data?"
          onConfirm={confirmClearData}
          onCancel={closeDialog}
        />
      )}
      {preferences_isOpen && (
        <Preferences CloseForm={clossePreferences} userId={user.id} />
      )}
    </div>
  );
}
