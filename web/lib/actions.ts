'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from './db';

export async function addClothingAction(data: {
  name: string;
  photo_data: string[];
  tags: string[];
  comments: string;
  location_id: number | null;
  last_worn_date: string | null;
}): Promise<void> {
  const db = await getDb();
  await db.query(
    `INSERT INTO clothing_items (name, photo_data, tags, comments, location_id, last_worn_date)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [data.name, JSON.stringify(data.photo_data), data.tags, data.comments, data.location_id, data.last_worn_date || null]
  );
  revalidatePath('/');
  revalidatePath('/search');
  redirect('/');
}

export async function updateClothingAction(
  id: number,
  data: {
    name: string;
    photo_data: string[];
    tags: string[];
    comments: string;
    location_id: number | null;
    last_worn_date: string | null;
  }
): Promise<void> {
  const db = await getDb();
  await db.query(
    `UPDATE clothing_items
     SET name=$1, photo_data=$2, tags=$3, comments=$4, location_id=$5, last_worn_date=$6
     WHERE id=$7`,
    [data.name, JSON.stringify(data.photo_data), data.tags, data.comments, data.location_id, data.last_worn_date || null, id]
  );
  revalidatePath('/');
  revalidatePath(`/clothing/${id}`);
  revalidatePath('/search');
  redirect(`/clothing/${id}`);
}

export async function markAsWornTodayAction(id: number): Promise<void> {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  await db.query('UPDATE clothing_items SET last_worn_date=$1 WHERE id=$2', [today, id]);
  revalidatePath(`/clothing/${id}`);
  revalidatePath('/');
}

export async function deleteClothingAction(id: number): Promise<void> {
  const db = await getDb();
  await db.query('DELETE FROM clothing_items WHERE id=$1', [id]);
  revalidatePath('/');
  revalidatePath('/search');
  redirect('/');
}

export async function addLocationAction(data: {
  name: string;
  photo_data: string | null;
  description: string;
}): Promise<void> {
  const db = await getDb();
  await db.query(
    'INSERT INTO locations (name, photo_data, description) VALUES ($1, $2, $3)',
    [data.name, data.photo_data, data.description]
  );
  revalidatePath('/locations');
  redirect('/locations');
}

export async function updateLocationAction(
  id: number,
  data: { name: string; photo_data: string | null; description: string }
): Promise<void> {
  const db = await getDb();
  await db.query(
    'UPDATE locations SET name=$1, photo_data=$2, description=$3 WHERE id=$4',
    [data.name, data.photo_data, data.description, id]
  );
  revalidatePath('/locations');
  revalidatePath(`/locations/${id}`);
  redirect(`/locations/${id}`);
}

export async function deleteLocationAction(id: number): Promise<void> {
  const db = await getDb();
  await db.query('DELETE FROM locations WHERE id=$1', [id]);
  revalidatePath('/locations');
  redirect('/locations');
}
