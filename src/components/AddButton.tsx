'use client';

import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './AddButton.module.css';

export default function AddButton() {
  return (
    <Link href="/add">
      <motion.button 
        className={styles.fab}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.5 }}

      >
        <Plus size={32} color="white" />
      </motion.button>
    </Link>
  );
}
