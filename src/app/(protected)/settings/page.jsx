'use client';
import React, { useEffect, useState } from 'react';
import useAuthUser from '@/hooks/authUser';
import Header from '@/components/header';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuthUser();
  const localStorageKey = `inventoryData_preferences_${user.id}`;
  const [reloadKey, setReloadKey] = useState(true);

  const triggerReload = () => {
    setReloadKey(!reloadKey);
  };

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

  const [preferences, setPreferences] = useState(defaultPrefs);
  const [tempPreferences, setTempPreferences] = useState(defaultPrefs);

  useEffect(() => {
    const savedPrefs = JSON.parse(localStorage.getItem(localStorageKey));
    if (savedPrefs) {
      setPreferences({ ...defaultPrefs, ...savedPrefs });
      setTempPreferences({ ...defaultPrefs, ...savedPrefs });
    }
  }, [localStorageKey]);

  const togglePref = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = () => {
    localStorage.setItem(localStorageKey, JSON.stringify(preferences));
    setTempPreferences(preferences);
    toast.success('Settings saved!');
    triggerReload();
  };

  const cancelChanges = () => {
    setPreferences(tempPreferences);
  };

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'salePrice', label: 'Sales Price' },
  ];

  if (preferences.viewPurchasePriceColumn)
    sortOptions.push({ value: 'purchasePrice', label: 'Purchase Price' });
  if (preferences.viewDateUpdatedColumn)
    sortOptions.push({ value: 'updatedAt', label: 'Date Updated' });
  if (preferences.viewDateAddedColumn)
    sortOptions.push({ value: 'createdAt', label: 'Date Added' });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header key={reloadKey} />
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Settings
          </h1>

          {/* Sections */}
          <SettingsSection title="General">
            {[
              { key: 'addProduct', label: 'Allow Adding Products' },
              { key: 'editProduct', label: 'Allow Editing Products' },
              { key: 'deleteProduct', label: 'Allow Deleting Products' },
              {
                key: 'restrictCategory',
                label: 'Restrict Category Management',
              },
              { key: 'renamingInventory', label: 'Allow Renaming Inventory' },
              { key: 'viewSalesData', label: 'View Sales Data' },
            ].map((item) => (
              <ToggleRow
                key={item.key}
                label={item.label}
                value={preferences[item.key]}
                onChange={() => togglePref(item.key)}
              />
            ))}
          </SettingsSection>

          <SettingsSection title="Inventory Display">
            {[
              {
                key: 'viewPurchasePriceColumn',
                label: 'View Purchase Price Column',
              },
              { key: 'viewCategoryColumn', label: 'View Category Column' },
              { key: 'viewDateAddedColumn', label: 'View Date Added Column' },
              {
                key: 'viewDateUpdatedColumn',
                label: 'View Date Updated Column',
              },
            ].map((item) => (
              <ToggleRow
                key={item.key}
                label={item.label}
                value={preferences[item.key]}
                onChange={() => {
                  setPreferences((prev) => ({
                    ...prev,
                    defaultSortOrder: 'name',
                  }));
                  togglePref(item.key);
                }}
              />
            ))}

            {/* Sort dropdown */}
            <div className="flex justify-between items-center  px-4 py-3">
              <span className="text-gray-700">Default Sort Order</span>
              <select
                value={preferences.defaultSortOrder}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    defaultSortOrder: e.target.value,
                  }))
                }
                className="border border-gray-300 min-w-[150px] rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </SettingsSection>

          <SettingsSection title="Product Details">
            {[
              { key: 'viewCategory', label: 'View Category' },
              { key: 'viewPurchasePrice', label: 'View Purchase Price' },
              { key: 'viewGovtSalePrice', label: 'View Govt. Sale Price' },
              { key: 'viewDateAdded', label: 'View Date Added' },
              { key: 'viewDateUpdated', label: 'View Date Updated' },
            ].map((item) => (
              <ToggleRow
                key={item.key}
                label={item.label}
                value={preferences[item.key]}
                onChange={() => togglePref(item.key)}
              />
            ))}
          </SettingsSection>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={cancelChanges}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={savePreferences}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        {title}
      </h2>
      <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <span className="text-gray-700">{label}</span>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          value ? 'bg-emerald-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
