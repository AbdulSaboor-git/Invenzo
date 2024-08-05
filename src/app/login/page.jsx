"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Login() {
  const router = useRouter();

  const handleSignUpClick = () => {
    router.push("/sign-up");
  };

  return (
    <div className={`flex min-h-screen flex-col items-center `}>
      <div className="max-w-[1400px] w-full ">
        <Header />
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-md bg-[#ffffff95] p-8 m-10 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">
              Login
            </h2>
            <form>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="username"
                  type="text"
                  placeholder="Username"
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
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
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
