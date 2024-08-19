import React, { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";

export default function ProductCard({
  prod,
  isExpanded,
  toggleProductDetails,
  user,
  openEditForm,
  handleDeleteClick,
  setProd,
  userId,
}) {
  const handleTableClick = (e) => {
    e.stopPropagation();
  };
  let savedPreferences = [];

  if (user) {
    savedPreferences = JSON.parse(
      localStorage.getItem(`preferences_${userId}`)
    );
  }
  return (
    <div
      className="w-full bg-white rounded-xl p-4 text-[#424242] shadow-sm shadow-[#00000061] hover:scale-[1.005] transition-transform duration-200 ease-in-out cursor-pointer"
      onClick={() => toggleProductDetails(prod.id)}
    >
      <div className="flex justify-between">
        <p className="text-sm font-bold">{prod.name}</p>
        {isExpanded && user !== "viewer" && savedPreferences.add_edit_del && (
          <div className="flex gap-3 text-base md:text-lg pr-2">
            <button
              className="hover:text-green-600 transition-colors duration-200 ease-in-out"
              onClick={(setProd(prod), openEditForm)}
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
      <p className="text-[13px] text-[#626262]">Rs. {prod.salePrice}</p>
      {prod.govtSalePrice !== null && prod.govtSalePrice !== 0 && (
        <p className="text-[#626262] text-[13px]">
          Rs. {prod.govtSalePrice} (Govt)
        </p>
      )}
      <div className="flex justify-center ">
        {isExpanded && (
          <div
            className="m-3 p-7 md:px-10 w-full max-w-[600px] rounded-3xl shadow-sm bg-[#dbeded] hover:bg-[#cde4e4] transition-colors duration-200 ease-in-out"
            style={{ boxShadow: "0 0 10px -2px #00000096" }}
            onClick={handleTableClick}
          >
            <p className="font-bold py-2 text-center text-teal-700 text-base md:text-[18px]">
              {prod.name}
            </p>
            <table className="w-full text-center text-[12px] md:text-[14px] ">
              <tbody>
                {/* <tr>
                  <td className="border border-[#0079796c] p-1 font-semibold min-w-[130px]">
                    Name
                  </td>
                  <td className="border border-[#0079796c] p-1 min-w-[130px]">
                    {prod.name}
                  </td>
                </tr> */}
                {savedPreferences.categ && (
                  <tr>
                    <td className="border border-[#0079796c] text-teal-800 p-1 font-semibold">
                      Category
                    </td>
                    <td className="border border-[#0079796c] p-1">
                      {prod.category.name}
                    </td>
                  </tr>
                )}
                {savedPreferences.pp && (
                  <tr>
                    <td className="border border-[#0079796c] text-teal-800 p-1 font-semibold">
                      Purchase Price
                    </td>
                    <td className="border border-[#0079796c] p-1">
                      Rs. {prod.purchasePrice}
                    </td>
                  </tr>
                )}

                <tr>
                  <td className="border border-[#0079796c] text-teal-800 p-1 font-semibold">
                    Sale Price
                  </td>
                  <td className="border border-[#0079796c] p-1">
                    Rs. {prod.salePrice}
                  </td>
                </tr>
                {prod.govtSalePrice !== null && prod.govtSalePrice !== 0 && (
                  <tr>
                    <td className="border border-[#0079796c] text-teal-800 p-1 font-semibold">
                      Govt. Sale Price
                    </td>
                    <td className="border border-[#0079796c] p-1">
                      Rs. {prod.govtSalePrice}
                    </td>
                  </tr>
                )}
                {savedPreferences.dateAdd === true && (
                  <tr>
                    <td className="border border-[#0079796c] text-teal-800 p-1 font-semibold">
                      Date Added
                    </td>
                    <td className="border border-[#0079796c] p-1 min-w-[140px]">
                      {new Date(prod.createdAt).toLocaleString("en-GB", {
                        hour12: true,
                        timeZone: "Asia/Karachi",
                      })}
                    </td>
                  </tr>
                )}
                {savedPreferences.dateUpdate === true && (
                  <tr>
                    <td className="border border-[#0079796c] text-teal-800 p-1 font-semibold">
                      Date Updated
                    </td>
                    <td className="border border-[#0079796c] p-1">
                      {new Date(prod.updatedAt).toLocaleString("en-GB", {
                        hour12: true,
                        timeZone: "Asia/Karachi",
                      })}
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
