"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "./reduxProvider";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  const savedPref = user
    ? JSON.parse(localStorage.getItem(`preferences_${user.id}`))
    : null;

  useEffect(() => {
    if (savedPref) {
      document.documentElement.setAttribute(
        "data-theme",
        savedPref.theme ? "light" : "dark"
      );
    }
  }, [savedPref]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
