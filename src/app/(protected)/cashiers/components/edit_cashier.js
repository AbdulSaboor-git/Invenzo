import { useState } from 'react';
import { toast } from 'sonner';

export default function EditCashierPopup({ cashier, onClose, onSuccess }) {
  const [name, setName] = useState(cashier.User.firstName || '');
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/cashiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashierId: cashier.id,
          firstName: name.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to edit cashier');
        return;
      }

      toast.success('Cashier updated');
      onSuccess();
      onClose();
    } catch {
      toast.error('Error updating cashier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Cashier</h2>
        <input
          type="text"
          placeholder="Cashier Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleEdit}
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
