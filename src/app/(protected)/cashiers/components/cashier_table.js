import { useState, useRef, useEffect } from 'react';
import { BsKey, BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit, FiKey, FiTrash2 } from 'react-icons/fi';
import AddCashierPopup from './add_cashier';
import EditCashierPopup from './edit_cashier';
import ResetPasswordPopup from './reset_password';
import DeleteCashierPopup from './delete_cashier';
import { MdKeyOff, MdVpnKeyOff } from 'react-icons/md';
import { IoKey } from 'react-icons/io5';
import UpdatePasswordPopup from './update_password';

export default function CashierTable({ cashiers, loading, onChange, adminId }) {
  const [selected, setSelected] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const openPopup = (type, cashier) => {
    setSelected(cashier);
    setPopupType(type);
    setOpenMenuId(null); // close dropdown
  };

  const closePopup = () => {
    setPopupType(null);
    setSelected(null);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white md:p-6">
      <div className="overflow-x-auto md:rounded-xl shadow-md border border-gray-200 ">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold uppercase tracking-wide">
            <tr>
              <th className="px-3 py-3 text-center">#</th>
              <th className="px-3 py-3 min-w-[100px]">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3 min-w-[200px]">Inventory</th>
              <th className="px-3 py-3 min-w-[120px]">Date Added</th>
              <th className="px-3 py-3 min-w-[140px]">Last Modified</th>
              <th className="px-3 py-3 min-w-[110px]">Last Login</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : cashiers?.length > 0 ? (
              cashiers?.map((c, index) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-3 py-2 text-center">{index + 1}</td>
                  <td className="px-3 py-2 font-medium min-w-[100px]">
                    {c.User.firstName} {c.User.lastName || ''}
                  </td>
                  <td className="px-3 py-2">{c.User.email}</td>
                  <td className="px-3 py-2 min-w-[200px]">
                    {c.Inventory.name}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(c.User.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(c.User.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 min-w-[110px]">
                    {c.User.lastLogin
                      ? new Date(c.User.lastLogin).toLocaleString()
                      : '-'}
                  </td>
                  <td className="px-3 py-2 text-right relative" ref={buttonRef}>
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === c.id ? null : c.id)
                      }
                      className="p-2 rounded hover:bg-gray-100"
                    >
                      <BsThreeDotsVertical size={18} />
                    </button>
                  </td>
                  <td>
                    {openMenuId === c.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-12 mt-3 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                      >
                        <button
                          onClick={() => openPopup('edit', c)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100"
                        >
                          <FiEdit /> Edit
                        </button>
                        <button
                          onClick={() => openPopup('update', c)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100"
                        >
                          <FiKey /> Update Password
                        </button>
                        <button
                          onClick={() => openPopup('reset', c)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100"
                        >
                          <FiKey /> Reset Password
                        </button>
                        <button
                          onClick={() => openPopup('delete', c)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-gray-100"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 py-6">
                  No cashiers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popups */}
      {popupType === 'edit' && (
        <EditCashierPopup
          cashier={selected}
          onClose={closePopup}
          onSuccess={onChange}
        />
      )}
      {popupType === 'update' && (
        <UpdatePasswordPopup
          cashier={selected}
          onClose={closePopup}
          onSuccess={onChange}
        />
      )}
      {popupType === 'reset' && (
        <ResetPasswordPopup cashier={selected} onClose={closePopup} />
      )}
      {popupType === 'delete' && (
        <DeleteCashierPopup
          cashier={selected}
          onClose={closePopup}
          onSuccess={onChange}
        />
      )}
    </div>
  );
}
