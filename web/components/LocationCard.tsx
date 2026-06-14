import Link from 'next/link';
import { type Location } from '@/types';

type Props = {
  location: Location;
  count?: number;
};

export default function LocationCard({ location, count }: Props) {
  return (
    <Link
      href={`/locations/${location.id}`}
      className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all"
    >
      <div className="w-20 h-20 shrink-0 bg-slate-100 overflow-hidden">
        {location.photo_data ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={location.photo_data} alt={location.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
        )}
      </div>
      <div className="flex-1 px-4 min-w-0">
        <p className="font-semibold text-slate-800">{location.name}</p>
        {location.description && (
          <p className="text-slate-500 text-sm mt-0.5 truncate">{location.description}</p>
        )}
        {count !== undefined && (
          <p className="text-indigo-400 text-xs mt-1">{count} {count === 1 ? 'item' : 'items'}</p>
        )}
      </div>
      <span className="text-slate-300 text-xl pr-4">›</span>
    </Link>
  );
}
