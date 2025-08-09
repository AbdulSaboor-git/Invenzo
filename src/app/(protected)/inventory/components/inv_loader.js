import React from "react";

export default function InvLoader() {
  return (
    <tr className="animate-pulse ">
      <td className="px-3 py-4 md:px-6 md:py-4">
        <div className="h-4 bg-gray-200 rounded w-4" />
      </td>
      <td className="px-3 py-4 min-w-[170px] md:px-6 md:py-4">
        <div className="h-4 bg-gray-200 rounded w-32" />
      </td>
      <td className="px-3 py-4 min-w-[110px] md:px-6 md:py-4">
        <div className="h-4 bg-gray-200 rounded w-20" />
      </td>
      <td className="px-3 py-4 md:px-6 min-w-[110px] md:py-4">
        <div className="h-4 bg-gray-200 rounded w-20" />
      </td>
      <td className="px-3 py-4 min-w-[130px] md:px-6 md:py-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
      </td>
      <td className="px-3 py-4 min-w-[140px] md:px-6 md:py-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
      </td>
      <td className="px-3 py-4 min-w-[140px] md:px-6 md:py-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
      </td>
    </tr>
  );
}
