import { type Pool } from 'pg';
import { type ClothingItem, type Location } from '@/types';

const CLOTHING_SELECT = `
  SELECT ci.id, ci.name, ci.photo_data, ci.tags, ci.comments,
         ci.location_id, ci.last_worn_date::text, ci.created_at::text,
         l.name AS location_name
  FROM clothing_items ci
  LEFT JOIN locations l ON ci.location_id = l.id
`;

export async function getAllClothing(db: Pool): Promise<ClothingItem[]> {
  const r = await db.query<ClothingItem>(`${CLOTHING_SELECT} ORDER BY ci.created_at DESC`);
  return r.rows;
}

export async function getClothingById(db: Pool, id: number): Promise<ClothingItem | null> {
  const r = await db.query<ClothingItem>(`${CLOTHING_SELECT} WHERE ci.id = $1`, [id]);
  return r.rows[0] ?? null;
}

export async function getClothingByLocation(db: Pool, locationId: number): Promise<ClothingItem[]> {
  const r = await db.query<ClothingItem>(`${CLOTHING_SELECT} WHERE ci.location_id = $1 ORDER BY ci.created_at DESC`, [locationId]);
  return r.rows;
}

export async function searchClothing(
  db: Pool,
  query: string,
  tags: string[]
): Promise<ClothingItem[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (query) {
    conditions.push(`(LOWER(ci.name) LIKE LOWER($${idx}) OR LOWER(ci.comments) LIKE LOWER($${idx}))`);
    params.push(`%${query}%`);
    idx++;
  }
  if (tags.length > 0) {
    conditions.push(`ci.tags @> $${idx}::TEXT[]`);
    params.push(tags);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const r = await db.query<ClothingItem>(`${CLOTHING_SELECT} ${where} ORDER BY ci.created_at DESC`, params);
  return r.rows;
}

export async function getAllLocations(db: Pool): Promise<Location[]> {
  const r = await db.query<Location>('SELECT id, name, photo_data, description, created_at::text FROM locations ORDER BY name ASC');
  return r.rows;
}

export async function getLocationById(db: Pool, id: number): Promise<Location | null> {
  const r = await db.query<Location>('SELECT id, name, photo_data, description, created_at::text FROM locations WHERE id = $1', [id]);
  return r.rows[0] ?? null;
}

export async function getClothingCountByLocation(db: Pool): Promise<Record<number, number>> {
  const r = await db.query<{ location_id: number; count: string }>(
    'SELECT location_id, COUNT(*) as count FROM clothing_items WHERE location_id IS NOT NULL GROUP BY location_id'
  );
  return Object.fromEntries(r.rows.map((row) => [row.location_id, parseInt(row.count)]));
}
