'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search as SearchIcon, Filter, SlidersHorizontal, MapPin, ArrowDownAZ, ArrowUpAZ, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { db, type Location } from '@/lib/db';
import styles from './page.module.css';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeArea, setActiveArea] = useState('All');
  const [areas, setAreas] = useState<string[]>(['All']);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const CATEGORIES = ['All', 'Food', 'Sightseeing', 'Shopping', 'Hotel', 'Onsen', 'Nature'];

  // Load filters dynamically from DB
  useEffect(() => {
    const loadFilters = async () => {
      const locs = await db.locations.toArray();
      const dbAreas = Array.from(new Set(locs.map(l => l.area))).filter(Boolean).sort();
      const allAreas = ['All', ...dbAreas];
      setAreas(allAreas);

      // Read and validate params
      const catParam = searchParams.get('category');
      const areaParam = searchParams.get('area');

      if (catParam && CATEGORIES.includes(catParam)) {
        setActiveCategory(catParam);
      } else {
        setActiveCategory('All');
      }

      if (areaParam && allAreas.includes(areaParam)) {
        setActiveArea(areaParam);
      } else {
        setActiveArea('All');
      }
    };
    loadFilters();
  }, [searchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      let locations = await db.locations.toArray();

      if (query) {
        locations = locations.filter(l =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.description?.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (activeCategory !== 'All') {
        locations = locations.filter(l => l.category === activeCategory);
      }

      if (activeArea !== 'All') {
        locations = locations.filter(l => l.area === activeArea);
      }

      // Sort results
      locations.sort((a, b) => {
        if (sortOrder === 'asc') return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
      });

      setResults(locations);
    };

    fetchResults();
  }, [query, activeCategory, activeArea, sortOrder]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this location?')) {
      await db.locations.delete(id);
      setResults(prev => prev.filter(loc => loc.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <header className={`${styles.header} glass`}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={24} />
        </button>
        <div className={styles.searchWrapper}>
          <SearchIcon size={18} className={styles.searchIcon} />
          <input
            autoFocus
            type="text"
            placeholder="Search spots..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button 
          className={styles.sortBtn} 
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          title={sortOrder === 'asc' ? 'Sort A-Z' : 'Sort Z-A'}
        >
          {sortOrder === 'asc' ? <ArrowDownAZ size={22} /> : <ArrowUpAZ size={22} />}
        </button>
      </header>

      <div className={styles.filterSection}>
        <div className={styles.filterScroll}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.filterBlob} ${activeCategory === cat ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className={styles.filterScroll}>
          {areas.map(area => (
            <button
              key={area}
              className={`${styles.filterBlob} ${activeArea === area ? styles.active : ''}`}
              onClick={() => setActiveArea(area)}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      <main className={styles.main}>
        {results.length === 0 ? (
          <div className={styles.empty}>
            <p>No spots found.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {results.map((loc) => (
              <motion.div
                key={loc.id}
                className={styles.locationCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(`/location?id=${loc.id}`)}
              >
                <div className={styles.cardImagePlaceholder}>
                  {loc.images && loc.images.length > 0 ? (
                    <img src={loc.images[0]} alt={loc.name} className={styles.cardImage} />
                  ) : (
                    <MapPin size={24} color="var(--sakura-pink)" />
                  )}
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{loc.name}</h3>
                  <p className={styles.cardMeta}>{loc.area} • {loc.category}</p>
                </div>
                <button 
                  className={styles.deleteBtn}
                  onClick={(e) => loc.id && handleDelete(e, loc.id)}
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
