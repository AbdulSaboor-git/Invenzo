'use client';
import React, { useEffect, useState } from 'react';
import useAuthUser from '@/hooks/authUser';
import Header from '@/components/header';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, logout } = useAuthUser();
  const localStorageKey = `inventoryData_preferences_${user.id}`;

  const defaultPrefs = {
    addProduct: true,
    editProduct: true,
    deleteProduct: true,
    viewPurchasePrice: true,
    viewGovtSalePrice: true,
    viewDateAdded: true,
    viewDateUpdated: true,
    viewCategory: true,
    viewSalesData: true,
    restrictCategory: false,
    defaultSortOrder: 'name',
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
    toast.success('Settings saved!');
    // window.history.back();
    window.location.reload();
  };

  const cancelChanges = () => {
    setPreferences(tempPreferences);
  };

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'purchasePrice', label: 'Purchase Price' },
    { value: 'salePrice', label: 'Sales Price' },
    { value: 'createdAt', label: 'Date Added' },
    { value: 'updatedAt', label: 'Date Updated' },
  ];

  return (
    <div className="min-h-screen md:bg-gray-100 md:pb-6">
      <Header />
      <div className="w-full md:max-w-2xl place-self-center bg-white md:shadow-lg md:rounded-2xl md:mt-6 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Settings</h1>

        <div className="space-y-6">
          {/* Toggles */}
          {[
            { key: 'addProduct', label: 'Allow Adding Products' },
            { key: 'editProduct', label: 'Allow Editing Products' },
            { key: 'deleteProduct', label: 'Allow Deleting Products' },
            { key: 'viewPurchasePrice', label: 'View Purchase Price' },
            // { key: 'viewGovtSalePrice', label: 'View Govt. Sale Price' },
            { key: 'viewCategory', label: 'View Category' },
            { key: 'viewDateAdded', label: 'View Date Added' },
            { key: 'viewDateUpdated', label: 'View Date Updated' },
            { key: 'viewSalesData', label: 'View Sales Data' },
            { key: 'restrictCategory', label: 'Restrict Category Management' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex justify-between items-center border-b pb-3"
            >
              <span className="text-gray-700">{item.label}</span>
              <button
                onClick={() => togglePref(item.key)}
                className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                  preferences[item.key] ? 'bg-green-500' : 'bg-gray-300'
                } relative`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 absolute top-0.5 ${
                    preferences[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></span>
              </button>
            </div>
          ))}

          {/* Dropdown */}
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-700">Default Sort Order</span>
            <select
              value={preferences.defaultSortOrder}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  defaultSortOrder: e.target.value,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-1 text-gray-700"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={cancelChanges}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={savePreferences}
            className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
          >
            Save
          </button>
        </div>

        {/* Logout */}
        {/* <div className="mt-8 border-t pt-4">
          <button
            onClick={logout}
            className="w-full px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            Logout
          </button>
        </div> */}
      </div>
    </div>
  );
}
