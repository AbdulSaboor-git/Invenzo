import React, { useEffect } from 'react';
import { MdLogout } from 'react-icons/md';
import { toast } from 'sonner';

export default function UserProfile({ CloseForm, user, logout, showProfile }) {
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
    <div
      className={`fixed inset-0 text-sm bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-6 transition ease-in-out ${
        showProfile
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
      onClick={CloseForm}
    >
      {' '}
      <div
        className="bg-white backdrop-blur-md rounded-xl shadow-2xl max-w-lg w-full p-6 relative "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
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
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            toast.success('Loged out');
            CloseForm();
            logout();
          }}
          className="flex items-center justify-center gap-2 p-3 bg-red-500 hover:bg-red-600 transition-colors rounded-lg text-white w-full mt-8 text-base md:text-lg font-medium"
        >
          <MdLogout size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
