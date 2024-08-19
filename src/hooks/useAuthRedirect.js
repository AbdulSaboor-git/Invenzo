// hooks/useAuthRedirect.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export const useAuthRedirect = () => {
  const router = useRouter();
  const user = useSelector((state) => state.user);

  const isAuthenticated = () => {
    return user ? true : false;
  };

  useEffect(() => {
    const user = isAuthenticated();

    if (user) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  }, [router]);
};
