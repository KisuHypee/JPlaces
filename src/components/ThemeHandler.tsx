'use client';

import { useEffect } from 'react';
import { db } from '@/lib/db';

export default function ThemeHandler() {
  useEffect(() => {
    const applyTheme = async () => {
      try {
        // 1. Check localStorage first for immediate result
        const localTheme = localStorage.getItem('jplaces-theme');
        if (localTheme) {
          document.documentElement.setAttribute('data-theme', localTheme);
        }

        // 2. Sync with DB (source of truth)
        const themePref = await db.preferences.get('theme');
        if (themePref) {
          document.documentElement.setAttribute('data-theme', themePref.value);
          localStorage.setItem('jplaces-theme', themePref.value);
        }
      } catch (err) {
        console.error('Failed to load theme preference:', err);
      }
    };

    applyTheme();
  }, []);

  return null;
}
