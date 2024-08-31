"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import Header from "@/components/header";
import Footer from "@/components/footer";
import useAuthUser from "@/hooks/authUser";
import Loader from "@/components/loader";
import { triggerNotification } from "@/redux/notificationThunk";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { user, userLoading } = useAuthUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userLoading && user) {
      router.push("/home");
    }
  }, [user, userLoading, router]);

  if (userLoading || user) {
    return <Loader />;
  }

  const showMessage = (msg, state) => {
    dispatch(
      triggerNotification({
        msg: msg,
        success: state,
      })
    );
  };

  // const handleSignUpClick = () => {
  //   router.push("/sign-up");
  // };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || "Login failed", false);
        throw new Error(data.error || "Login failed");
      }

      // Handle successful login (e.g., store token, user info, redirect user)
      // Set the cookies
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch(setUser(data.user)); // Store user in Redux
      router.push("/user"); // Redirect to a different page after successful login
    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="max-w-[1400px] w-full">
        <Header user={user} />
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-[360px] bg-[#ffffff47] p-8 py-14 m-10 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-[var(--btn-alt)]">
              LOGIN
            </h2>
            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-5 text-[var(--text-prim)]  text-sm font-bold "
            >
              <div>
                <label className="block mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  spellCheck="false"
                  autoComplete="false"
                  autoCorrect="false"
                  className="shadow text-sm font-normal appearance-none border rounded w-full py-2 px-3 text-[var(--text-sec)] placeholder:text-[var(--text-sec)] leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="shadow text-sm font-normal appearance-none border rounded w-full py-2 px-3 text-[var(--text-sec)] placeholder:text-[var(--text-sec)] leading-tight focus:outline-none focus:shadow-outline"
                  id="password"
                  type="password"
                  placeholder="**********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {/* {error && (
                <div className="mb-4 text-xs text-red-500 text-center">
                  {error}
                </div>
              )} */}
              <div className="flex items-center justify-center mt-8">
                <button
                  disabled={loading}
                  className={`bg-[var(--btn-alt)] transition-all w-24 text-center hover:bg-[var(--btn-alt-sec)] rounded-full text-[var(--text-alt)] font-semibold py-2 px-5 focus:outline-none focus:shadow-outline ${
                    loading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  type="submit"
                >
                  <p className={` ${loading && "animate-bounce"}`}>
                    {loading ? "..." : "Login"}
                  </p>
                </button>
              </div>
            </form>
            {/* <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <button
                  onClick={handleSignUpClick}
                  className="text-teal-600 hover:text-teal-700 font-bold"
                >
                  Sign Up
                </button>
              </p>
            </div> */}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
