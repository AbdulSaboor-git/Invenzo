"use client";
import React, { useEffect } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function Home() {
  useAuthRedirect();
  return (
    <main className={`flex min-h-screen flex-col items-center justify-between`}>
      <div className="max-w-[1440px] w-full"></div>
    </main>
  );
}
