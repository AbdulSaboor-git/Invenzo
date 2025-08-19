import React, { useEffect, useState } from 'react';
import { MdLogout } from 'react-icons/md';
import { toast } from 'sonner';
import EditProfilePopup from './edit_profile';
import ChangePasswordPopup from './change_password';
import useAuthUser from '@/hooks/authUser';

export default function UserProfile({ CloseForm, user, showProfile }) {
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const { logout } = useAuthUser();

  const username = user?.firstName + ' ' + (user?.lastName || '');
  const profilePic = user?.profilePicture;
  const email = user?.email;
  const defaultProfilePictureLink = 'default.png';

  useEffect(() => {
    if (showProfile) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showProfile]);

  return (
    <>
      <div
        className={`fixed inset-0 text-sm bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-6 transition ease-in-out ${
          showProfile
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={CloseForm}
      >
        <div
          className="bg-white backdrop-blur-md rounded-xl shadow-2xl max-w-lg w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className="hidden md:block absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={CloseForm}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Heading */}
          <h1 className="font-bold text-xl md:text-2xl text-center pb-4 text-gray-800">
            User Profile
          </h1>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <img
                className="object-cover w-[110px] h-[110px] md:w-[130px] md:h-[130px] rounded-full border-4 border-white ring-2 ring-gray-200 transition-all duration-300"
                src={profilePic || defaultProfilePictureLink}
                alt="avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultProfilePictureLink;
                }}
              />
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4 text-center">
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wider">
                Name
              </p>
              <p className="text-lg font-medium text-gray-800">{username}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wider">
                Email
              </p>
              <p className="text-lg font-medium text-gray-800">{email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wider">
                {user?.role === 'superadmin' ? 'super-admin' : `${user?.role}`}
              </p>
              {user?.role === 'superadmin' && (
                <p className="text-lg font-medium text-gray-800">INVENZO</p>
              )}
              {user?.role === 'superadmin' && (
                <p className="mt-4 text-xs uppercase text-gray-500 tracking-wider">
                  admin
                </p>
              )}
              <p className="text-lg font-medium text-gray-800">
                {user?.invName}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 mt-8">
            {user.role != 'cashier' && (
              <button
                onClick={() => setShowEditPopup(true)}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                Edit Profile
              </button>
            )}
            {user.role != 'cashier' && (
              <button
                onClick={() => setShowPasswordPopup(true)}
                className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition"
              >
                Change Password
              </button>
            )}
            <button
              onClick={() => {
                toast.success('Logged out');
                CloseForm();
                logout();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition flex-1"
            >
              <MdLogout size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showEditPopup && (
        <EditProfilePopup
          user={user}
          onClose={() => {
            setShowEditPopup(false);
            CloseForm();
          }}
          cancel={() => setShowEditPopup(false)}
        />
      )}
      {showPasswordPopup && (
        <ChangePasswordPopup
          user={user}
          onClose={() => {
            setShowPasswordPopup(false);
            CloseForm();
          }}
          cancel={() => setShowPasswordPopup(false)}
        />
      )}
    </>
  );
}
