import Dexie, { type Table } from 'dexie';

export interface Location {
  id?: number;
  name: string;
  category: string;
  area: string;
  description?: string;
  googleMapsLink?: string;
  socialLink?: string; // Reel/Shorts link
  expectedExpenses?: string; // Range/Free
  currency?: string; // Stored currency code
  yenValue?: number; // Normalized value in Yen
  images: string[]; // Base64 or Blob URLs
  minPrice?: number; // Minimum in Yen
  maxPrice?: number; // Maximum in Yen
  createdAt: number;
}



export interface Preference {
  key: string;
  value: any;
}

export class JPlacesDB extends Dexie {
  locations!: Table<Location>;
  preferences!: Table<Preference>;

  constructor() {
    super('JPlacesDB');
    this.version(1).stores({
      locations: '++id, name, category, area, googleMapsLink, createdAt',
      preferences: 'key'
    });
  }
}

export const db = new JPlacesDB();
