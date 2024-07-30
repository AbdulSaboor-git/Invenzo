import React, { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";

export default function ProductCard({
  prod,
  isExpanded,
  toggleProductDetails,
}) {
  const handleTableClick = (e) => {
    e.stopPropagation();
    // Handle table functionality here
    console.log("Tabble clicked");
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    // Handle edit functionality here
    console.log("Edit button clicked");
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    // Handle delete functionality here
    console.log("Delete button clicked");
  };

  return (
    <div
      className="w-full bg-white rounded-xl p-4 text-[#404040] shadow-sm shadow-[#00000061] hover:scale-[1.005] transition-transform duration-200 ease-in-out cursor-pointer"
      onClick={() => toggleProductDetails(prod.id)}
    >
      <div className="flex justify-between">
        <p className="text-sm font-bold">{prod.name}</p>
        {isExpanded && (
          <div className="flex gap-3 text-base md:text-lg pr-2">
            <button
              className="hover:text-green-600 transition-colors duration-200 ease-in-out"
              onClick={handleEditClick}
            >
              <MdEdit />
            </button>
            <button
              className="hover:text-red-600 transition-colors duration-200 ease-in-out"
              onClick={handleDeleteClick}
            >
              <MdDelete />
            </button>
          </div>
        )}
      </div>
      <p className="text-[13px] text-[#626262]">Rs. {prod.sale_price}</p>
      {prod.govt_sale_price !== null && (
        <p className="text-[#626262] text-[13px]">
          Rs. {prod.govt_sale_price} (Govt)
        </p>
      )}
      <div className="flex justify-center ">
        {isExpanded && (
          <div
            className="m-3 p-7 md:px-10 w-full max-w-[600px] rounded-3xl shadow-sm bg-[#dbeded] hover:bg-[#cde4e4] transition-colors duration-200 ease-in-out"
            style={{ boxShadow: "0 0 10px -2px #00000096" }}
            onClick={handleTableClick}
          >
            <p className="font-bold py-2">Product Details</p>
            <table className="w-full text-center text-[13px]">
              <tbody>
                <tr>
                  <td className="border border-[#0079796c] p-1 font-semibold min-w-[130px]">
                    Name
                  </td>
                  <td className="border border-[#0079796c] p-1 min-w-[130px]">
                    {prod.name}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#0079796c] p-1 font-semibold">
                    Category
                  </td>
                  <td className="border border-[#0079796c] p-1">
                    {prod.category}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#0079796c] p-1 font-semibold">
                    Purchase Price
                  </td>
                  <td className="border border-[#0079796c] p-1">
                    Rs. {prod.purchase_price}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#0079796c] p-1 font-semibold">
                    Sale Price
                  </td>
                  <td className="border border-[#0079796c] p-1">
                    Rs. {prod.sale_price}
                  </td>
                </tr>

                {prod.govt_sale_price !== null && (
                  <tr>
                    <td className="border border-[#0079796c] p-1 font-semibold">
                      Govt. Sale Price
                    </td>
                    <td className="border border-[#0079796c] p-1">
                      Rs. {prod.govt_sale_price}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
