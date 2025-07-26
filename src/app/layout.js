"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "./reduxProvider";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Invenzo - Inventory Management",
  description: "",
  icons: {
    icon: "/icons/invenzo-128.ico",
  },
};

export default function RootLayout({ children }) {
  useEffect(() => {
    const theme = JSON.parse(localStorage.getItem("theme"));
    const scheme = localStorage.getItem("colorScheme");
    if (theme !== null) {
      document.documentElement.setAttribute(
        "data-theme",
        theme ? "light" : "dark"
      );
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", true);
    }
    if (scheme !== null) {
      document.documentElement.setAttribute("color-scheme", scheme);
    } else {
      document.documentElement.setAttribute("color-scheme", "green");
      localStorage.setItem("colorScheme", "green");
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
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
