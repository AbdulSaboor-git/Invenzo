"use client";
import { deleteCookie, getCookie } from "cookies-next";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { useRouter } from "next/navigation";

export default function useAuthUser() {
  const loggedInUser = useSelector((state) => state.user);
  const [userLoading, setUserLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    const userCookie = getCookie("user");
    if (userCookie) {
      dispatch(setUser(JSON.parse(userCookie)));
    }
    setUserLoading(false);
  }, [dispatch]);

  const logout = useCallback(() => {
    deleteCookie("user");
    deleteCookie("token");
    dispatch(setUser(null));
  }, [dispatch]);

  return { user: loggedInUser, userLoading, logout };
}
