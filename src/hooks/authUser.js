"use client";
import { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser, setUserLoading, logoutUser } from "@/redux/userSlice";

export default function useAuthUser() {
  const { user, userLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      dispatch(setUserLoading(true));
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          dispatch(setUser(JSON.parse(storedUser)));
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
        dispatch(setUser(null));
      } finally {
        dispatch(setUserLoading(false));
      }
    } else {
      // Already in Redux, no need to load again
      dispatch(setUserLoading(false));
    }
  }, [dispatch, user]);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      // Remove all inventoryData_* keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("inventoryData_")) {
          localStorage.removeItem(key);
        }
      });

      // Remove auth data
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Reset Redux state
      dispatch(logoutUser());
    }
  }, [dispatch]);

  return { user, userLoading, logout };
}
