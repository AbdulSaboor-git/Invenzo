'use client';
import { useState } from 'react';
import { toast } from 'sonner';

export default function EditCashierPopup({ cashier, onClose, onSuccess }) {
  const [name, setName] = useState(cashier.User.firstName || '');
  const [isActive, setIsActive] = useState(cashier.User.isActive);
  const [loading, setLoading] = useState(false);

  const isDisabled = !name.trim() || loading;

  const handleEdit = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }

    if (!name.trim()) {
      toast.error('Cashier name is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/cashiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashierId: cashier.id,
          firstName: name.trim(),
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to edit cashier');
        return;
      }

      toast.success('Cashier updated successfully');
      onSuccess();
      onClose();
    } catch {
      toast.error('Error updating cashier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 text-sm bg-black/30 flex items-center justify-center z-50 px-4 sm:px-6 transition ease-in-out backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white max-h-[96%] hidden_scroll_bar overflow-auto rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg py-8 px-6 sm:py-8 sm:px-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
          disabled={loading}
          aria-label="Close edit cashier form"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Edit Cashier
        </h3>

        {/* Name Field */}
        <div className="space-y-4 pb-6">
          <div>
            <label
              htmlFor="cashier-name"
              className="block font-medium text-gray-700"
            >
              Cashier Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cashier-name"
              type="text"
              placeholder="Enter cashier name"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Active/Inactive Select */}
          <div>
            <label
              htmlFor="cashier-status"
              className="block font-medium text-gray-700"
            >
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="cashier-status"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
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
            onClick={handleEdit}
            disabled={isDisabled}
            className="px-6 py-3 w-24 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition disabled:hover:bg-green-500 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="border-2 border-green-200 border-t-transparent animate-spin rounded-full w-5 h-5 mx-auto" />
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
