export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getAllLocations, getClothingCountByLocation } from '@/lib/queries';
import LocationCard from '@/components/LocationCard';

export default async function LocationsPage() {
  const db = await getDb();
  const [locations, counts] = await Promise.all([getAllLocations(db), getClothingCountByLocation(db)]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Storage Locations</h1>
          <p className="text-slate-500 text-sm mt-0.5">{locations.length} {locations.length === 1 ? 'location' : 'locations'}</p>
        </div>
        <Link href="/locations/add" className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors">
          + Add Location
        </Link>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-slate-700 text-lg font-semibold">No locations yet</p>
          <p className="text-slate-400 text-sm mt-2 mb-6">Add places like "loft", "right box", or "blue bag" with a photo so you can find clothes easily.</p>
          <Link href="/locations/add" className="bg-indigo-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-600 transition-colors">
            Add First Location
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {locations.map((loc) => (
            <LocationCard key={loc.id} location={loc} count={counts[loc.id] ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
