'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, MapPin, Plus } from 'lucide-react';
import { db } from '@/lib/db';
import styles from './AreaList.module.css';


const AREA_IMAGES: Record<string, string> = {
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  osaka: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  nara: 'https://images.unsplash.com/photo-1545562083-a600704fa487?auto=format&fit=crop&w=800&q=80',
  fukuoka: 'https://images.unsplash.com/photo-1601823984263-b87b59798b70?auto=format&fit=crop&w=800&q=80',
  hiroshima: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=800&q=80',
  sapporo: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
  hokkaido: 'https://images.unsplash.com/photo-1582981504260-2216891a6136?auto=format&fit=crop&w=800&q=80',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80';

const BASE_AREAS = ['Tokyo', 'Osaka', 'Kyoto', 'Fukuoka', 'Hokkaido'];


export default function AreaList() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [areas, setAreas] = useState<{ id: string; name: string; image: string }[]>([]);

  useEffect(() => {
    const loadAreas = async () => {
      const locs = await db.locations.toArray();
      const dbAreas = Array.from(new Set(locs.map(l => l.area))).filter(Boolean).sort();
      setAreas(
        dbAreas.map(name => ({
          id: name.toLowerCase(),
          name,
          image: AREA_IMAGES[name.toLowerCase()] ?? FALLBACK_IMAGE,
        }))
      );
    };
    loadAreas();
  }, []);

  const displayedAreas = showAll ? areas : areas.slice(0, 3);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Areas</h2>
        {areas.length > 3 && (
          <button className={styles.showMore} onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : 'Show more'}
            <ChevronRight size={16} className={showAll ? styles.rotate : ''} />
          </button>
        )}
      </div>

      {areas.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <MapPin size={40} />
          </div>
          <h3 className={styles.emptyTitle}>No Areas Yet</h3>
          <p className={styles.emptyText}>Add your favorite spots to see them organized here.</p>
          <button onClick={() => router.push('/add')} className={styles.addBtn}>
            <Plus size={18} />
            Add Location
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {displayedAreas.map((area) => (
            <div
              key={area.id}
              className={styles.areaCard}
              onClick={() => router.push(`/search?area=${area.name}`)}
            >
              <img src={area.image} alt={area.name} className={styles.image} />
              <div className={styles.cardContent}>
                <h3 className={styles.areaName}>{area.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
