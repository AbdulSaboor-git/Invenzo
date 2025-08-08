import Header2 from "@/components/header2";
import React from "react";

export default function NotFound() {
  return (
    <main className=" w-full bg-white">
      <Header2 />
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="max-w-md p-6">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          <a
            href="/"
            className="inline-block bg-black text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    </main>
  );
}
