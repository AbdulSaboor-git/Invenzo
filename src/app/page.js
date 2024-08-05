"use client";
import React from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const user = {
  id: "2380",
  name: "Abdul Saboor",
  profile_pic: "/avatar.png",
  role: "moderator",
};
localStorage.setItem("user", JSON.stringify(user));

export default function Home() {
  useAuthRedirect();

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between`}>
      <div className="max-w-[1440px] w-full"></div>
    </main>
  );
}
