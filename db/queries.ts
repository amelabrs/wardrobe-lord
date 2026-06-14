import { type SQLiteDatabase } from 'expo-sqlite';
import { type ClothingItem, type DbClothingItem, type Location } from '@/types';

function parseClothingItem(row: DbClothingItem): ClothingItem {
  return {
    ...row,
    photo_uris: JSON.parse(row.photo_uris || '[]'),
    tags: JSON.parse(row.tags || '[]'),
  };
}

// --- Clothing queries ---

export async function getAllClothing(db: SQLiteDatabase): Promise<ClothingItem[]> {
  const rows = await db.getAllAsync<DbClothingItem>(
    `SELECT ci.*, l.name AS location_name
     FROM clothing_items ci
     LEFT JOIN locations l ON ci.location_id = l.id
     ORDER BY ci.created_at DESC`
  );
  return rows.map(parseClothingItem);
}

export async function getClothingById(db: SQLiteDatabase, id: number): Promise<ClothingItem | null> {
  const row = await db.getFirstAsync<DbClothingItem>(
    `SELECT ci.*, l.name AS location_name
     FROM clothing_items ci
     LEFT JOIN locations l ON ci.location_id = l.id
     WHERE ci.id = ?`,
    id
  );
  return row ? parseClothingItem(row) : null;
}

export async function getClothingByLocation(db: SQLiteDatabase, locationId: number): Promise<ClothingItem[]> {
  const rows = await db.getAllAsync<DbClothingItem>(
    `SELECT ci.*, l.name AS location_name
     FROM clothing_items ci
     LEFT JOIN locations l ON ci.location_id = l.id
     WHERE ci.location_id = ?
     ORDER BY ci.created_at DESC`,
    locationId
  );
  return rows.map(parseClothingItem);
}

export async function searchClothing(
  db: SQLiteDatabase,
  query: string,
  tags: string[]
): Promise<ClothingItem[]> {
  const rows = await db.getAllAsync<DbClothingItem>(
    `SELECT ci.*, l.name AS location_name
     FROM clothing_items ci
     LEFT JOIN locations l ON ci.location_id = l.id
     WHERE (? = '' OR LOWER(ci.name) LIKE LOWER('%' || ? || '%') OR LOWER(ci.comments) LIKE LOWER('%' || ? || '%'))
     ORDER BY ci.created_at DESC`,
    query, query, query
  );
  const parsed = rows.map(parseClothingItem);
  if (tags.length === 0) return parsed;
  return parsed.filter(item => tags.every(tag => item.tags.includes(tag)));
}

export async function addClothing(
  db: SQLiteDatabase,
  item: Omit<ClothingItem, 'id' | 'created_at' | 'location_name'>
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO clothing_items (name, photo_uris, tags, comments, location_id, last_worn_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    item.name,
    JSON.stringify(item.photo_uris),
    JSON.stringify(item.tags),
    item.comments,
    item.location_id,
    item.last_worn_date
  );
  return result.lastInsertRowId;
}

export async function updateClothing(
  db: SQLiteDatabase,
  id: number,
  item: Omit<ClothingItem, 'id' | 'created_at' | 'location_name'>
): Promise<void> {
  await db.runAsync(
    `UPDATE clothing_items
     SET name = ?, photo_uris = ?, tags = ?, comments = ?, location_id = ?, last_worn_date = ?
     WHERE id = ?`,
    item.name,
    JSON.stringify(item.photo_uris),
    JSON.stringify(item.tags),
    item.comments,
    item.location_id,
    item.last_worn_date,
    id
  );
}

export async function markAsWornToday(db: SQLiteDatabase, id: number): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await db.runAsync('UPDATE clothing_items SET last_worn_date = ? WHERE id = ?', today, id);
}

export async function deleteClothing(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM clothing_items WHERE id = ?', id);
}

// --- Location queries ---

export async function getAllLocations(db: SQLiteDatabase): Promise<Location[]> {
  return db.getAllAsync<Location>('SELECT * FROM locations ORDER BY name ASC');
}

export async function getLocationById(db: SQLiteDatabase, id: number): Promise<Location | null> {
  return db.getFirstAsync<Location>('SELECT * FROM locations WHERE id = ?', id);
}

export async function addLocation(
  db: SQLiteDatabase,
  loc: Omit<Location, 'id' | 'created_at'>
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO locations (name, photo_uri, description) VALUES (?, ?, ?)',
    loc.name,
    loc.photo_uri,
    loc.description
  );
  return result.lastInsertRowId;
}

export async function updateLocation(
  db: SQLiteDatabase,
  id: number,
  loc: Omit<Location, 'id' | 'created_at'>
): Promise<void> {
  await db.runAsync(
    'UPDATE locations SET name = ?, photo_uri = ?, description = ? WHERE id = ?',
    loc.name,
    loc.photo_uri,
    loc.description,
    id
  );
}

export async function deleteLocation(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM locations WHERE id = ?', id);
}
