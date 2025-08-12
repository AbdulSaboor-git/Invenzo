import { useState, useEffect } from 'react';

export default function usePreferences(userId) {
  const defaultPrefs = {
    // general
    addProduct: true,
    editProduct: true,
    deleteProduct: true,
    restrictCategory: false,
    renamingInventory: true,
    viewSalesData: true,
    // inventory display
    viewPurchasePriceColumn: true,
    viewDateAddedColumn: true,
    viewDateUpdatedColumn: true,
    viewCategoryColumn: true,
    defaultSortOrder: 'name',
    // product data
    viewCategory: true,
    viewPurchasePrice: true,
    viewGovtSalePrice: true,
    viewDateAdded: true,
    viewDateUpdated: true,
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
