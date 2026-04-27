import { Utensils, Camera, ShoppingBag, Hotel, Bath, Trees } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './CategoryList.module.css';

const CATEGORIES = [
  { id: 'food', name: 'Food', icon: Utensils },
  { id: 'sightseeing', name: 'Sightseeing', icon: Camera },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag },
  { id: 'hotels', name: 'Hotel', icon: Hotel },
  { id: 'onsen', name: 'Onsen', icon: Bath },
  { id: 'nature', name: 'Nature', icon: Trees },
];

export default function CategoryList() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Categories</h2>
      <div className={styles.grid}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button 
              key={cat.id} 
              className={styles.card}
              onClick={() => router.push(`/search?category=${cat.name}`)}
            >
              <div className={styles.iconWrapper}>
                <Icon size={24} />
              </div>
              <span className={styles.label}>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
