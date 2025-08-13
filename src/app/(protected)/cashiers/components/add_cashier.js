import { useState } from 'react';
import { toast } from 'sonner';

export default function AddCashierPopup({ adminId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;

    const cleanName = name.trim().replace(/\s+/g, '');
    const password = `${cleanName}.inv`.toLowerCase();

    setLoading(true);
    try {
      const res = await fetch('/api/cashiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: name.trim(),
          userId: adminId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to add cashier');
        return;
      }

      toast.success(`Cashier added. Password: ${password}`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Error adding cashier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add Cashier</h2>
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
            onClick={handleAdd}
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
