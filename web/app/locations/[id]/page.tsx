export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getLocationById, getClothingByLocation } from '@/lib/queries';
import { deleteLocationAction } from '@/lib/actions';
import ClothingCard from '@/components/ClothingCard';
import EditLocationForm from './EditLocationForm';

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const [location, clothes] = await Promise.all([
    getLocationById(db, Number(id)),
    getClothingByLocation(db, Number(id)),
  ]);
  if (!location) notFound();

  const deleteLocation = deleteLocationAction.bind(null, location.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/locations" className="text-slate-400 hover:text-slate-600 text-2xl leading-none">‹</Link>
        <h1 className="text-xl font-bold text-slate-800 flex-1">{location.name}</h1>
        <EditLocationForm location={location} />
      </div>

      {location.photo_data && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={location.photo_data}
          alt={location.name}
          className="w-full h-52 object-cover rounded-2xl bg-slate-100 mb-5"
        />
      )}

      {location.description && (
        <p className="text-slate-600 mb-5">{location.description}</p>
      )}

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Stored Here ({clothes.length})
      </h2>

      {clothes.length === 0 ? (
        <p className="text-slate-400 text-sm mb-6">No items stored here yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {clothes.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <form action={deleteLocation}>
        <button
          className="w-full border border-red-200 text-red-500 py-3 rounded-2xl font-semibold hover:bg-red-50 transition-colors"
          onClick={(e) => { if (!confirm(`Delete "${location.name}"? Items stored here will be unassigned.`)) e.preventDefault(); }}
        >
          Delete Location
        </button>
      </form>
    </div>
  );
}
