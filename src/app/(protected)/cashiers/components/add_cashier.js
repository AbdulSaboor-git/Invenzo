'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiFetch';

export default function AddCashierPopup({ adminId, onClose, onSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const isDisabled = !firstName.trim() || loading;

  const handleAdd = async () => {
    if (!navigator.onLine) {
      toast.error('No internet connection. Please try again when online.');
      return;
    }

    if (!firstName.trim()) {
      toast.error('Cashier first name is required.');
      return;
    }

    const cleanName = firstName.trim().replace(/\s+/g, '');
    const password = `${cleanName}.inv`.toLowerCase();

    try {
      setLoading(true);

      const res = await apiFetch('/api/cashiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          userId: adminId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to add cashier');
        return;
      }

      toast.success(`Cashier added successfully! Password: ${password}`);

      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Unexpected error while adding cashier.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 text-sm bg-black/20 flex items-center justify-center z-50 px-4 sm:px-6 transition ease-in-out backdrop-blur-[2px]`}
    >
      <div
        className="bg-white max-h-[96%] hidden_scroll_bar overflow-auto rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg py-8 px-6 sm:py-8 sm:px-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 "
          onClick={onClose}
          disabled={loading}
          aria-label="Close add cashier form"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Add Cashier
        </h3>

        {/* Name Field */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col items-start gap-2 w-full ">
            <label
              htmlFor="first-name"
              className="block font-medium text-gray-700"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="first-name"
              type="text"
              placeholder="Enter first name"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={firstName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                setFirstName(value);
              }}
            />
          </div>
          <div className="flex flex-col items-start gap-2 w-full ">
            <label
              htmlFor="last-name"
              className="block font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              placeholder="Enter last name"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={lastName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                setLastName(value);
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={isDisabled}
            className="px-6 py-3 bg-green-500 w-24 hover:bg-green-600 text-white font-semibold rounded-lg transition disabled:hover:bg-green-500 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="border-2 border-gray-200 border-t-transparent animate-spin rounded-full w-5 h-5 mx-auto" />
            ) : (
              'Add'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
