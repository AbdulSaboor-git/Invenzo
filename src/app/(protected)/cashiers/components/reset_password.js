import { useState } from 'react';
import { toast } from 'sonner';

export default function ResetPasswordPopup({ cashier, onClose }) {
  const [loading, setLoading] = useState(false);
  const password = `${cashier.User.firstName}.inv`
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase();

  const handleReset = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/cashiers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashierId: cashier.id,
          password: password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to reset password');
        return;
      }

      toast.success(`Password reset. New password: ${password}`);
      onClose();
    } catch {
      toast.error('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center px-4 sm:px-6 z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold text-orange-700 mb-4">
          Reset Password
        </h3>
        <p className="text-gray-700 mb-6">
          This will reset the password to{' '}
          <span className="font-semibold">{password}</span>.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-black disabled:hover:bg-gray-300 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 w-28 bg-orange-600 hover:bg-orange-700 rounded text-white disabled:hover:bg-orange-600 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="border-2 border-gray-200 border-t-transparent animate-spin rounded-full w-4 h-4 mx-auto" />
            ) : (
              'Reset'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
