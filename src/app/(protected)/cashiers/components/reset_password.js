import { useState } from 'react';
import { toast } from 'sonner';

export default function ResetPasswordPopup({ cashier, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cashiers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashierId: cashier.id,
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
        <p className="text-gray-600 mb-4">
          This will reset the password to{' '}
          <strong>{cashier.User.firstName}.inv</strong>
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset'}
          </button>
        </div>
      </div>
    </div>
  );
}
