import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAllLocations } from '@/lib/queries';

export async function GET() {
  const db = await getDb();
  const locations = await getAllLocations(db);
  return NextResponse.json(locations);
}
