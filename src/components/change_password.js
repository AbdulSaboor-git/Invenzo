'use client';
import useAuthUser from '@/hooks/authUser';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ChangePasswordPopup({ user, onClose, cancel }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { fetchFreshUser } = useAuthUser();

  const isDisabled =
    loading ||
    !oldPassword.trim() ||
    !newPassword.trim() ||
    !confirmPassword.trim() ||
    newPassword.length < 5 ||
    newPassword !== confirmPassword;

  const handleSave = async () => {
    if (!navigator.onLine) {
      toast.error('No internet connection. Please try again when online.');
      return;
    }

    if (oldPassword === newPassword) {
      toast.error('New password cannot be the same as the old password.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/user/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          oldPassword: oldPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update password');
        return;
      }

      toast.success('Password updated successfully!');
      onClose();

      // refresh user in background
      fetchFreshUser();
    } catch (err) {
      toast.error('Unexpected error while updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 text-sm bg-black/20 flex items-center justify-center z-50 px-4 sm:px-6 transition ease-in-out backdrop-blur-[2px]">
      <div
        className="bg-white max-h-[96%] hidden_scroll_bar overflow-auto rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg py-8 px-6 sm:py-8 sm:px-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={cancel}
          disabled={loading}
          aria-label="Close change password form"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Change Password
        </h3>

        {/* Fields */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col items-start gap-2 w-full">
            <label className="block font-medium text-gray-700">
              Old Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter old password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-start gap-2 w-full">
            <label className="block font-medium text-gray-700">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {newPassword && newPassword.length < 5 && (
              <p className="text-xs text-red-500">
                Password must be at least 5 characters
              </p>
            )}
          </div>
          <div className="flex flex-col items-start gap-2 w-full">
            <label className="block font-medium text-gray-700">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={cancel}
            disabled={loading}
            className="px-6 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isDisabled}
            className="px-6 py-3 bg-blue-500 w-28 hover:bg-blue-600 text-white font-semibold rounded-lg transition disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="border-2 border-gray-200 border-t-transparent animate-spin rounded-full w-5 h-5 mx-auto" />
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
