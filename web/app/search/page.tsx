export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';
import { searchClothing } from '@/lib/queries';
import ClothingCard from '@/components/ClothingCard';
import SearchForm from './SearchForm';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tags?: string }>;
}) {
  const { q = '', tags: tagsParam = '' } = await searchParams;
  const activeTags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];

  const db = await getDb();
  const results = await searchClothing(db, q, activeTags);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Search</h1>
      <SearchForm initialQuery={q} initialTags={activeTags} />

      {(q || activeTags.length > 0) && (
        <p className="text-slate-400 text-sm mb-4">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </p>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {results.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      ) : (q || activeTags.length > 0) ? (
        <div className="text-center py-16 text-slate-400">No items match your search.</div>
      ) : (
        <div className="text-center py-16 text-slate-400">Use the search bar or tag filters above.</div>
      )}
    </div>
  );
}
