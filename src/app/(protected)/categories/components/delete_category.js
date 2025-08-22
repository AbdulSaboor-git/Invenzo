import { useState } from 'react';
import { toast } from 'sonner';

export default function DeleteCategoryPopup({
  invId,
  category,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/${invId}/category`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete category');
        return;
      }

      toast.success('Category deleted successfully');
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Error deleting category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center px-4 sm:px-6 z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold text-red-700 mb-4">
          Delete Category
        </h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{category.name}</span>?
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
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 w-28 bg-red-600 hover:bg-red-700 rounded text-white disabled:hover:bg-red-700 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="border-2 border-gray-200 border-t-transparent animate-spin rounded-full w-4 h-4 mx-auto" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
