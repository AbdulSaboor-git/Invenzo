'use client';
import { useState } from 'react';
import { toast } from 'sonner';

export default function UpdatePasswordPopup({ cashier, onClose, onSuccess }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isDisabled = !oldPassword.trim() || !newPassword.trim() || loading;

  const handleUpdatePassword = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      toast.error('Both fields are required.');
      return;
    }

    if (oldPassword.trim() === newPassword.trim()) {
      toast.error('New password must be different from old password.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/cashiers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashierId: cashier.id,
          oldPassword: oldPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to update password');
        return;
      }

      toast.success(data.message || 'Password updated successfully');
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Error updating password');
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
          aria-label="Close password update form"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Update Password
        </h3>

        {/* Old Password */}
        <div className="space-y-2 mb-4">
          <label
            htmlFor="old-password"
            className="block font-medium text-gray-700"
          >
            Old Password <span className="text-red-500">*</span>
          </label>
          <input
            id="old-password"
            type="password"
            placeholder="Enter old password"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        {/* New Password */}
        <div className="space-y-2 mb-6">
          <label
            htmlFor="new-password"
            className="block font-medium text-gray-700"
          >
            New Password <span className="text-red-500">*</span>
          </label>
          <input
            id="new-password"
            type="password"
            placeholder="Enter new password"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
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
            onClick={handleUpdatePassword}
            disabled={isDisabled}
            className="px-6 py-3 w-32 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition disabled:hover:bg-green-500 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="border-2 border-green-200 border-t-transparent animate-spin rounded-full w-5 h-5 mx-auto" />
            ) : (
              'Update'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
