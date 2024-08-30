"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "./reduxProvider";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  useEffect(() => {
    const theme = JSON.parse(localStorage.getItem("theme"));
    if (theme !== null) {
      document.documentElement.setAttribute(
        "data-theme",
        theme ? "light" : "dark"
      );
    }
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
