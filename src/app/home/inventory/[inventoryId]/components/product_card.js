import React from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { useDispatch } from "react-redux";
import { openAddItemForm } from "../../../../../redux/addItemFormSlice";

export default function ProductCard({
  prod,
  isExpanded,
  toggleProductDetails,
  user,
}) {
  const dispatch = useDispatch();

  const handleEditClick = (e) => {
    e.stopPropagation();
    dispatch(openAddItemForm({ heading: "Edit", btn_text: "Update" }));
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
  };

  const handleTableClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="w-full bg-white rounded-xl p-4 text-[#404040] shadow-sm shadow-[#00000061] hover:scale-[1.005] transition-transform duration-200 ease-in-out cursor-pointer"
      onClick={() => toggleProductDetails(prod.id)}
    >
      <div className="flex justify-between">
        <p className="text-sm font-bold">{prod.name}</p>
        {isExpanded && (user === "admin" || user === "manager") && (
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
                    {prod.category.name}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#0079796c] p-1 font-semibold">
                    Purchase Price
                  </td>
                  <td className="border border-[#0079796c] p-1">
                    Rs. {prod.purchasePrice}
                  </td>
                </tr>

                <tr>
                  <td className="border border-[#0079796c] p-1 font-semibold">
                    Sale Price
                  </td>
                  <td className="border border-[#0079796c] p-1">
                    Rs. {prod.salePrice}
                  </td>
                </tr>
                {prod.govtSalePrice !== null && prod.govtSalePrice !== 0 && (
                  <tr>
                    <td className="border border-[#0079796c] p-1 font-semibold">
                      Govt. Sale Price
                    </td>
                    <td className="border border-[#0079796c] p-1">
                      Rs. {prod.govtSalePrice}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="border border-[#0079796c] p-1 font-semibold">
                    Date Added
                  </td>
                  <td className="border border-[#0079796c] p-1">
                    {prod.createdAt}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#0079796c] p-1 font-semibold">
                    Date Updated
                  </td>
                  <td className="border border-[#0079796c] p-1">
                    {prod.updatedAt}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
