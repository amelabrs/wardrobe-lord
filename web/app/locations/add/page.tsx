'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addLocationAction } from '@/lib/actions';
import ImageUpload from '@/components/ImageUpload';

export default function AddLocationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await addLocationAction({
        name: name.trim(),
        photo_data: photos[0] ?? null,
        description: description.trim(),
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
        <h1 className="text-xl font-bold text-slate-800">Add Location</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location Photo</label>
          <ImageUpload images={photos} onChange={setPhotos} max={1} aspect="landscape" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Name *</label>
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400"
            placeholder="e.g. Loft, Right Box, Blue Bag"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</label>
          <textarea
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-400 resize-none"
            placeholder="e.g. Top shelf in the bedroom cupboard"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-500 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-600 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Location'}
        </button>
      </form>
    </div>
  );
}
