import { useState } from 'react';
import { toast } from 'sonner';

export default function DeleteCashierPopup({ cashier, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cashiers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashierId: cashier.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete cashier');
        return;
      }

      toast.success('Cashier deleted');
      onSuccess();
      onClose();
    } catch {
      toast.error('Error deleting cashier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Delete Cashier</h2>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete{' '}
          <strong>{cashier.User.firstName}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
