'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Camera, Video, DollarSign, Sparkles, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '@/lib/db';
import styles from './page.module.css';

function AddLocationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(false);
  const [magicLink, setMagicLink] = useState('');
  const [areas, setAreas] = useState<string[]>(['Tokyo', 'Osaka', 'Kyoto', 'Fukuoka', 'Hokkaido']);
  const [showNewAreaInput, setShowNewAreaInput] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    area: 'Tokyo',
    description: '',
    googleMapsLink: '',
    socialLink: '',
    minPrice: '',
    maxPrice: '',
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch areas
      const locs = await db.locations.toArray();
      const uniqueAreas = Array.from(new Set(locs.map(l => l.area)));
      if (uniqueAreas.length > 0) {
        setAreas(prev => Array.from(new Set([...prev, ...uniqueAreas])));
      }

      // If editing, fetch location data
      if (id) {
        const loc = await db.locations.get(Number(id));
        if (loc) {
          setFormData({
            name: loc.name,
            category: loc.category,
            area: loc.area,
            description: loc.description || '',
            googleMapsLink: loc.googleMapsLink || '',
            socialLink: loc.socialLink || '',
            minPrice: String(loc.minPrice || ''),
            maxPrice: String(loc.maxPrice || ''),
          });
          setExistingImages(loc.images || []);
        }
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (id) return; // Don't auto-import if editing

    const sharedUrl = searchParams.get('url') || searchParams.get('text');
    const sharedTitle = searchParams.get('title');

    if (sharedUrl) {
      if (sharedUrl.includes('maps.google') || sharedUrl.includes('goo.gl/maps')) {
        setFormData(prev => ({ ...prev, googleMapsLink: sharedUrl, name: sharedTitle || 'Shared Location' }));
        handleMagicExtract(sharedUrl);
      } else {
        setFormData(prev => ({ ...prev, socialLink: sharedUrl, name: sharedTitle || 'Shared Spot' }));
      }
    }
  }, [searchParams, id]);

  const handleMagicExtract = async (link?: string) => {
    const targetLink = link || magicLink;
    if (!targetLink) return;
    setLoading(true);

    // Simulate AI extraction of images and data
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        googleMapsLink: targetLink.includes('maps') ? targetLink : prev.googleMapsLink,
        socialLink: !targetLink.includes('maps') ? targetLink : prev.socialLink,
        name: prev.name || (targetLink.includes('maps') ? 'Extracted Spot' : prev.name)
      }));
      setMagicLink('');
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const areaToSave = showNewAreaInput ? newAreaName : formData.area;

    const locationData = {
      name: formData.name,
      category: formData.category,
      area: areaToSave,
      description: formData.description,
      googleMapsLink: formData.googleMapsLink,
      socialLink: formData.socialLink,
      minPrice: Number(formData.minPrice) || 0,
      maxPrice: Number(formData.maxPrice) || 0,
      images: id ? existingImages : ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'],
      createdAt: id ? undefined : Date.now(),
    };

    if (id) {
      await db.locations.update(Number(id), locationData);
      router.replace(`/location?id=${id}`);
    } else {
      // Check for duplicate maps link only when adding new
      if (formData.googleMapsLink) {
        const existing = await db.locations
          .where('googleMapsLink')
          .equals(formData.googleMapsLink)
          .first();

        if (existing) {
          alert('This location already exists in your database!');
          return;
        }
      }

      await db.locations.add({ ...locationData, createdAt: Date.now() } as any);
      router.push('/');
    }
  };

  return (
    <div className={styles.container}>
      <header className={`${styles.header} glass`}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>{id ? 'Edit Location' : 'Add Location'}</h1>
      </header>

      <main className={styles.main}>
        {!id && (
          <div className={styles.magicSection}>
            <div className={styles.magicLabel}>
              <Sparkles size={16} className={styles.sparkle} />
              <span>Magic Import</span>
            </div>
            <p className={styles.magicHint}>Paste a Google Maps link to auto-extract info and images</p>
            <div className={styles.magicInputGroup}>
              <input
                type="text"
                placeholder="Paste link here..."
                value={magicLink}
                onChange={(e) => setMagicLink(e.target.value)}
                className={styles.input}
              />
              <button
                onClick={() => handleMagicExtract()}
                className={styles.magicBtn}
                disabled={loading}
              >
                {loading ? '...' : 'Import'}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ichiran Ramen"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>Food</option>
                <option>Sightseeing</option>
                <option>Shopping</option>
                <option>Hotel</option>
                <option>Onsen</option>
                <option>Nature</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Area</label>
              {!showNewAreaInput ? (
                <select
                  value={formData.area}
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') {
                      setShowNewAreaInput(true);
                    } else {
                      setFormData({ ...formData, area: e.target.value });
                    }
                  }}
                >
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  <option value="ADD_NEW">+ Add New Area</option>
                </select>
              ) : (
                <div className={styles.newAreaGroup}>
                  <input
                    autoFocus
                    type="text"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder="New Area Name"
                  />
                  <button type="button" onClick={() => setShowNewAreaInput(false)}>Cancel</button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional notes..."
            />
          </div>

          <div className={styles.field}>
            <label><MapPin size={14} /> Google Maps Link</label>
            <input
              type="text"
              value={formData.googleMapsLink}
              onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label><DollarSign size={14} /> Min Price (¥)</label>
              <input
                type="number"
                value={formData.minPrice}
                onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className={styles.field}>
              <label><DollarSign size={14} /> Max Price (¥)</label>
              <input
                type="number"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                placeholder="5000"
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            {id ? 'Update Location' : 'Save Location'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function AddLocation() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddLocationContent />
    </Suspense>
  );
}
