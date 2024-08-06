"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { useRouter } from "next/navigation";

export default function useAuthUser() {
  const loggedInUser = useSelector((state) => state.user);
  const [userLoading, setUserLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userCookie = localStorage.getItem("user");
        if (userCookie) {
          const parsedUser = JSON.parse(userCookie);
          dispatch(setUser(parsedUser));
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
      } finally {
        setUserLoading(false);
      }
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      dispatch(setUser(null));
    }
  }, [dispatch]);

  return { user: loggedInUser, userLoading, logout };
}
