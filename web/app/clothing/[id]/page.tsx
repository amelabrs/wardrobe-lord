export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getClothingById } from '@/lib/queries';
import { markAsWornTodayAction, deleteClothingAction } from '@/lib/actions';
import TagChip from '@/components/TagChip';
import EditClothingForm from './EditClothingForm';

function formatLastWorn(date: string | null): string {
  if (!date) return 'Never worn';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diff === 0) return 'Worn today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return `${Math.floor(diff / 30)} months ago`;
}

export default async function ClothingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const item = await getClothingById(db, Number(id));
  if (!item) notFound();

  const markWorn = markAsWornTodayAction.bind(null, item.id);
  const deleteItem = deleteClothingAction.bind(null, item.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-slate-400 hover:text-slate-600 text-2xl leading-none">‹</Link>
        <h1 className="text-xl font-bold text-slate-800 flex-1">{item.name}</h1>
        <EditClothingForm item={item} />
      </div>

      {/* Photos */}
      {item.photo_data.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
          {item.photo_data.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={item.name}
              className="h-56 w-56 object-cover rounded-2xl shrink-0 bg-slate-100"
            />
          ))}
        </div>
      )}

      {/* Details grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-5 mb-5">
        <DetailRow label="Last Worn">
          <div className="flex items-center gap-3">
            <span className="text-slate-700">{formatLastWorn(item.last_worn_date)}</span>
            <form action={markWorn}>
              <button className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
                Mark as worn today
              </button>
            </form>
          </div>
        </DetailRow>

        <DetailRow label="Location">
          <span className="text-slate-700">{item.location_name || 'Not assigned'}</span>
        </DetailRow>

        <DetailRow label="Tags">
          {item.tags.length > 0 ? (
            <div className="flex flex-wrap mt-1">
              {item.tags.map((tag) => (
                <TagChip key={tag} label={tag} selected small />
              ))}
            </div>
          ) : (
            <span className="text-slate-400">No tags</span>
          )}
        </DetailRow>

        {item.comments && (
          <DetailRow label="Comments">
            <p className="text-slate-700 whitespace-pre-wrap">{item.comments}</p>
          </DetailRow>
        )}
      </div>

      {/* Delete */}
      <form action={deleteItem}>
        <button
          className="w-full border border-red-200 text-red-500 py-3 rounded-2xl font-semibold hover:bg-red-50 transition-colors"
          onClick={(e) => { if (!confirm(`Delete "${item.name}"?`)) e.preventDefault(); }}
        >
          Delete Item
        </button>
      </form>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      {children}
    </div>
  );
}
