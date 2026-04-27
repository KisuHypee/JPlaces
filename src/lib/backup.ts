import { db } from './db';

export async function exportBackup() {
  const locations = await db.locations.toArray();
  const preferences = await db.preferences.toArray();
  
  const data = {
    version: '1.0.0',
    timestamp: Date.now(),
    locations,
    preferences
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `jplaces_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.locations) {
          await db.locations.clear();
          await db.locations.bulkAdd(data.locations);
        }
        
        if (data.preferences) {
          await db.preferences.clear();
          await db.preferences.bulkAdd(data.preferences);
        }
        
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}
