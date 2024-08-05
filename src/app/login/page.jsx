"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { setCookie } from "cookies-next";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignUpClick = () => {
    router.push("/sign-up");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

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
        throw new Error(data.error || "Login failed");
      }

      // Handle successful login (e.g., store token, user info, redirect user)
      // Set the cookies
      setCookie("token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      setCookie("user", JSON.stringify(data.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      dispatch(setUser(data.user)); // Store user in Redux
      router.push("/user"); // Redirect to a different page after successful login
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="max-w-[1400px] w-full">
        <Header />
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-md bg-[#ffffff95] p-8 m-10 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">
              Login
            </h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="password"
                  type="password"
                  placeholder="**********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="mb-4 text-xs text-red-500 text-center">
                  {error}
                </div>
              )}
              <div className="flex items-center justify-between">
                <button
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Sign In
                </button>
              </div>
            </form>
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <button
                  onClick={handleSignUpClick}
                  className="text-teal-600 hover:text-teal-700 font-bold"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
