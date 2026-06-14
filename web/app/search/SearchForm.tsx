'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PRESET_TAGS } from '@/constants/tags';

export default function SearchForm({
  initialQuery,
  initialTags,
}: {
  initialQuery: string;
  initialTags: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [activeTags, setActiveTags] = useState<string[]>(initialTags);

  const push = useCallback(
    (q: string, tags: string[]) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (tags.length) params.set('tags', tags.join(','));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  function toggleTag(tag: string) {
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag];
    setActiveTags(next);
    push(query, next);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    push(query, activeTags);
  }

  return (
    <div className="mb-5">
      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <input
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-400"
          placeholder="Search name or comments…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors">
          Search
        </button>
        {(query || activeTags.length > 0) && (
          <button
            type="button"
            onClick={() => { setQuery(''); setActiveTags([]); router.push(pathname); }}
            className="px-4 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:border-slate-300"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex flex-wrap">
        {PRESET_TAGS.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full border text-sm font-medium mr-2 mb-2 transition-colors ${
                active ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
