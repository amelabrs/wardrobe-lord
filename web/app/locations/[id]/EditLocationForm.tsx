'use client';

import { useState } from 'react';
import { updateLocationAction } from '@/lib/actions';
import ImageUpload from '@/components/ImageUpload';
import { type Location } from '@/types';

export default function EditLocationForm({ location }: { location: Location }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(location.name);
  const [photos, setPhotos] = useState<string[]>(location.photo_data ? [location.photo_data] : []);
  const [description, setDescription] = useState(location.description);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateLocationAction(location.id, {
        name: name.trim(),
        photo_data: photos[0] ?? null,
        description: description.trim(),
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
              <h2 className="font-bold text-slate-800 text-lg">Edit Location</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Photo</label>
                <ImageUpload images={photos} onChange={setPhotos} max={1} aspect="landscape" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Description</label>
                <textarea className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400 resize-none" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
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
