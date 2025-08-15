import { useState, useEffect } from 'react';

export default function usePreferences(userId, role) {
  const basePrefs = {
    // general
    addProduct: false,
    editProduct: false,
    deleteProduct: false,
    allowCategoryManagement: false,
    renamingInventory: false,
    viewSalesData: true,
    // inventory display
    viewPurchasePriceColumn: false,
    viewDateAddedColumn: false,
    viewDateUpdatedColumn: true,
    viewCategoryColumn: true,
    defaultSortOrder: 'name',
    // product data
    viewCategory: true,
    viewPurchasePrice: false,
    viewGovtSalePrice: true,
    viewDateAdded: false,
    viewDateUpdated: true,
    //security
    requireSettingsPassword: true,
  };

  const nonCashierPrefs = {
    ...basePrefs,
    addProduct: true,
    editProduct: true,
    deleteProduct: true,
    allowCategoryManagement: true,
    renamingInventory: true,
    viewSalesData: true,
    viewPurchasePriceColumn: true,
    viewDateAddedColumn: true,
    viewDateUpdatedColumn: true,
    viewCategoryColumn: true,
    viewPurchasePrice: true,
    viewDateAdded: true,
    viewDateUpdated: true,
  };

  const [prefs, setPrefs] = useState(basePrefs);

  // Load from localStorage or set defaults based on role
  useEffect(() => {
    if (!userId) return;

    let defaultToUse = role !== 'cashier' ? nonCashierPrefs : basePrefs;

    try {
      const saved = JSON.parse(
        localStorage.getItem(`inventoryData_preferences_${userId}`)
      );
      if (saved) {
        setPrefs({ ...defaultToUse, ...saved });
      } else {
        setPrefs(defaultToUse);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
      setPrefs(defaultToUse);
    }
  }, [userId, role]);

  return prefs;
}
