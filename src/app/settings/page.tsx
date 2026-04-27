'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Moon, Sun, DollarSign, Globe } from 'lucide-react';
import { db } from '@/lib/db';
import styles from './page.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [currency, setCurrency] = useState('MYR');

  useEffect(() => {
    const fetchPrefs = async () => {
      const themePref = await db.preferences.get('theme');
      const currPref = await db.preferences.get('currency');
      if (themePref) {
        setTheme(themePref.value);
        document.documentElement.setAttribute('data-theme', themePref.value);
        localStorage.setItem('jplaces-theme', themePref.value);
      }
      if (currPref) setCurrency(currPref.value);
    };
    fetchPrefs();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await db.preferences.put({ key: 'theme', value: newTheme });
    localStorage.setItem('jplaces-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const updateCurrency = async (curr: string) => {
    setCurrency(curr);
    await db.preferences.put({ key: 'currency', value: curr });
  };

  return (
    <div className={styles.container}>
      <header className={`${styles.header} glass`}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Settings</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Appearance</h2>
          <div className={styles.settingCard} onClick={toggleTheme}>
            <div className={styles.settingIcon}>
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <div className={styles.settingInfo}>
              <h3>Dark Mode</h3>
              <p>Current: {theme === 'light' ? 'Off' : 'On'}</p>
            </div>
            <div className={styles.toggle}>
              <div className={`${styles.toggleThumb} ${theme === 'dark' ? styles.active : ''}`} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Localization</h2>
          <div className={styles.settingCard}>
            <div className={styles.settingIcon}><DollarSign size={20} /></div>
            <div className={styles.settingInfo}>
              <h3>Preferred Currency</h3>
              <p>Converts Yen to your choice</p>
            </div>
            <select 
              value={currency} 
              onChange={(e) => updateCurrency(e.target.value)}
              className={styles.select}
            >
              <option value="MYR">MYR (Ringgit)</option>
              <option value="USD">USD (Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="SGD">SGD (Dollar)</option>
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <div className={styles.settingCard}>
            <div className={styles.settingIcon}><Globe size={20} /></div>
            <div className={styles.settingInfo}>
              <h3>Version</h3>
              <p>1.1 (Beta)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
