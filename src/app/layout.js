"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "./reduxProvider";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  useEffect(() => {
    const theme = JSON.parse(localStorage.getItem("theme"));
    const scheme = localStorage.getItem("colorScheme");
    if (theme !== null) {
      document.documentElement.setAttribute(
        "data-theme",
        theme ? "light" : "dark"
      );
    }
    if (scheme !== null) {
      document.documentElement.setAttribute("color-scheme", scheme);
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
