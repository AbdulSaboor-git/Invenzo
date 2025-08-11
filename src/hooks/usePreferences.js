import { useState, useEffect } from 'react';

export default function usePreferences(userId) {
  const defaultPrefs = {
    addProduct: true,
    editProduct: true,
    deleteProduct: true,
    viewPurchasePrice: true,
    viewGovtSalePrice: true,
    restrictCategory: false,
    renamingInventory: true,
    viewCategory: true,
    viewDateAdded: true,
    viewDateUpdated: true,
    viewSalesData: true,
    defaultSortOrder: 'name',
  };

  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    if (!userId) return;

    try {
      const saved = JSON.parse(
        localStorage.getItem(`inventoryData_preferences_${userId}`)
      );
      if (saved) {
        setPrefs({ ...defaultPrefs, ...saved });
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  }, [userId]);

  return prefs;
}
