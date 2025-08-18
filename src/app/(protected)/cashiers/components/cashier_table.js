import { useState, useRef, useEffect } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit, FiKey, FiTrash2 } from 'react-icons/fi';
import EditCashierPopup from './edit_cashier';
import ResetPasswordPopup from './reset_password';
import DeleteCashierPopup from './delete_cashier';
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

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="bg-white md:p-6">
      <div className="overflow-x-auto md:rounded-xl shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wide text-xs">
            <tr>
              <th className="px-3 py-3 text-center">#</th>
              <th className="px-3 py-3 min-w-[140px]">Name</th>
              <th className="px-3 py-3 min-w-[160px]">Email</th>
              <th className="px-3 py-3 min-w-[180px]">Inventory</th>
              <th className="px-3 py-3 min-w-[80px]">Status</th>
              <th className="px-3 py-3 min-w-[120px]">Date Added</th>
              <th className="px-3 py-3 min-w-[140px]">Last Modified</th>
              <th className="px-3 py-3 min-w-[120px]">Last Login</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : cashiers?.length > 0 ? (
              cashiers?.map((c, index) => (
                <tr
                  key={c.id}
                  className={`hover:bg-gray-50 transition ${
                    !c.User.isActive ? 'bg-red-50 hover:bg-red-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 text-center">{index + 1}</td>
                  <td className="px-3 py-2 font-medium">
                    {c.User.firstName} {c.User.lastName || ''}
                  </td>
                  <td className="px-3 py-2">{c.User.email}</td>
                  <td className="px-3 py-2">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {c.Inventory.name}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        c.User.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {c.User.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600 text-sm">
                    {formatDate(c.User.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-gray-600 text-sm">
                    {formatDate(c.User.updatedAt)}
                  </td>
                  <td className="px-3 py-2 text-gray-600 text-sm">
                    {c.User.lastLogin ? (
                      new Date(c.User.lastLogin).toLocaleString()
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
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
                        className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                      >
                        <button
                          onClick={() => openPopup('edit', c)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50"
                        >
                          <FiEdit size={16} /> Edit
                        </button>
                        <button
                          onClick={() => openPopup('update', c)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50"
                        >
                          <FiKey size={16} /> Update Password
                        </button>
                        <button
                          onClick={() => openPopup('reset', c)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50"
                        >
                          <FiKey size={16} /> Reset Password
                        </button>
                        <button
                          onClick={() => openPopup('delete', c)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-gray-50"
                        >
                          <FiTrash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center text-gray-500 py-6">
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
