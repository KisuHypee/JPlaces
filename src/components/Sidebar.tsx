'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Bookmark, 
  Database, 
  Upload, 
  Info, 
  X,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { exportBackup, importBackup } from '@/lib/backup';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importBackup(file);
        alert('Backup imported successfully!');
        window.location.reload();
      } catch (err) {
        alert('Failed to import backup.');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside 
            className={styles.sidebar}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>Menu</h2>
            </div>

            <nav className={styles.nav}>
              <button className={styles.navItem}>
                <Bookmark size={20} />
                <span>Saved Playlists</span>
              </button>
              
              <Link href="/settings" className={styles.navItem} onClick={onClose}>
                <Settings size={20} />
                <span>Settings</span>
              </Link>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Backups</h3>
                <button className={styles.navItem} onClick={() => { exportBackup(); onClose(); }}>
                  <Database size={20} />
                  <span>Create Backup</span>
                </button>
                <label className={styles.navItem}>
                  <Upload size={20} />
                  <span>Import Backup</span>
                  <input type="file" hidden accept=".json" onChange={handleImport} />
                </label>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>App</h3>
                <button className={styles.navItem}>
                  <Info size={20} />
                  <span>Credits</span>
                </button>
              </div>
            </nav>

            <div className={styles.footer}>
              <p>JPlaces v1.1</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
