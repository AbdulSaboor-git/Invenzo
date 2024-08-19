"use client";
import React, { useEffect, useState } from "react";

export default function useAuthInv(invId) {
  const [invLoading, setInvLoading] = useState(true);
  const [invAuthSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const myInv = localStorage.getItem("myInv");
        const modInv = localStorage.getItem("modInv");
        let found = false;

        if (myInv) {
          const parsedMyInv = JSON.parse(myInv);
          found = parsedMyInv.some((inv) => inv.id === invId);
        }

        if (!found && modInv) {
          const parsedModInv = JSON.parse(modInv);
          found = parsedModInv.some((inv) => inv.id === invId);
        }

        setAuthSuccess(found);
      } catch (error) {
        console.error("Error parsing inventory data from localStorage", error);
      } finally {
        setInvLoading(false);
      }
    }
  }, [invId]);

  return { invAuthSuccess, invLoading };
}
