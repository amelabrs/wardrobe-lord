import Link from 'next/link';
import { type ClothingItem } from '@/types';

function formatLastWorn(date: string | null): string {
  if (!date) return 'Never worn';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diff === 0) return 'Worn today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}

export default function ClothingCard({ item }: { item: ClothingItem }) {
  const photo = item.photo_data?.[0];

  return (
    <Link
      href={`/clothing/${item.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all group"
    >
      <div className="aspect-square bg-slate-100 overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">👗</div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
        <p className="text-slate-400 text-xs mt-0.5">{formatLastWorn(item.last_worn_date)}</p>
        {item.tags.length > 0 && (
          <p className="text-indigo-400 text-xs mt-1 truncate">{item.tags.slice(0, 3).join(' · ')}</p>
        )}
      </div>
    </Link>
  );
}
