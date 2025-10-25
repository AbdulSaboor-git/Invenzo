// src/config/preferences.js

// Base/default preferences (for cashier or lowest permission level)
export const basePreferences = {
  // general
  addProduct: false,
  editProduct: false,
  deleteProduct: false,
  allowCategoryManagement: false,
  renamingInventory: false,
  viewSalesData: true,
  defaultPage: 'pos',

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

  // security
  requireSettingsPassword: true,
  requireSuperAdminPassword: true,
};

// Preferences for non-cashier roles (manager/admin/superadmin)
export const nonCashierPreferences = {
  ...basePreferences,
  addProduct: true,
  editProduct: true,
  deleteProduct: true,
  allowCategoryManagement: true,
  renamingInventory: true,
  viewSalesData: true,
  defaultPage: 'inventory',
  viewPurchasePriceColumn: true,
  viewDateAddedColumn: true,
  viewDateUpdatedColumn: true,
  viewCategoryColumn: true,
  viewPurchasePrice: true,
  viewDateAdded: true,
  viewDateUpdated: true,
  requireSettingsPassword: false,
  requireSuperAdminPassword: false,
};

// Helper to get default preferences based on role
export const getDefaultPreferences = (role) =>
  role !== 'cashier' ? nonCashierPreferences : basePreferences;
