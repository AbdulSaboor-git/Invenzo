import { useState } from 'react';
import AddCashierPopup from './add_cashier';
import EditCashierPopup from './edit_cashier';
import ResetPasswordPopup from './reset_password';
import DeleteCashierPopup from './delete_cashier';

export default function CashierTable({ cashiers, loading, onChange, adminId }) {
  const [selected, setSelected] = useState(null);
  const [popupType, setPopupType] = useState(null);

  const openPopup = (type, cashier) => {
    setSelected(cashier);
    setPopupType(type);
  };

  const closePopup = () => {
    setPopupType(null);
    setSelected(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold uppercase tracking-wide">
            <tr>
              <th className="px-3 py-3 text-center">#</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Inventory</th>
              <th className="px-3 py-3">Date Added</th>
              <th className="px-3 py-3">Last Modified</th>
              <th className="px-3 py-3">Last Login</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : cashiers?.length > 0 ? (
              cashiers?.map((c, index) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-3 py-2 text-center">{index + 1}</td>
                  <td className="px-3 py-2 font-medium">
                    {c.User.firstName} {c.User.lastName || ''}
                  </td>
                  <td className="px-3 py-2">{c.User.email}</td>
                  <td className="px-3 py-2">{c.Inventory.name}</td>
                  <td className="px-3 py-2">
                    {new Date(c.User.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(c.User.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    {c.User.lastLogin
                      ? new Date(c.User.lastLogin).toLocaleString()
                      : '-'}
                  </td>
                  <td className="px-3 py-2 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => openPopup('edit', c)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openPopup('reset', c)}
                      className="text-orange-600 hover:underline"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => openPopup('delete', c)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-6">
                  No cashiers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Popup */}
      {popupType === 'add' && (
        <AddCashierPopup
          adminId={adminId}
          onClose={closePopup}
          onSuccess={onChange}
        />
      )}
      {popupType === 'edit' && (
        <EditCashierPopup
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

      {/* Add Cashier Button */}
      <div className="mt-4">
        <button
          onClick={() => openPopup('add')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Cashier
        </button>
      </div>
    </>
  );
}
