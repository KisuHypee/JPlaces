'use client';

import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  onMenuClick: () => void;
  isOpen?: boolean;
}

export default function Toolbar({ onMenuClick, isOpen }: ToolbarProps) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <button className={styles.iconButton} onClick={onMenuClick}>
          {isOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
        </button>

        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>JPlaces</h1>
        </div>

        <Link href="/search" className={styles.iconButton}>
          <Search size={24} color="white" />
        </Link>
      </div>
    </header>
  );
}
