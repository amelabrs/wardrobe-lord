export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getAllClothing } from '@/lib/queries';
import ClothingCard from '@/components/ClothingCard';

export default async function WardrobePage() {
  const db = await getDb();
  const items = await getAllClothing(db);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Wardrobe</h1>
          <p className="text-slate-500 text-sm mt-0.5">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <Link
          href="/clothing/add"
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors"
        >
          + Add Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">👗</p>
          <p className="text-slate-700 text-lg font-semibold">Your wardrobe is empty</p>
          <p className="text-slate-400 text-sm mt-2 mb-6">Add your first item to get started.</p>
          <Link
            href="/clothing/add"
            className="bg-indigo-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-600 transition-colors"
          >
            Add First Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
