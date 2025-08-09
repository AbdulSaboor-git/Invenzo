"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuthUser from "@/hooks/authUser";
import Loading from "../loading";

export default function ProtectedLayout({ children }) {
  const { user, userLoading } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
