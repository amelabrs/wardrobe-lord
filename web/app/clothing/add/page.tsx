'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addClothingAction } from '@/lib/actions';
import ImageUpload from '@/components/ImageUpload';
import TagChip from '@/components/TagChip';
import { PRESET_TAGS } from '@/constants/tags';

export default function AddClothingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [comments, setComments] = useState('');
  const [storedIn, setStoredIn] = useState('');
  const [pairsWellWith, setPairsWellWith] = useState('');
  const [lastWorn, setLastWorn] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setCustomTag('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await addClothingAction({
        name: name.trim(),
        photo_data: photos,
        tags,
        comments: comments.trim(),
        location_id: null,
        stored_in: storedIn.trim(),
        pairs_well_with: pairsWellWith.trim(),
        last_worn_date: lastWorn || null,
      });
    } catch {
      setSaving(false);
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">‹</button>
        <h1 className="text-xl font-bold text-slate-800">Add Clothing</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}

        <Section label="Photos">
          <ImageUpload images={photos} onChange={setPhotos} />
        </Section>

        <Section label="Name *">
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400"
            placeholder="e.g. Blue Linen Shirt"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Section>

        <Section label="Tags">
          <div className="flex flex-wrap">
            {PRESET_TAGS.map((t) => (
              <TagChip key={t} label={t} selected={tags.includes(t)} onToggle={() => toggleTag(t)} />
            ))}
            {tags.filter((t) => !PRESET_TAGS.includes(t)).map((t) => (
              <TagChip key={t} label={t} selected onToggle={() => toggleTag(t)} />
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <input
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400"
              placeholder="Add custom tag…"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
            />
            <button type="button" onClick={addCustomTag} className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600">
              Add
            </button>
          </div>
        </Section>

        <Section label="Comments">
          <textarea
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400 resize-none"
            placeholder="Notes about this item…"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </Section>

        <Section label="Stored In">
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400"
            placeholder="e.g. Left shelf, Top drawer…"
            value={storedIn}
            onChange={(e) => setStoredIn(e.target.value)}
          />
        </Section>

        <Section label="Pairs Well With">
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400"
            placeholder="e.g. Black chinos, White sneakers…"
            value={pairsWellWith}
            onChange={(e) => setPairsWellWith(e.target.value)}
          />
        </Section>

        <Section label="Last Worn">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLastWorn(new Date().toISOString().split('T')[0])}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-indigo-300"
            >
              Today
            </button>
            <input
              type="date"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-400"
              value={lastWorn}
              onChange={(e) => setLastWorn(e.target.value)}
            />
          </div>
        </Section>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-500 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-600 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Item'}
        </button>
      </form>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}
