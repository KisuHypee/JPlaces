'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Toolbar from '@/components/Toolbar';
import Sidebar from '@/components/Sidebar';
import CategoryList from '@/components/CategoryList';
import AreaList from '@/components/AreaList';
import AddButton from '@/components/AddButton';
import { registerBackAction } from '@/lib/backButtonRegistry';
import styles from './page.module.css';


export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      return registerBackAction(() => {
        setIsMenuOpen(false);
        return true;
      });
    }
  }, [isMenuOpen]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(true);

  useEffect(() => {
    const loaded = localStorage.getItem('jplaces_loaded');
    if (!loaded) {
      setIsLoading(true);
      setHasLoadedBefore(false);
      localStorage.setItem('jplaces_loaded', 'true');
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="splash"
            className={styles.splash}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={styles.splashContent}
            >
              <h1 className={styles.splashLogo}>JPlaces</h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.main 
          key="content"
          className={styles.main}
          initial={hasLoadedBefore ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Toolbar 
            onMenuClick={() => setIsMenuOpen(!isMenuOpen)} 
            isOpen={isMenuOpen}
          />
          
          <Sidebar 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
          />

          <div className={styles.scrollContent}>
            <div className={styles.hero}>
              <h1 className={styles.headline}>Where to next?</h1>
            </div>

            <CategoryList />
            <AreaList />
            
            <div className={styles.footer_padding} />
          </div>

          <AddButton />
        </motion.main>
      )}
    </div>
  );
}
