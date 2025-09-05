import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t mt-8 p-4 flex flex-col md:flex-row items-center justify-between text-gray-600 text-sm">
      <div className="flex items-center space-x-2">
        <img className="h-8 aspect-auto" src="/invenzo_logo.png" alt="Logo" />
      </div>
      <div className="mt-2 md:mt-0">
        © {year} Invenzo. All rights reserved.
      </div>
    </footer>
  );
}
