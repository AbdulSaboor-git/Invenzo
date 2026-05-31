// src/hooks/usePreferences.js

import { useState, useEffect } from 'react';
import { getDefaultPreferences } from '@/config/preferences';

export default function usePreferences(userId, role) {
  const [prefs, setPrefs] = useState(getDefaultPreferences(role));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ FIX: no userId means no user is logged in — resolve loading immediately
    if (!userId) {
      setLoading(false);
      return;
    }

    const defaults = getDefaultPreferences(role);

    try {
      const saved = JSON.parse(
        localStorage.getItem(`inventoryData_preferences_${userId}`)
      );

      if (saved) {
        setPrefs({ ...defaults, ...saved });
      } else {
        setPrefs(defaults);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
      setPrefs(defaults);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  return { prefs, loading };
}
