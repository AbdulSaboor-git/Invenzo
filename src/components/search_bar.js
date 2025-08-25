import React from 'react';
import { MdClose, MdSearch } from 'react-icons/md';

export default function SearchBar({ searchQuery, setSearchQuery, className }) {
  return (
    <div className="flex w-full items-stretch md:max-w-md">
      <div className="relative w-full text-gray-500 h-10">
        <input
          type="text"
          placeholder="Search by name, category, or tag..."
          className={`${className} border border-gray-200 md:border-r-0 rounded-s-md rounded-e-md md:rounded-e-none md:rounded-s-md px-3 py-2 pr-7 w-full text-sm h-10
                         outline-none focus:border-green-300 bg-gray-50`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <div
            className="absolute inset-y-0 right-0 h-full p-2 flex items-center cursor-pointer hover:text-gray-700"
            onClick={() => setSearchQuery('')}
          >
            <MdClose />
          </div>
        )}
      </div>
      <div className="hidden md:flex h-10 max-h-10 cursor-pointer bg-green-100 items-center justify-center w-10 rounded-e-md text-green-800 border border-green-300 hover:bg-green-200 transition">
        <MdSearch size={20} />
      </div>
    </div>
  );
}
