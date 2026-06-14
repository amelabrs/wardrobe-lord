'use client';

import { useState } from 'react';
import { updateClothingAction } from '@/lib/actions';
import ImageUpload from '@/components/ImageUpload';
import TagChip from '@/components/TagChip';
import { PRESET_TAGS } from '@/constants/tags';
import { type ClothingItem } from '@/types';

export default function EditClothingForm({ item }: { item: ClothingItem }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [photos, setPhotos] = useState<string[]>(item.photo_data);
  const [tags, setTags] = useState<string[]>(item.tags);
  const [customTag, setCustomTag] = useState('');
  const [comments, setComments] = useState(item.comments);
  const [storedIn, setStoredIn] = useState(item.stored_in);
  const [pairsWellWith, setPairsWellWith] = useState(item.pairs_well_with);
  const [lastWorn, setLastWorn] = useState(item.last_worn_date ?? '');
  const [saving, setSaving] = useState(false);

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setCustomTag('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateClothingAction(item.id, {
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
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">Edit Item</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Photos</label>
                <ImageUpload images={photos} onChange={setPhotos} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Tags</label>
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
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                    placeholder="Add custom tag…"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  />
                  <button type="button" onClick={addCustomTag} className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium">Add</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Comments</label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400 resize-none"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Stored In</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. Left shelf, Top drawer…"
                  value={storedIn}
                  onChange={(e) => setStoredIn(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Pairs Well With</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. Black chinos, White sneakers…"
                  value={pairsWellWith}
                  onChange={(e) => setPairsWellWith(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Last Worn</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setLastWorn(new Date().toISOString().split('T')[0])} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-indigo-300">Today</button>
                  <input type="date" className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-400" value={lastWorn} onChange={(e) => setLastWorn(e.target.value)} />
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full bg-indigo-500 text-white py-3 rounded-2xl font-bold hover:bg-indigo-600 disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
