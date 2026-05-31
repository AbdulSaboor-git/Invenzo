'use client';
import useAuthUser from '@/hooks/authUser';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiFetch';

export default function EditProfilePopup({ user, onClose, cancel }) {
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || ''
  );
  const [loading, setLoading] = useState(false);

  const { fetchFreshUser } = useAuthUser();

  const isDisabled = !firstName.trim() || loading;

  const handleSave = async () => {
    if (!navigator.onLine) {
      toast.error('No internet connection. Please try again when online.');
      return;
    }

    const unchanged =
      firstName.trim() === user?.firstName &&
      lastName.trim() === user?.lastName &&
      profilePicture.trim() === user?.profilePicture;

    if (unchanged) {
      cancel();
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch('/api/user/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          profilePicture: profilePicture.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update profile');
        return;
      }

      toast.success('Profile updated successfully!');
      onClose();
      // refresh user (your useAuth hook auto-checks localStorage and fetches fresh user)
      fetchFreshUser(); // simplest way
    } catch (err) {
      toast.error('Unexpected error while updating profile.');
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
          aria-label="Close edit profile form"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Edit Profile
        </h3>

        {/* Fields */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col items-start gap-2 w-full">
            <label className="block font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter first name"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={firstName}
              onChange={(e) =>
                setFirstName(e.target.value.replace(/[^a-zA-Z]/g, ''))
              }
            />
          </div>
          <div className="flex flex-col items-start gap-2 w-full">
            <label className="block font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              placeholder="Enter last name"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={lastName}
              onChange={(e) =>
                setLastName(e.target.value.replace(/[^a-zA-Z]/g, ''))
              }
            />
          </div>
          <div className="flex flex-col items-start gap-2 w-full">
            <label className="block font-medium text-gray-700">
              Profile Picture URL
            </label>
            <input
              type="url"
              placeholder="Paste image link"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
            />
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
