'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Share2, MapPin, Camera, Video, Bookmark, BookmarkCheck, ExternalLink, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { db, type Location } from '@/lib/db';
import styles from './page.module.css';

function LocationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!id) return;
      const loc = await db.locations.get(Number(id));
      if (loc) setLocation(loc);
    };
    fetchLocation();
  }, [id]);

  if (!id) return <div className={styles.container}><p>No location specified.</p></div>;
  if (!location) return null;

  const handleShare = () => {
    const link = location.googleMapsLink || location.socialLink;
    if (navigator.share && link) {
      navigator.share({
        title: location.name,
        text: `Check out this spot in ${location.area}!`,
        url: link,
      });
    } else {
      alert('Share link copied to clipboard!');
      if (link) navigator.clipboard.writeText(link);
    }
  };

  const images = location.images || [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={24} />
        </button>
        <div className={styles.logo}>JPlaces</div>
        <div className={styles.headerActions}>
          <Link href={`/add?id=${id}`} className={styles.editBtn}>
            <Pencil size={22} />
          </Link>
          <button onClick={handleShare} className={styles.shareBtn}>
            <Share2 size={24} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.gallery}>
          <div className={styles.galleryTrack}>
            {images.length > 0 ? (
              images.map((img, index) => (
                <div key={index} className={styles.galleryItem}>
                  <img src={img} alt={`${location.name} ${index + 1}`} className={styles.galleryImage} />
                  <div className={styles.imageCounter}>{index + 1}/{images.length}</div>
                </div>
              ))
            ) : (
              <div className={styles.galleryItem}>
                <div className={styles.galleryPlaceholder}>
                  <MapPin size={48} color="rgba(255,255,255,0.5)" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.headerInfo}>
            <div className={styles.titleGroup}>
              <span className={styles.areaLabel}>{location.area}</span>
              <h1 className={styles.name}>{location.name}</h1>
              <span className={styles.categoryLabel}>{location.category}</span>
            </div>
            <button
              className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
              onClick={() => setIsSaved(!isSaved)}
            >
              {isSaved ? <BookmarkCheck size={28} /> : <Bookmark size={28} />}
            </button>
          </div>

          <div className={styles.expenseSection}>
            <div className={styles.expenseTag}>
              <span className={styles.expenseLabel}>Expected: </span>
              {location.minPrice === 0 && location.maxPrice === 0 ? 'Free' :
                location.minPrice === location.maxPrice ? `¥${location.minPrice?.toLocaleString()}` :
                  `¥${location.minPrice?.toLocaleString()} - ¥${location.maxPrice?.toLocaleString()}`}
            </div>
          </div>


          {location.description && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Description</h2>
              <p className={styles.description}>{location.description}</p>
            </div>
          )}

          <div className={styles.links}>
            {location.googleMapsLink && (
              <a href={location.googleMapsLink} target="_blank" className={styles.linkCard}>
                <div className={styles.linkIcon}><MapPin size={20} /></div>
                <span>Google Maps</span>
                <ExternalLink size={16} className={styles.ext} />
              </a>
            )}
            {location.socialLink && (
              <a href={location.socialLink} target="_blank" className={styles.linkCard}>
                <div className={styles.linkIcon}>
                  {location.socialLink.includes('youtube') ? <Video size={20} /> : <Camera size={20} />}
                </div>

                <span>Social Media</span>
                <ExternalLink size={16} className={styles.ext} />
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LocationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LocationContent />
    </Suspense>
  );
}
